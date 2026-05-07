const puppeteer = require('puppeteer');
const axios = require('axios');

// ==========================================
// ⚙️ KONFIGURACJA GŁÓWNA (Zmieniaj tylko to!)
// ==========================================
const MOVIE_ID = 64; // ID anime w Twojej bazie

// URLe do API Spring Boota
const API_MOVIE_URL = `http://localhost:8080/api/movies/${MOVIE_ID}/shnd`;
const API_EPISODES_URL = 'http://localhost:8080/api/episodes';
// ==========================================

async function runMasterBot() {
    console.log(`\n👑 Uruchamiam Dyrygenta (Architektura Sezonowa) dla Movie ID: ${MOVIE_ID}`);
    console.log(`--------------------------------------------------`);

    let browser;
    try {
        console.log(`📡 Pobieram listę sezonów z bazy danych...`);
        const movieResponse = await axios.get(API_MOVIE_URL);

        // Chwytamy klucz z literką "s" na końcu!
        const seriesUrls = movieResponse.data.shindenUrls;

        // Sprawdzamy czy to na pewno jest tablica (Lista) i czy nie jest pusta
        if (!seriesUrls || !Array.isArray(seriesUrls) || seriesUrls.length === 0) {
            throw new Error(`Baza danych nie zwróciła poprawnej listy sezonów (shindenUrls)!`);
        }
        console.log(`✅ Zlokalizowano ${seriesUrls.length} sezonów do zbadania.\n`);

        console.log(`🤖 Łączę się z otwartą przeglądarką Chrome (port 9222)...`);
        browser = await puppeteer.connect({
            browserURL: 'http://127.0.0.1:9222',
            defaultViewport: null
        });

        // Przekazujemy TABLICĘ do Zwiadowcy
        await runDiscovery(browser, seriesUrls);

        console.log(`\n⏳ Krótka pauza przed etapem wyciągania embedów...\n`);
        await new Promise(r => setTimeout(r, 2000));

        await runHunter(browser);

    } catch (error) {
        console.error(`🔥 Błąd krytyczny Dyrygenta: ${error.message}`);
    } finally {
        if (browser) {
            browser.disconnect();
            console.log(`🔌 Odłączono bota od przeglądarki.`);
        }
        console.log(`\n🏁 Dyrygent zakończył pracę. Baza zaktualizowana!`);
    }
}

