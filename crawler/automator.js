require('dotenv').config();
const { Pool } = require('pg');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// Konfiguracja połączenia z bazą danych
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function extractVideoLink(browser, embedUrl) {
    const page = await browser.newPage();
    let targetVideoUrl = null;
    let found = false;

    await page.setRequestInterception(true);
    const blackList = ['filmy_o_przyjazni', 'reklama', 'pre-roll', 'ads', 'gemius'];

    page.on('request', request => {
        if (found) {
            request.continue();
            return;
        }

        const url = request.url().toLowerCase();

        // 1. Ubijamy reklamy
        if (blackList.some(word => url.includes(word))) {
            request.abort();
            return;
        }

        // 2. Łapiemy wideo
        if (url.includes('.mp4') || url.includes('.m3u8')) {
            if (!url.includes('google') && !url.includes('favicon')) {
                found = true;
                targetVideoUrl = request.url();
            }
        }
        request.continue();
    });

    try {
        await page.goto(embedUrl, { waitUntil: 'networkidle2' });
        await page.mouse.click(400, 300); // Klikamy Play

        // Czekamy 15 sekund na przechwycenie linku
        await new Promise(r => setTimeout(r, 15000));
    } catch (err) {
        console.error('Błąd strony:', err.message);
    } finally {
        await page.close(); // Zamykamy kartę, żeby nie zapchać RAM-u!
        return targetVideoUrl ? targetVideoUrl.split('?')[0] : null; // Zwracamy czysty link
    }
}

async function startAutomator() {
    console.log("🤖 Uruchamiam Autonomicznego Workera VOD...\n");

    let client;
    try {
        client = await pool.connect();

        // Szukamy odcinków, które mają link do CDA (source_embed_url),
        // ale NIE MAJĄ jeszcze czystego pliku (video_file_path)
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
            console.log("✅ Baza jest w 100% zaktualizowana. Brak pracy dla Workera.");
            return;
        }

        console.log(`📋 Znaleziono ${episodesToProcess.length} odcinków do przetworzenia.\n`);

        // Odpalamy przeglądarkę tylko RAZ dla całego procesu
        const browser = await puppeteer.launch({
            headless: false, // Zmień na "new" (z cudzysłowami), jak już nie będziesz chciał na to patrzeć
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--mute-audio']
        });

        // Przechodzimy przez odcinki PĘTLĄ
        for (let i = 0; i < episodesToProcess.length; i++) {
            const ep = episodesToProcess[i];
            console.log(`⏳ [${i + 1}/${episodesToProcess.length}] Przetwarzam Odcinek ${ep.episode_number}: ${ep.title}...`);
            console.log(`   🔗 Źródło: ${ep.source_embed_url}`);

            const directLink = await extractVideoLink(browser, ep.source_embed_url);

            if (directLink) {
                console.log(`   ✅ SUKCES! Zapisuję do bazy...`);
                // Aktualizujemy bazę danych!
                await client.query(
                    'UPDATE episodes SET video_file_path = $1 WHERE id = $2',
                    [directLink, ep.id]
                );
            } else {
                console.log(`   ❌ NIEPOWODZENIE. Nie wykryto pliku wideo.`);
            }
            console.log("--------------------------------------------------");
        }

        console.log("\n🎉 Praca zakończona! Zamykam przeglądarkę.");
        await browser.close();

    } catch (err) {
        console.error("🔥 Błąd Krytyczny Workera:", err);
    } finally {
        if (client) client.release();
        await pool.end(); // Zamykamy pulę połączeń z bazą
    }
}

// Odpalamy maszynę
startAutomator();