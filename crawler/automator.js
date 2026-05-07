require('dotenv').config();
const { Pool } = require('pg');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios'); // <-- Dodany moduł do weryfikacji linków w locie
puppeteer.use(StealthPlugin());

// ==========================================
// ⚙️ KONFIGURACJA BAZY DANYCH
// ==========================================
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// ==========================================
// 🛡️ WERYFIKATOR LINKÓW (BEZWZGLĘDNY ACID TEST)
// ==========================================
async function verifyVideoLink(url, source) {
    try {
        // Usuwamy całkowicie fałszywy 'Referer'.
        // Testujemy link dokładnie tak, jak zrobi to przeglądarka użytkownika.
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
            'Range': 'bytes=0-1024'
        };

        const response = await axios.get(url, { headers, timeout: 7000 });

        if (response.status === 200 || response.status === 206) {
            return true;
        }
        return false;
    } catch (error) {
        const status = error.response ? error.response.status : error.message;
        console.log(`      ⚠️ Link oblał Acid Test (Odrzucony w środowisku zewnętrznym: ${status})`);
        return false;
    }
}

// ==========================================
// 🧠 SILNIK PUNKTACJI (SCORING ENGINE)
// ==========================================
function calculateScore(stream) {
    let score = 0;
    if (stream.type === 'm3u8') score += 1000;
    else if (stream.type === 'mp4') score += 500;

    if (stream.quality === '1080p') score += 300;
    else if (stream.quality === '720p') score += 200;
    else score += 150;

    // Bonus za stabilność hostingu
    if (stream.source === 'CDA') score += 50;
    if (stream.source === 'VK') score += 40;
    if (stream.source === 'Filemoon') score -= 20; // Filemoon czasem ma dużo reklam/wolne serwery

    return score;
}

// ==========================================
// 🚀 GŁÓWNY ROUTER EKSTRAKCJI
// ==========================================
async function extractStreamData(browser, embedUrl) {
    if (!embedUrl) return null;
    const url = embedUrl.toLowerCase();

    if (url.includes('cda.pl')) return await extractFromCda(browser, embedUrl);
    if (url.includes('sibnet.ru')) return await extractFromSibnet(browser, embedUrl);
    if (url.includes('dailymotion.com')) return await extractFromDailymotion(browser, embedUrl);
    if (url.includes('vk.com')) return await extractFromVk(browser, embedUrl);

    // 🔥 Reaguje na oryginalnego Filemoona ORAZ na nasze zakamuflowane domeny (np. bysesukior.com?provider=filemoon)
    if (url.includes('filemoon') || url.includes('provider=filemoon')) {
        return await extractFromFilemoon(browser, embedUrl);
    }

    return null;
}

