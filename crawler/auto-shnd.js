const puppeteer = require('puppeteer');
const axios = require('axios');

// --- KONFIGURACJA ---
const API_BASE_URL = 'http://localhost:8080/api/episodes';
const MOVIE_ID_TO_SCRAPE = 67; // <--- WPISZ TUTAJ ID FILMU/ANIME Z TWOJEJ BAZY

async function runAutomator() {
    console.log("🚀 Uruchamiam Głównego Automatora Shinden...");

    let browser;
    try {
        // 1. Podłączenie do Chrome (pamiętaj o flagach na Macu!)
        browser = await puppeteer.connect({
            browserURL: 'http://127.0.0.1:9222',
            defaultViewport: null
        });

        // 2. Pobranie listy zadań dla konkretnego ID filmu
        console.log(`📥 Pobieram odcinki dla Movie ID: ${MOVIE_ID_TO_SCRAPE}...`);
        const response = await axios.get(`${API_BASE_URL}/todo/${MOVIE_ID_TO_SCRAPE}`);
        let episodes = response.data;

        if (typeof episodes === 'string') {
            try {
                episodes = JSON.parse(episodes);
            } catch (e) {
                console.error("🔥 BŁĄD: API nie zwróciło JSON-a, tylko zwykły tekst!");
                console.error("Treść z API:", episodes.substring(0, 100)); // Pokaż kawałek tekstu
                return;
            }
        }

        if (!Array.isArray(episodes)) {
            console.error("🔥 BŁĄD: Oczekiwałem listy [], a dostałem coś innego!");
            return;
        }

        if (!episodes || episodes.length === 0) {
            console.log("✅ Brak nowych odcinków dla tego tytułu. Wszystko uzupełnione!");
            return;
        }

        console.log(`📋 Znaleziono ${episodes.length} odcinków. Zaczynamy!\n`);

        for (const episode of episodes) {
            // TO JEST KLUCZ: Wyświetlmy surowy obiekt, żeby zobaczyć nazwy pól
            console.log("--- DEBUG: Dane odcinka z API ---");
            console.log(episode);
            console.log("---------------------------------");

            const id = episode.id || episode.episodeId; // Próba złapania ID pod dwiema nazwami
            const title = episode.title || `Odcinek ${episode.episodeNumber}`;
            const shindenUrl = episode.shindenUrl || episode.shinden_url; // Sprawdzenie camelCase i snake_case

            if (!shindenUrl) {
                console.log(`⚠️ Pomijam ID ${id}: Brak linku Shinden w bazie.`);
                continue;
            }

            console.log(`--- [START] ${title} (ID: ${id}) ---`);

            // 3. Proces scrapowania pojedynczego odcinka
            const embedLink = await scrapeEmbed(browser, shindenUrl);

            if (embedLink) {
                console.log(`📤 Przesyłam wywalczony link do API...`);
                try {
                    await axios.put(`${API_BASE_URL}/${id}/embed`, {
                        sourceEmbedUrl: embedLink
                    });
                    console.log(`💾 Zapisano w PostgreSQL!`);
                } catch (apiErr) {
                    console.error(`🔥 Błąd API przy zapisie: ${apiErr.message}`);
                }
            } else {
                console.log(`⚠️ Nie udało się zdobyć linku dla ID ${id}. Przechodzę dalej.`);
            }

            console.log(`--- [KONIEC] ---\n`);
        }

    } catch (error) {
        console.error(`🔥 Błąd główny automatora: ${error.message}`);
    } finally {
        if (browser) browser.disconnect();
        console.log("🏁 Koniec kolejki zadań.");
    }
}

async function scrapeEmbed(browser, targetUrl) {
    const page = await browser.newPage();
    let interceptedLink = null;

    try {
        // Ustawiamy podsłuch sieciowy
        await page.setRequestInterception(false);
        page.on('request', request => {
            const url = request.url();

            // Wyłapujemy linki CDA (zarówno XML Pool jak i bezpośrednie embedy)
            if (url.includes('xml_pool') && url.includes('requestUrl=')) {
                const params = new URLSearchParams(url.split('?')[1]);
                const raw = params.get('requestUrl');
                if (raw) interceptedLink = decodeURIComponent(raw);
            } else if (url.includes('ebd.cda.pl/935x526/') || (url.includes('ebd.cda.pl') && url.includes('embed'))) {
                if (!url.includes('xml_pool')) interceptedLink = url;
            }
        });

        console.log(`🌐 Otwieram: ${targetUrl}`);
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Klikamy przycisk "Pokaż" w tabeli
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
            console.log("❌ Nie znalazłem wiersza z CDA w tabeli.");
            await page.close();
            return null;
        }

        console.log("⏳ Kliknięto 'Pokaż'. Jeśli trzeba, KLIKNIJ PLAY RĘCZNIE w Chrome...");

        // Czekamy max 90 sekund na pojawienie się linku w "podsłuchu"
        const startTime = Date.now();
        while (!interceptedLink && Date.now() - startTime < 90000) {
            await new Promise(r => setTimeout(r, 1000));
        }

        if (interceptedLink) {
            console.log(`🎯 Przechwycono: ${interceptedLink.substring(0, 60)}...`);
        }

        await page.close();
        return interceptedLink;

    } catch (e) {
        console.error(`❌ Błąd podczas pracy na karcie: ${e.message}`);
        await page.close();
        return null;
    }
}

// Odpalenie skryptu
runAutomator();