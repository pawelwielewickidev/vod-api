const axios = require('axios');
const { spawn } = require('child_process');

// ==========================================
// ⚙️ KONFIGURACJA ŚRODOWISKA
// ==========================================
const API_EPISODES_URL = 'http://localhost:8080/api/episodes'; // Endpoint Spring Boota
const CONCURRENCY_LIMIT = 10; // Limit współbieżnych zapytań HTTP HEAD

// ==========================================
// 🔍 FUNKCJA WERYFIKUJĄCA STATUS STRUMIENIA
// ==========================================
async function checkStream(episode) {
    try {
        // Używamy metody HEAD na polu videoFilePath
        const response = await axios.head(episode.videoFilePath, {
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });

        // Kody 2xx i 3xx oznaczają, że serwer docelowy (np. Filemoon) posiada plik
        if (response.status >= 200 && response.status < 400) {
            return { episode, isAlive: true };
        }
    } catch (error) {
        // Ciche przechwycenie wyjątków sieciowych (403, 404, ERR_NAME_NOT_RESOLVED, Timeout)
    }

    return { episode, isAlive: false };
}

// ==========================================
// 🚀 GŁÓWNY SILNIK (WATCHDOG CORE)
// ==========================================
async function runWatchdog() {
    console.log(`\n🐕 [WATCHDOG] Inicjalizacja procesu weryfikacji hotlinków...`);
    const startTime = Date.now();
    let episodesToCheck = [];

    try {
        console.log(`📡 Pobieranie metadanych odcinków z API...`);
        const response = await axios.get(API_EPISODES_URL);

        // Filtrowanie rekordów posiadających wyekstrahowany hotlink wideo
        episodesToCheck = response.data.filter(ep => ep.videoFilePath !== null && ep.videoFilePath !== '');

    } catch (error) {
        console.error(`❌ Błąd komunikacji z backendem (Spring Boot): ${error.message}`);
        return;
    }

    console.log(`🔍 Wytypowano ${episodesToCheck.length} strumieni do walidacji.\n`);

    const deadEpisodes = [];

    // Przetwarzanie asynchroniczne w paczkach (Chunking) dla optymalizacji I/O
    for (let i = 0; i < episodesToCheck.length; i += CONCURRENCY_LIMIT) {
        const chunk = episodesToCheck.slice(i, i + CONCURRENCY_LIMIT);

        const results = await Promise.all(chunk.map(ep => checkStream(ep)));

        for (const result of results) {
            if (result.isAlive) {
                process.stdout.write('🟢');
            } else {
                process.stdout.write('🔴');
                deadEpisodes.push(result.episode);
            }
        }
    }

    console.log(`\n\n📊 Raport z audytu strumieni:`);
    console.log(`   ✅ Aktywne: ${episodesToCheck.length - deadEpisodes.length}`);
    console.log(`   💀 Wygasłe (403/404): ${deadEpisodes.length}`);

    // ==========================================
    // 🧹 OCZYSZCZANIE I WYZWALANIE AUTOMATORA
    // ==========================================
    if (deadEpisodes.length > 0) {
        console.log(`\n🗑️ Rozpoczynam inwalidację wygasłych linków w bazie danych...`);

        for (const ep of deadEpisodes) {
            try {
                // Inwalidacja poprzez ustawienie videoFilePath na null
                await axios.put(`${API_EPISODES_URL}/${ep.id}`, {
                    videoFilePath: null
                });
                console.log(`   🧹 Zresetowano rekord ID: ${ep.id}`);
            } catch (err) {
                console.error(`   ❌ Błąd zerowania rekordu ID ${ep.id}: ${err.message}`);
            }
        }

        console.log(`\n⚙️ Wyzwalanie subprocesu naprawczego (automator.js)...`);
        try {
            console.log(`\n--- Logi systemowe: Automator (Na żywo) ---`);

            // Używamy 'spawn' z opcją 'inherit', co łączy konsole obu skryptów
            await new Promise((resolve, reject) => {
                const automatorProcess = spawn('node', ['automator.js'], { stdio: 'inherit' });

                // Nasłuchujemy zamknięcia procesu Automatora
                automatorProcess.on('close', (code) => {
                    console.log(`\n---------------------------------`);
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`Automator zakończył pracę z kodem błędu: ${code}`));
                    }
                });

                // Przechwycenie błędów na poziomie inicjalizacji podprocesu
                automatorProcess.on('error', (err) => {
                    reject(err);
                });
            });

        } catch (execErr) {
            console.error(`🔥 Krytyczny błąd podczas alokacji subprocesu: ${execErr.message}`);
        }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`🏁 Cykl walidacji zakończony. Czas egzekucji: ${duration}s.`);
}

// ==========================================
// ⚡ URUCHOMIENIE RĘCZNE
// ==========================================
runWatchdog();

// ==========================================
// ⏰ MODUŁ HARMONOGRAMU (CRON)
// ==========================================
/*
const HOUR_IN_MS = 60 * 60 * 1000;
console.log(`⏳ Scheduler załadowany. Cykl weryfikacyjny: 1h.`);
setInterval(async () => {
    console.log(`\n⏰ Wyzwolenie z harmonogramu: ${new Date().toLocaleString()}`);
    await runWatchdog();
}, HOUR_IN_MS);
*/