// ==========================================
// 🎬 WTYCZKI DO PLAYERÓW
// ==========================================
// ==========================================
// 🎬 WTYCZKA CDA (Tylko HLS/m3u8)
// ==========================================
async function extractFromCda(browser, embedUrl) {
    const page = await browser.newPage();
    let targetM3u8 = null;
    await page.setRequestInterception(true);

    const blackList = ['reklama', 'pre-roll', 'ads', 'gemius', 'analytics'];

    page.on('request', request => {
        const url = request.url();
        if (blackList.some(word => url.toLowerCase().includes(word))) {
            request.abort();
            return;
        }

        // INTERESUJE NAS TYLKO KULOODPORNE M3U8
        if (url.includes('.m3u8')) {
            targetM3u8 = url;
        }
        request.continue();
    });

    try {
        await page.setExtraHTTPHeaders({ 'Referer': 'https://www.cda.pl/' });

        const hdEmbedUrl = embedUrl.includes('?') ? `${embedUrl}&wersja=1080p` : `${embedUrl}?wersja=1080p`;
        await page.goto(hdEmbedUrl, { waitUntil: 'networkidle2', timeout: 30000 });

        await page.mouse.click(400, 300);
        await new Promise(r => setTimeout(r, 6000));
    } catch (err) {
        console.error('   ⚠️ [CDA] Błąd wczytywania playera:', err.message);
    } finally {
        await page.close();

        // ZWRACAMY WYNIK TYLKO JEŚLI MAMY M3U8
        if (targetM3u8) {
            return { url: targetM3u8, type: 'm3u8', quality: '1080p', source: 'CDA' };
        } else {
            console.log('   ⚠️ [CDA] Znaleziono tylko pliki .mp4. Są one niekompatybilne z React Playerem. Odrzucam źródło CDA.');
            return null; // Zwracamy null, co zmusi główną pętlę do przetestowania Sibnetu!
        }
    }
}
async function extractFromDailymotion(browser, embedUrl) {
    const page = await browser.newPage();
    let m3u8Url = null;
    await page.setRequestInterception(true);
    page.on('request', r => {
        if (r.url().includes('.m3u8')) m3u8Url = r.url();
        r.continue();
    });
    try {
        await page.goto(embedUrl, { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 4000));
    } finally {
        await page.close();
        return m3u8Url ? { url: m3u8Url, type: 'm3u8', quality: 'unknown', source: 'Dailymotion' } : null;
    }
}
async function extractFromVk(browser, embedUrl) {
    const page = await browser.newPage();
    let m3u8Url = null;
    await page.setRequestInterception(true);
    page.on('request', r => {
        if (r.url().includes('.m3u8') || r.url().includes('.mp4')) m3u8Url = r.url();
        r.continue();
    });
    try {
        await page.goto(embedUrl, { waitUntil: 'networkidle2' });
    } finally {
        await page.close();
        return m3u8Url ? { url: m3u8Url, type: m3u8Url.includes('.m3u8') ? 'm3u8' : 'mp4', quality: 'unknown', source: 'VK' } : null;
    }
}
async function extractFromFilemoon(browser, embedUrl) {
    // --- 1. IZOLACJA SESJI (Każdy odcinek to "nowy" użytkownik) ---
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    let streamUrl = null;

    // Ukrywanie bota przed ładowaniem strony
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
        window.chrome = { runtime: {} };
    });

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

    // --- 2. HERMETYCZNY BLOKER REKLAM (Podpięty tylko pod to konkretne Incognito) ---
    const popupBlocker = async (target) => {
        if (target.type() === 'page') {
            const newPage = await target.page();
            if (newPage && newPage !== page) {
                await newPage.close().catch(() => {});
            }
        }
    };
    context.on('targetcreated', popupBlocker); // Nasłuchujemy na kontekście, nie na całej przeglądarce!

    await page.setRequestInterception(true);
    page.on('request', r => {
        const url = r.url();
        if (url.includes('.m3u8') || url.includes('/hls/')) {
            if (!url.includes('ads') && !url.includes('track') && !url.includes('pixel')) {
                streamUrl = url;
            }
        }
        r.continue();
    });

    try {
        console.log(`   🛠️ Filemoon: Wchodzę incognito...`);
        await page.goto(embedUrl, { waitUntil: 'networkidle2', timeout: 45000 });

        await new Promise(r => setTimeout(r, 1500));

        const windowSize = await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight }));
        const centerX = windowSize.width / 2;
        const centerY = windowSize.height / 2;

        console.log(`   🛠️ Filemoon: Symuluję ruch myszą...`);
        await page.mouse.move(centerX, centerY, { steps: 15 });
        await new Promise(r => setTimeout(r, 500));

        await page.mouse.click(centerX, centerY);
        await new Promise(r => setTimeout(r, 1500));
        await page.mouse.click(centerX, centerY);

        await page.evaluate(() => {
            const video = document.querySelector('video');
            if (video && typeof video.play === 'function') video.play().catch(() => {});
        }).catch(() => {});

        let attempts = 0;
        while (!streamUrl && attempts < 15) {
            await new Promise(r => setTimeout(r, 1000));
            attempts++;
        }

    } catch (err) {
        console.error('   ⚠️ [FILEMOON] Błąd:', err.message);
    } finally {
        // --- 3. CAŁKOWITE ZATARCIE ŚLADÓW ---
        context.off('targetcreated', popupBlocker);
        await page.close();
        await context.close(); // Niszczymy sesję Incognito z jej ciasteczkami

        if (streamUrl) {
            console.log(`   ✅ Filemoon SUKCES: ${streamUrl.split('?')[0].substring(0, 50)}...`);
            return { url: streamUrl, type: 'm3u8', quality: '1080p', source: 'Filemoon' };
        }
        return null;
    }
}

