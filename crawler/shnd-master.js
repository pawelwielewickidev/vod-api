const puppeteer = require('puppeteer');
const axios = require('axios');

// ==========================================
// ⚙️ KONFIGURACJA GŁÓWNA
// ==========================================
const API_BASE_URL = 'http://localhost:8080/api';
const API_MOVIES_URL = `${API_BASE_URL}/movies`;
const API_EPISODES_URL = `${API_BASE_URL}/episodes`;
// ==========================================

async function runMasterBot() {
    console.log(`\n👑 Uruchamiam Dyrygenta (Architektura Globalna)`);
    console.log(`--------------------------------------------------`);

    // 1. Sprawdzamy co jest do zrobienia, zanim w ogóle ruszymy przeglądarkę
    let episodesWithoutShindenUrl = [];
    let episodesWithoutEmbeds = [];

    try {
        console.log(`📡 Sprawdzam zadania z bazy danych...`);
        const allEpisodesResponse = await axios.get(API_EPISODES_URL);
        const allEpisodes = allEpisodesResponse.data;

        episodesWithoutShindenUrl = allEpisodes.filter(ep => !ep.shindenUrl);
        episodesWithoutEmbeds = allEpisodes.filter(ep => ep.shindenUrl && !ep.sourceEmbedUrl);
    } catch (error) {
        console.error(`🔥 Błąd API: ${error.message}`);
        process.exit(1);
    }

    if (episodesWithoutShindenUrl.length === 0 && episodesWithoutEmbeds.length === 0) {
        console.log(`✅ System w pełni zaktualizowany. Brak zadań dla Mastera. Kończę pracę.`);
        process.exit(0);
    }

    let browser;
    try {
        // POWRÓT DO TWOJEJ NIEZAWODNEJ METODY (Fizyczny Chrome na porcie 9222)
        console.log(`🤖 Łączę się z otwartą przeglądarką Chrome (port 9222)...`);
        browser = await puppeteer.connect({
            browserURL: 'http://127.0.0.1:9222',
            defaultViewport: null
        });
        console.log(`✅ Połączono z przeglądarką.`);

        // ETAP 1: DISCOVERY
        if (episodesWithoutShindenUrl.length > 0) {
            await runDiscovery(browser);
            console.log(`\n⏳ Krótka pauza po etapie Discovery...\n`);
            await new Promise(r => setTimeout(r, 2000));

            // Odświeżamy zadania po Discovery (bo mogły dojść nowe linki Shinden do obrobienia)
            const refreshedEpisodes = (await axios.get(API_EPISODES_URL)).data;
            episodesWithoutEmbeds = refreshedEpisodes.filter(ep => ep.shindenUrl && !ep.sourceEmbedUrl);
        }

        // ETAP 2: HUNTER (Scrapowanie embedów)
        if (episodesWithoutEmbeds.length > 0) {
            await runHunter(browser, episodesWithoutEmbeds);
        }

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

async function runDiscovery(browser) {
    console.log(`🔎 [ETAP 1: DISCOVERY] Skanuję bazę w poszukiwaniu brakujących linków Shinden...`);
    const page = await browser.newPage();
    let totalMappedCount = 0;

    try {
        const moviesResponse = await axios.get(API_MOVIES_URL);
        const allMovies = moviesResponse.data;

        for (const movie of allMovies) {
            const movieId = movie.id;
            const movieTitle = movie.title;

            // Zamiast sztywnego ID, sprawdzamy po kolei filmy z bazy
            const response = await axios.get(`${API_EPISODES_URL}/missing-urls/${movieId}`);
            const dbEpisodes = response.data;

            if (dbEpisodes.length === 0) continue;

            console.log(`\n--- Sprawdzam: "${movieTitle}" (ID: ${movieId}) ---`);
            console.log(`   - Znaleziono ${dbEpisodes.length} odcinków bez linku.`);

            const movieDetailsResponse = await axios.get(`${API_MOVIES_URL}/${movieId}/shnd`);
            const seriesUrls = movieDetailsResponse.data.shindenUrls;

            if (!seriesUrls || !Array.isArray(seriesUrls) || seriesUrls.length === 0) continue;

            let allScrapedEpisodes = [];
            for (let i = 0; i < seriesUrls.length; i++) {
                const currentSeasonUrl = seriesUrls[i];
                console.log(`   🌐 Otwieram Sezon ${i + 1}: ${currentSeasonUrl}`);

                // Twój oryginalny networkidle2
                await page.goto(currentSeasonUrl, { waitUntil: 'networkidle2', timeout: 60000 });

                const seasonEpisodes = await page.evaluate(() => {
                    const rows = Array.from(document.querySelectorAll('table tbody tr'));
                    return rows.map(row => {
                        const cells = row.querySelectorAll('td');
                        if (cells.length < 2) return null;

                        const rowText = row.innerText.toLowerCase();
                        const isRecap = rowText.includes('recap') || rowText.includes('podsumowanie') || rowText.includes('specjalny') || rowText.includes('special') || rowText.includes('recaps');
                        if (isRecap) return null;

                        const linkTag = row.querySelector('a[href*="/episode/"]');
                        return { episodeUrl: linkTag ? linkTag.href : null };
                    }).filter(item => item !== null && item.episodeUrl !== null).reverse();
                });

                allScrapedEpisodes = allScrapedEpisodes.concat(seasonEpisodes);
            }

            let count = 0;
            for (const dbEp of dbEpisodes) {
                const targetAbsoluteNum = parseInt(dbEp.episodeNumber);
                const arrayIndex = targetAbsoluteNum - 1;
                const match = allScrapedEpisodes[arrayIndex];

                if (match && match.episodeUrl) {
                    await axios.put(`${API_EPISODES_URL}/${dbEp.id}/shinden-url`, { shindenUrl: match.episodeUrl });
                    console.log(`   🎯 Zmapowano odcinek ${targetAbsoluteNum} -> ${match.episodeUrl}`);
                    count++;
                }
            }
            totalMappedCount += count;
        }
        console.log(`\n✅ Zakończono Discovery: Zmapowano łącznie ${totalMappedCount} linków.`);
    } catch (error) {
        console.error(`❌ Błąd w Etapie 1 (Discovery): ${error.message}`);
    } finally {
        if (!page.isClosed()) await page.close();
    }
}

// Zmiana: Hunter przyjmuje teraz listę odcinków jako argument z Głównego Silnika
async function runHunter(browser, episodesToProcess) {
    console.log(`🏹 [ETAP 2: HUNTER] Wyszukuję embedy dla ${episodesToProcess.length} odcinków...`);

    try {
        for (const episode of episodesToProcess) {
            const id = episode.id;
            const title = episode.movieTitle ? `${episode.movieTitle} - Odc. ${episode.episodeNumber}` : `Odcinek ${episode.episodeNumber}`;
            const shindenUrl = episode.shindenUrl;

            console.log(`--- [START] ${title} (ID odcinka: ${id}) ---`);

            // WYWOŁANIE TWOJEJ ORYGINALNEJ FUNKCJI Z PIERWSZEGO KODU
            const embedLinks = await scrapeEmbed(browser, shindenUrl);

            if (embedLinks) {
                try {
                    // Czysty zapis do bazy za pomocą Twojego endpointu DTO
                    await axios.put(`${API_EPISODES_URL}/${id}`, { sourceEmbedUrl: embedLinks });
                    console.log(`💾 Zapisano w PostgreSQL paczkę linków:\n   -> ${embedLinks}`);
                } catch (apiErr) {
                    console.error(`🔥 Błąd API podczas zapisu embedów dla odcinka ${id}: ${apiErr.message}`);
                }
            } else {
                console.log(`⚠️ Nie zdobyto żadnych linków dla odcinka ${id}.`);
            }
            console.log(`--- [KONIEC] ---\n`);
        }
    } catch (error) {
        console.error(`❌ Błąd w Etapie 2 (Hunter): ${error.message}`);
    }
}

// ------------------------------------------------------------------------
// PONIŻEJ ZNAJDUJE SIĘ W 100% TWÓJ ORYGINALNY KOD scrapeEmbed
// Żadnych modyfikacji z mojej strony, żeby nie zepsuć ładowania tabeli
// ------------------------------------------------------------------------
async function scrapeEmbed(browser, targetUrl) {
    let foundLinks = [];
    const providersToHunt = ['cda', 'sibnet', 'dailymotion', 'vk', 'filemoon'];
    const page = await browser.newPage();

    for (const provider of providersToHunt) {
        let interceptedLink = null;

        try {
            page.removeAllListeners('response');
            page.removeAllListeners('request');

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
                continue;
            }

            console.log(`   🖱️ Szukam przycisku aktywacji...`);
            await new Promise(r => setTimeout(r, 2000));

            try {
                await Promise.all([
                    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {}),
                    page.evaluate(() => {
                        const exactBtn = document.querySelector('#player-show, a.ep-button, #load-player, .load-video-button');
                        if (exactBtn && exactBtn.offsetParent !== null) {
                            exactBtn.click();
                            return true;
                        }
                        const elements = Array.from(document.querySelectorAll('a, button, div.ep-button, div.button'));
                        const targetBtn = elements.find(el => {
                            const txt = el.innerText.toLowerCase().trim();
                            const isPlay = txt.includes('odtwórz') || txt === 'play' || txt.includes('załaduj wideo');
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

            let timer = 0;
            while (!interceptedLink && timer < 20) {
                if (page.isClosed()) break;

                interceptedLink = await page.evaluate((p) => {
                    const playerIframe = document.querySelector('#player-block iframe, .player-container iframe');
                    if (playerIframe && playerIframe.src && playerIframe.src.includes(p)) return playerIframe.src;
                    if (playerIframe && playerIframe.src && p === 'cda') return playerIframe.src;

                    const anyEFrame = document.querySelector(`iframe[src*="/e/"], iframe[src*="${p}"]`);
                    return anyEFrame ? anyEFrame.src : null;
                }, provider);

                if (interceptedLink) break;
                await new Promise(r => setTimeout(r, 500));
                timer++;
            }

            if (interceptedLink) {
                if (interceptedLink.startsWith('//')) interceptedLink = 'https:' + interceptedLink;
                if (!interceptedLink.includes('provider=')) {
                    interceptedLink += (interceptedLink.includes('?') ? '&' : '?') + `provider=${provider}`;
                }
                foundLinks.push(interceptedLink);
                console.log(`   ✅ SUKCES: ${interceptedLink.substring(0, 55)}...`);
            } else {
                console.log(`   ⚠️ Nie przechwycono linku po aktywacji.`);
            }

        } catch (e) {
            console.error(`   🔥 Błąd w trakcie przetwarzania [${provider.toUpperCase()}]: ${e.message}`);
        }
    }

    if (!page.isClosed()) await page.close();
    return foundLinks.length > 0 ? foundLinks.join(',') : null;
}

runMasterBot();