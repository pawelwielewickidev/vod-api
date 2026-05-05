const puppeteer = require('puppeteer');
const axios = require('axios');

// ==========================================
// ⚙️ KONFIGURACJA GŁÓWNA (Zmieniaj tylko to!)
// ==========================================
const MOVIE_ID = 64; // ID anime w Twojej bazie
const SERIES_URL = 'https://shinden.pl/series/60291-ore-dake-level-up-na-ken/episodes'; // Link do rozszerzonej listy odcinków
const API_BASE_URL = 'http://localhost:8080/api/episodes';
// ==========================================

async function runMasterBot() {
    console.log(`\n👑 Uruchamiam Dyrygenta dla Movie ID: ${MOVIE_ID}`);
    console.log(`--------------------------------------------------`);

    let browser;
    try {
        // Podłączamy się do Chrome tylko raz dla obu zadań
        browser = await puppeteer.connect({
            browserURL: 'http://127.0.0.1:9222',
            defaultViewport: null
        });

        // 🟢 ETAP 1: DISCOVERY (Zwiadowca)
        await runDiscovery(browser);

        console.log(`\n⏳ Krótka pauza przed etapem wyciągania embedów...\n`);
        await new Promise(r => setTimeout(r, 2000));

        // 🔴 ETAP 2: HUNTER (Łowca)
        await runHunter(browser);

    } catch (error) {
        console.error(`🔥 Błąd krytyczny Dyrygenta: ${error.message}`);
    } finally {
        if (browser) browser.disconnect();
        console.log(`\n🏁 Dyrygent zakończył pracę. Baza zaktualizowana!`);
    }
}

// ==========================================
// 🟢 FUNKCJA DISCOVERY (Mapowanie linków)
// ==========================================
async function runDiscovery(browser) {
    console.log(`🔎 [ETAP 1: DISCOVERY] Szukam brakujących linków do Shindena...`);
    const page = await browser.newPage();

    try {
        const response = await axios.get(`${API_BASE_URL}/missing-urls/${MOVIE_ID}`);
        const dbEpisodes = response.data;

        if (dbEpisodes.length === 0) {
            console.log(`✅ Wszystkie odcinki mają już zmapowane linki Shinden.`);
            await page.close();
            return;
        }

        console.log(`🌐 Otwieram listę Shinden: ${SERIES_URL}`);
        await page.goto(SERIES_URL, { waitUntil: 'networkidle2', timeout: 60000 });

        const scrapedLinks = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table tbody tr'));
            return rows.map(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length < 2) return null;
                const linkTag = row.querySelector('a[href*="/episode/"]');
                return {
                    number: cells[0].innerText.trim(),
                    episodeUrl: linkTag ? linkTag.href : null
                };
            }).filter(item => item !== null && item.episodeUrl !== null);
        });

        let count = 0;
        for (const dbEp of dbEpisodes) {
            const targetNum = parseInt(dbEp.episodeNumber);
            const match = scrapedLinks.find(s => parseInt(s.number) === targetNum);

            if (match) {
                await axios.put(`${API_BASE_URL}/${dbEp.id}/shinden-url`, { shindenUrl: match.episodeUrl });
                console.log(`🎯 Zmapowano odcinek ${targetNum}`);
                count++;
            }
        }
        console.log(`✅ Zakończono Discovery: Zapisano ${count} linków.`);
    } catch (error) {
        console.error(`❌ Błąd w Etapie 1: ${error.message}`);
    } finally {
        if (!page.isClosed()) await page.close();
    }
}

// ==========================================
// 🔴 FUNKCJA HUNTER (Wyciąganie CDA Embed)
// ==========================================
async function runHunter(browser) {
    console.log(`🏹 [ETAP 2: HUNTER] Wyciągam embedy CDA...`);

    try {
        const response = await axios.get(`${API_BASE_URL}/todo/${MOVIE_ID}`);
        const episodes = response.data;

        if (!episodes || episodes.length === 0) {
            console.log(`✅ Brak odcinków oczekujących na wyciągnięcie embeda.`);
            return;
        }

        console.log(`📋 Znaleziono ${episodes.length} odcinków do obrobienia.\n`);

        for (const episode of episodes) {
            const id = episode.id;
            const title = episode.title || `Odcinek ${episode.episodeNumber}`;
            const shindenUrl = episode.shindenUrl;

            if (!shindenUrl) continue;

            console.log(`--- [START] ${title} (ID: ${id}) ---`);
            const embedLink = await scrapeEmbed(browser, shindenUrl);

            if (embedLink) {
                try {
                    await axios.put(`${API_BASE_URL}/${id}/embed`, { sourceEmbedUrl: embedLink });
                    console.log(`💾 Zapisano w PostgreSQL: ${embedLink.substring(0, 50)}...`);
                } catch (apiErr) {
                    console.error(`🔥 Błąd API: ${apiErr.message}`);
                }
            } else {
                console.log(`⚠️ Nie zdobyto linku dla ID ${id}.`);
            }
            console.log(`--- [KONIEC] ---\n`);
        }
    } catch (error) {
        console.error(`❌ Błąd w Etapie 2: ${error.message}`);
    }
}

// Funkcja pomocnicza dla Huntera (Podsłuch sieci i klikanie)
async function scrapeEmbed(browser, targetUrl) {
    const page = await browser.newPage();
    let interceptedLink = null;

    try {
        await page.setRequestInterception(false);
        page.on('request', request => {
            const url = request.url();
            if (url.includes('xml_pool') && url.includes('requestUrl=')) {
                const params = new URLSearchParams(url.split('?')[1]);
                const raw = params.get('requestUrl');
                if (raw) interceptedLink = decodeURIComponent(raw);
            } else if (url.includes('ebd.cda.pl/935x526/') || (url.includes('ebd.cda.pl') && url.includes('embed'))) {
                if (!url.includes('xml_pool')) interceptedLink = url;
            }
        });

        console.log(`🌐 Wchodzę na: ${targetUrl}`);
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

        const clicked = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table tbody tr'));
            for (let row of rows) {
                if (row.innerText.toLowerCase().includes('cda')) {
                    const btn = row.querySelector('a, button, .fa-play, a.button, .ev-play');
                    if (btn) { btn.click(); return true; }
                }
            }
            return false;
        });

        if (!clicked) {
            console.log("❌ Brak CDA w tabeli.");
            await page.close();
            return null;
        }

        console.log("⏳ Kliknięto. Oczekuję na player CDA (kliknij Play jeśli trzeba)...");
        const startTime = Date.now();
        while (!interceptedLink && Date.now() - startTime < 90000) {
            await new Promise(r => setTimeout(r, 1000));
        }

        await page.close();
        return interceptedLink;

    } catch (e) {
        console.error(`❌ Błąd z kartą: ${e.message}`);
        await page.close();
        return null;
    }
}

// Odpalenie Master Bota
runMasterBot();