async function runDiscovery(browser, seriesUrls) {
    console.log(`🔎 [ETAP 1: DISCOVERY] Skanuję kolejne sezony na Shindenie...`);
    const page = await browser.newPage();
    let allScrapedEpisodes = []; // Tutaj zszywamy wszystkie sezony w jedną całość

    try {
        const response = await axios.get(`${API_EPISODES_URL}/missing-urls/${MOVIE_ID}`);
        const dbEpisodes = response.data;

        if (dbEpisodes.length === 0) {
            console.log(`✅ Wszystkie odcinki mają już zmapowane linki Shinden.`);
            await page.close();
            return;
        }

        // PĘTLA PRZEZ WSZYSTKIE SEZONY
        for (let i = 0; i < seriesUrls.length; i++) {
            const currentSeasonUrl = seriesUrls[i];
            console.log(`🌐 Otwieram Sezon ${i + 1}: ${currentSeasonUrl}`);
            await page.goto(currentSeasonUrl, { waitUntil: 'networkidle2', timeout: 60000 });

            // Zbieramy odcinki z aktualnego sezonu
            const seasonEpisodes = await page.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('table tbody tr'));
                return rows.map(row => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length < 2) return null;

                    // --- 🛑 ELIMINATOR RECAPÓW I ODCINKÓW SPECJALNYCH ---
                    const rowText = row.innerText.toLowerCase();
                    const isRecap = rowText.includes('recap') ||
                        rowText.includes('podsumowanie') ||
                        rowText.includes('specjalny') ||
                        rowText.includes('special') ||
                    rowText.includes('recaps');

                    // Jeśli to recap, zwracamy null (bot go zignoruje)
                    if (isRecap) return null;

                    const linkTag = row.querySelector('a[href*="/episode/"]');
                    return {
                        episodeUrl: linkTag ? linkTag.href : null
                    };
                }).filter(item => item !== null && item.episodeUrl !== null).reverse();
            });

            console.log(`   ✂️ Zebrano i odwrócono chronologicznie ${seasonEpisodes.length} odcinków z Sezonu ${i + 1}.`);

            // Doklejamy zebrane odcinki do głównej tablicy
            allScrapedEpisodes = allScrapedEpisodes.concat(seasonEpisodes);
        }

        console.log(`\n📚 Łącznie zeskrapowano ${allScrapedEpisodes.length} odcinków ze wszystkich sezonów. Rozpoczynam mapowanie absolutne...`);

        let count = 0;
        // Mapujemy na numery ciągłe w bazie
        for (const dbEp of dbEpisodes) {
            const targetAbsoluteNum = parseInt(dbEp.episodeNumber);
            // Indeks tablicy jest o 1 mniejszy niż numer odcinka (odc. 1 to indeks 0)
            const arrayIndex = targetAbsoluteNum - 1;

            const match = allScrapedEpisodes[arrayIndex];

            if (match && match.episodeUrl) {
                await axios.put(`${API_EPISODES_URL}/${dbEp.id}/shinden-url`, { shindenUrl: match.episodeUrl });
                console.log(`🎯 Zmapowano odcinek ${targetAbsoluteNum} z bazy -> ${match.episodeUrl}`);
                count++;
            } else {
                console.log(`⚠️ Brak odpowiednika na Shindenie dla Twojego odcinka nr ${targetAbsoluteNum}`);
            }
        }
        console.log(`✅ Zakończono Discovery: Pomyślnie zmapowano i zapisano ${count} linków.`);
    } catch (error) {
        console.error(`❌ Błąd w Etapie 1: ${error.message}`);
    } finally {
        if (!page.isClosed()) await page.close();
    }
}

async function runHunter(browser) {
    console.log(`🏹 [ETAP 2: HUNTER] Wyciągam embedy z wielu źródeł...`);

    try {
        const response = await axios.get(`${API_EPISODES_URL}/todo/${MOVIE_ID}`);
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

            const embedLinks = await scrapeEmbed(browser, shindenUrl);

            if (embedLinks) {
                try {
                    await axios.put(`${API_EPISODES_URL}/${id}/embed`, { sourceEmbedUrl: embedLinks });
                    console.log(`💾 Zapisano w PostgreSQL paczkę linków:\n   -> ${embedLinks}`);
                } catch (apiErr) {
                    console.error(`🔥 Błąd API: ${apiErr.message}`);
                }
            } else {
                console.log(`⚠️ Nie zdobyto żadnych linków dla ID ${id}.`);
            }
            console.log(`--- [KONIEC] ---\n`);
        }
    } catch (error) {
        console.error(`❌ Błąd w Etapie 2: ${error.message}`);
    }
}

