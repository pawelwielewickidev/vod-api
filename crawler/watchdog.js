const axios = require('axios');
const { spawn } = require('child_process');

// ==========================================
// ⚙️ KONFIGURACJA ŚRODOWISKA
// ==========================================
const API_EPISODES_URL = 'http://localhost:8080/api/episodes';
const CONCURRENCY_LIMIT = 10;
const DEBUG_LOGGING = true;

// ==========================================
// 🛠️ HELPERY
// ==========================================

async function runScript(scriptName) {
    console.log(`\n⚙️ Wyzwalanie subprocesu (${scriptName})...`);
    try {
        console.log(`\n--- Logi systemowe: ${scriptName} (Na żywo) ---`);
        await new Promise((resolve, reject) => {
            const childProcess = spawn('node', [scriptName], { stdio: 'inherit' });

            childProcess.on('close', (code) => {
                console.log(`\n---------------------------------`);
                if (code === 0) {
                    console.log(`✅ Subproces ${scriptName} zakończył pracę pomyślnie.`);
                    resolve();
                } else {
                    reject(new Error(`${scriptName} zakończył pracę z kodem błędu: ${code}`));
                }
            });

            childProcess.on('error', (err) => {
                reject(err);
            });
        });
    } catch (execErr) {
        console.error(`🔥 Krytyczny błąd podczas uruchamiania ${scriptName}: ${execErr.message}`);
        throw execErr;
    }
}

async function checkUrl(url, isEmbed = false) {
    if (!url) return false;

    if (url.startsWith('//')) {
        url = 'https:' + url;
    }

    try {
        const response = await axios.get(url, {
            signal: AbortSignal.timeout(7000),
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Referer': url,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            },
            maxRedirects: 5
        });

        if (response.status >= 200 && response.status < 300) {
            if (isEmbed && typeof response.data === 'string') {
                const html = response.data.toLowerCase();
                const deadKeywords = [
                    'file not found', 'video not found', 'file was deleted',
                    'video was deleted', 'not found', 'banned', 'removed',
                    'nie znaleziono', 'usunięto', 'no such file'
                ];

                const isDead = deadKeywords.some(keyword => html.includes(keyword));
                if (isDead) return false;
            }
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}

// ==========================================
// 🚀 GŁÓWNY SILNIK (WATCHDOG CORE)
// ==========================================
async function runWatchdog() {
    console.log(`\n🐕 [WATCHDOG] Inicjalizacja cyklu walidacji...`);
    const startTime = Date.now();
    let allEpisodes = [];
    let shndMasterNeeded = false;
    let automatorNeeded = false;

    try {
        console.log(`📡 Pobieranie metadanych z API...`);
        const response = await axios.get(API_EPISODES_URL);
        allEpisodes = response.data;
    } catch (error) {
        console.error(`❌ Błąd komunikacji z backendem (Spring Boot): ${error.message}`);
        return;
    }

    // ==========================================
    // 1. WERYFIKACJA EMBEDÓW (sourceEmbedUrl)
    // ==========================================
    const episodesMissingStream = allEpisodes.filter(ep => !ep.videoFilePath);
    const embedsToVerify = episodesMissingStream.filter(ep => ep.sourceEmbedUrl);
    const totallyEmptyEpisodes = episodesMissingStream.filter(ep => !ep.sourceEmbedUrl);

    // Jeśli mamy odcinki bez ŻADNEGO linku, shnd-master musi ruszyć
    if (totallyEmptyEpisodes.length > 0) {
        shndMasterNeeded = true;
    }

    if (embedsToVerify.length > 0) {
        console.log(`\n🔍 Walidacja ${embedsToVerify.length} istniejących embedów pod kątem Soft 404...`);
        const deadEmbeds = [];

        for (let i = 0; i < embedsToVerify.length; i += CONCURRENCY_LIMIT) {
            const chunk = embedsToVerify.slice(i, i + CONCURRENCY_LIMIT);
            const results = await Promise.all(chunk.map(async ep => ({
                isAlive: await checkUrl(ep.sourceEmbedUrl, true),
                episode: ep
            })));

            for (const result of results) {
                if (!result.isAlive) {
                    process.stdout.write('🔴');
                    deadEmbeds.push(result.episode);
                } else {
                    process.stdout.write('🟢');
                }
            }
        }

        if (deadEmbeds.length > 0) {
            console.log(`\n\n🗑️ Wykryto ${deadEmbeds.length} nieaktywnych embedów. Usuwanie z bazy danych...`);
            shndMasterNeeded = true;

            for (const ep of deadEmbeds) {
                try {
                    // Czyścimy sourceEmbedUrl, aby shnd-master wiedział, że musi pobrać nowy
                    await axios.put(`${API_EPISODES_URL}/${ep.id}`, { sourceEmbedUrl: null });
                    if (DEBUG_LOGGING) console.log(`   🧹 Oczyszczono rekord ID: ${ep.id}`);
                } catch (err) {
                    console.error(`   ❌ Błąd podczas czyszczenia ID ${ep.id}: ${err.message}`);
                }
            }
        } else {
            console.log(`\n\n✅ Wszystkie obecne embedy są poprawne.`);
            // Jeśli nie trzeba szukać nowych embedów, ale brakuje hotlinków, odpalamy Automatora
            if (embedsToVerify.length > 0) automatorNeeded = true;
        }
    }

    // ==========================================
    // 2. WERYFIKACJA HOTLINKÓW (videoFilePath)
    // ==========================================
    const streamsToCheck = allEpisodes.filter(ep => ep.videoFilePath);
    const deadStreams = [];

    if (streamsToCheck.length > 0) {
        console.log(`\n🔍 Walidacja ${streamsToCheck.length} hotlinków (.m3u8)...`);

        for (let i = 0; i < streamsToCheck.length; i += CONCURRENCY_LIMIT) {
            const chunk = streamsToCheck.slice(i, i + CONCURRENCY_LIMIT);
            const results = await Promise.all(chunk.map(async ep => ({
                isAlive: await checkUrl(ep.videoFilePath, false),
                episode: ep
            })));

            for (const result of results) {
                if (!result.isAlive) {
                    process.stdout.write('🔴');
                    deadStreams.push(result.episode);
                } else {
                    process.stdout.write('🟢');
                }
            }
        }

        if (deadStreams.length > 0) {
            console.log(`\n\n🗑️ Inwalidacja ${deadStreams.length} wygasłych strumieni...`);
            automatorNeeded = true;

            for (const ep of deadStreams) {
                try {
                    await axios.put(`${API_EPISODES_URL}/${ep.id}`, { videoFilePath: null });
                } catch (err) {
                    console.error(`   ❌ Błąd: ${err.message}`);
                }
            }
        }
    }

    // ==========================================
    // 3. EFEKT DOMINA (ORKIESTRACJA)
    // ==========================================
    try {
        if (shndMasterNeeded) {
            console.log(`\n🚀 [MASTER] Uruchamiam proces pozyskiwania nowych embedów...`);
            await runScript('shnd-master.js');
            automatorNeeded = true;
        }

        if (automatorNeeded) {
            console.log(`\n🚀 [HUNTER] Uruchamiam proces ekstrakcji hotlinków...`);
            await runScript('automator.js');
        } else if (!shndMasterNeeded) {
            console.log('\n✅ Baza danych jest aktualna.');
        }
    } catch (e) {
        console.error(`\n🔥 Przerwano cykl z powodu błędu krytycznego w subprocesie.`);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`🏁 Zakończono w ${duration}s.`);
}

runWatchdog();