const puppeteer = require('puppeteer');
const axios = require('axios');

async function discoverShindenUrls(movieId, seriesUrl) {
    console.log(`🔎 [Discovery] Start dla Movie ID: ${movieId}. Szybkie mapowanie linków...`);

    let browser;
    try {
        browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' });
        const page = await browser.newPage();

        // 1. Pobierz brakujące odcinki z bazy
        const response = await axios.get(`http://localhost:8080/api/episodes/missing-urls/${movieId}`);
        const dbEpisodes = response.data;

        if (dbEpisodes.length === 0) {
            console.log("✅ Wszystkie odcinki mają już linki do Shindena!");
            return;
        }

        // 2. Wejdź na listę wszystkich odcinków
        console.log(`🌐 Otwieram listę: ${seriesUrl}`);
        await page.goto(seriesUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        // 3. Zgraj wszystkie numery i linki z tabeli do pamięci
        const scrapedLinks = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table tbody tr'));
            return rows.map(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length < 2) return null;

                // Szukamy linku <a>, który prowadzi do odcinka
                const linkTag = row.querySelector('a[href*="/episode/"]');

                return {
                    number: cells[0].innerText.trim(), // Pobieramy numerek
                    episodeUrl: linkTag ? linkTag.href : null // Pobieramy czysty link
                };
            }).filter(item => item !== null && item.episodeUrl !== null);
        });

        console.log(`✅ Znalazłem ${scrapedLinks.length} linków na stronie. Mapuję z bazą...\n`);

        // 4. Błyskawiczne dopasowanie i zapis do bazy
        let count = 0;
        for (const dbEp of dbEpisodes) {
            const targetNum = parseInt(dbEp.episodeNumber);

            // Szukamy dopasowania po numerku
            const match = scrapedLinks.find(s => parseInt(s.number) === targetNum);

            if (match) {
                console.log(`🎯 Odcinek ${targetNum} zmapowany z: ${match.episodeUrl}`);

                // Wysyłamy do Spring Boota!
                await axios.put(`http://localhost:8080/api/episodes/${dbEp.id}/shinden-url`, {
                    shindenUrl: match.episodeUrl
                });
                count++;
            } else {
                console.log(`⚠️ Brak odcinka ${targetNum} na stronie Shindena.`);
            }
        }

        console.log(`\n🏁 Gotowe! Błyskawicznie zapisano ${count} linków w bazie.`);

    } catch (error) {
        console.error("🔥 Błąd:", error.message);
    } finally {
        if (browser) {
            const pages = await browser.pages();
            if (pages.length > 1) await pages[pages.length-1].close();
            browser.disconnect();
        }
    }
}


// Przykład użycia:
discoverShindenUrls(67, 'https://shinden.pl/titles/50446-mahoutsukai-no-yome/episodes');