async function extractFromSibnet(browser, embedUrl) {
    const page = await browser.newPage();
    let targetUrl = null;
    await page.setRequestInterception(true);

    page.on('request', request => {
        const url = request.url();
        if (url.includes('.mp4') && url.includes('sibnet')) targetUrl = url;
        request.continue();
    });

    try {
        await page.setExtraHTTPHeaders({ 'Referer': 'https://video.sibnet.ru/' });
        await page.goto(embedUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 3000));

        if (!targetUrl) {
            await page.mouse.click(400, 300);
            await new Promise(r => setTimeout(r, 3000));
        }
    } catch (err) {
        console.error('   ⚠️ [SIBNET] Błąd wczytywania playera:', err.message);
    } finally {
        await page.close();
        if (targetUrl) {
            return { url: targetUrl, type: 'mp4', quality: 'unknown', source: 'Sibnet' };
        }
        return null;
    }
}

// ==========================================
// ⚙️ GŁÓWNA PĘTLA BOTA (Porównywarka i Selekcjoner)
// ==========================================
async function startAutomator() {
    console.log("🤖 Uruchamiam Inteligentnego Workera z Testem Kwasowym (Weryfikacja HTTP)...\n");
    let client;
    try {
        client = await pool.connect();

        const query = `
            SELECT id, title, episode_number, source_embed_url 
            FROM episodes 
            WHERE source_embed_url IS NOT NULL 
            AND video_file_path IS NULL
            ORDER BY episode_number ASC;
        `;
        const res = await client.query(query);
        const episodesToProcess = res.rows;

        if (episodesToProcess.length === 0) {
            console.log("✅ Baza zaktualizowana w 100%. Brak zadań dla Workera.");
            return;
        }

        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--mute-audio']
        });

        for (let i = 0; i < episodesToProcess.length; i++) {
            const ep = episodesToProcess[i];
            console.log(`⏳ [${i + 1}/${episodesToProcess.length}] Odcinek ${ep.episode_number}: ${ep.title}`);

            // Jeśli linki są po przecinku (CDA, Sibnet), rozdzielamy je na tablicę
            const embedUrls = ep.source_embed_url.split(',').map(url => url.trim());
            let gatheredStreams = [];

            // Sprawdzamy każdy link po kolei
            for (const embed of embedUrls) {
                console.log(`   🔎 Skanuję źródło embeda: ${embed.split('/')[2]}`);
                const streamData = await extractStreamData(browser, embed);

                if (streamData) {
                    console.log(`   🔬 Wykonuję Acid Test dla wyciągniętego pliku ${streamData.type.toUpperCase()}...`);

                    // WERYFIKACJA HTTP ZANIM NADAMY PUNKTY
                    const isLinkAlive = await verifyVideoLink(streamData.url, streamData.source);

                    if (isLinkAlive) {
                        streamData.score = calculateScore(streamData); // Nadajemy punkty
                        gatheredStreams.push(streamData);
                        console.log(`   ✅ Link jest aktywny! Przyznano punktów: ${streamData.score}`);
                    } else {
                        console.log(`   ❌ Link odrzucony przez Acid Test (Zablokowany przez serwer docelowy).`);
                    }
                }
            }

            // Rozstrzygnięcie pojedynku
            if (gatheredStreams.length > 0) {
                // Sortujemy by najwyższy wynik był na indeksie 0
                gatheredStreams.sort((a, b) => b.score - a.score);
                const winner = gatheredStreams[0];

                await client.query(
                    'UPDATE episodes SET video_file_path = $1 WHERE id = $2',
                    [winner.url, ep.id]
                );
                console.log(`   🏆 ZWYCIĘZCA: ${winner.source} (${winner.type.toUpperCase()}). Zapisano natywny link do bazy!`);
            } else {
                console.log(`   🚨 KRYTYCZNE NIEPOWODZENIE. Żaden ze sprawdzonych linków nie nadawał się do odtworzenia.`);
            }
            console.log("--------------------------------------------------");
        }
        await browser.close();
    } catch (err) {
        console.error("🔥 Błąd Krytyczny Workera:", err);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

// 🛡️ Zabezpieczenie przed połączeniami Zombie (Zapychaniem bazy SQL)
process.on('SIGINT', async () => {
    try {
        console.log("\n🔌 Zamykam bezpiecznie połączenie z bazą...");
        await pool.end();
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
});

startAutomator();