async function scrapeEmbed(browser, targetUrl) {
    let foundLinks = [];
    const providersToHunt = ['cda', 'sibnet', 'dailymotion', 'vk', 'filemoon'];

    for (const provider of providersToHunt) {
        const page = await browser.newPage();
        let interceptedLink = null;

        try {
            // 1. NASŁUCHIWANIE (Działa w tle przez cały czas życia zakładki)
            page.on('response', async (res) => {
                try {
                    const u = res.url();
                    if (u.includes('/video/get') || u.includes('shinden.pl/api')) {
                        const data = await res.json();
                        if (data.url && data.url.toLowerCase().includes(provider)) interceptedLink = data.url;
                        else if (data.code && data.code.toLowerCase().includes(provider)) {
                            const m = data.code.match(/src="([^"]+)"/);
                            if (m) interceptedLink = m[1];
                        }
                    }
                } catch (e) {}
            });

            page.on('request', r => {
                const u = r.url();
                if (u.toLowerCase().includes(provider) && (u.includes('embed') || u.includes('/e/'))) {
                    interceptedLink = u;
                }
            });

            console.log(`🌐 [${provider.toUpperCase()}] Start...`);
            await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });

            // 2. WYBÓR W TABELI
            const clicked = await page.evaluate((p) => {
                const rows = Array.from(document.querySelectorAll('table tbody tr'));
                const target = rows.find(r => r.innerText.toLowerCase().includes(p));
                if (target) {
                    const b = target.querySelector('a, button, .fa-play, .ev-play');
                    if (b) { b.scrollIntoView(); b.click(); return true; }
                }
                return false;
            }, provider);

            if (!clicked) {
                console.log(`   ❌ Brak w tabeli.`);
                await page.close(); continue;
            }

            // 3. KLIKNIĘCIE AKTYWACJI Z OBSŁUGĄ NAWIGACJI
            console.log(`   🖱️ Szukam przycisku aktywacji...`);
            await new Promise(r => setTimeout(r, 2000));

            try {
                await Promise.all([
                    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {}),
                    page.evaluate(() => {
                        // Krok 1: Próbujemy trafić precyzyjnie w ID/Klasę playera Shinden (Najbezpieczniejsze)
                        const exactBtn = document.querySelector('#player-show, a.ep-button, #load-player, .load-video-button');
                        if (exactBtn && exactBtn.offsetParent !== null) {
                            exactBtn.click();
                            return true;
                        }

                        // Krok 2: Opcja awaryjna (Szukanie po tekście, ale z rygorystycznymi zakazami)
                        const elements = Array.from(document.querySelectorAll('a, button, div.ep-button, div.button'));
                        const targetBtn = elements.find(el => {
                            const txt = el.innerText.toLowerCase().trim();
                            // Musi zawierać słowo kluczowe...
                            const isPlay = txt.includes('odtwórz') || txt === 'play' || txt.includes('załaduj wideo');
                            // ...ale NIE MOŻE być formularzem zgłoszeniowym
                            const isNotReport = !txt.includes('zgłoś') && !txt.includes('raport') && !txt.includes('report');

                            return isPlay && isNotReport && el.offsetParent !== null;
                        });

                        if (targetBtn) {
                            targetBtn.click();
                            return true;
                        }
                        return false;
                    })
                ]);
                console.log(`   🚀 Aktywowano!`);
            } catch (navErr) {
                console.log(`   ⚠️ Nawigacja przerwana, ale sprawdzam dalej...`);
            }

            // 4. MONITOROWANIE I WYCIĄGANIE WŁAŚCIWEGO IFRAME
            let timer = 0;
            while (!interceptedLink && timer < 20) {
                if (page.isClosed()) break;

                interceptedLink = await page.evaluate(() => {
                    // Zamiast szukać słowa 'filemoon', szukamy po prostu ramki w głównym kontenerze playera
                    const playerIframe = document.querySelector('#player-block iframe, .player-container iframe');
                    if (playerIframe && playerIframe.src) return playerIframe.src;

                    // Opcja awaryjna - jakikolwiek iframe z formatem '/e/' (charakterystyczne dla Filemoona)
                    const anyEFrame = document.querySelector('iframe[src*="/e/"]');
                    return anyEFrame ? anyEFrame.src : null;
                });

                if (interceptedLink) break;
                await new Promise(r => setTimeout(r, 500));
                timer++;
            }

            if (interceptedLink) {
                if (interceptedLink.startsWith('//')) interceptedLink = 'https:' + interceptedLink;

                // 🔥 GENIALNY TRIK: Doklejamy tag providera do URL-a, żeby Automator wiedział, co to jest!
                if (!interceptedLink.includes('provider=')) {
                    interceptedLink += (interceptedLink.includes('?') ? '&' : '?') + `provider=${provider}`;
                }

                foundLinks.push(interceptedLink);
                console.log(`   ✅ SUKCES: ${interceptedLink.substring(0, 55)}...`);
            } else {
                console.log(`   ⚠️ Nie przechwycono linku po aktywacji.`);
            }

        } catch (e) {
            console.error(`   🔥 Błąd: ${e.message}`);
        } finally {
            if (!page.isClosed()) await page.close();
        }
    }

    return foundLinks.length > 0 ? foundLinks.join(',') : null;
}

runMasterBot();