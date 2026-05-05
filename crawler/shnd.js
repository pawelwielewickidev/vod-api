const puppeteer = require('puppeteer');

async function getShindenEmbed(episodeUrl) {
    console.log(`\n🕵️‍♂️ [Sniffing Mode] Uruchamiam podsłuch sieciowy...`);

    let browser;
    let finalEmbedLink = null;

    try {
        browser = await puppeteer.connect({
            browserURL: 'http://127.0.0.1:9222',
            defaultViewport: null
        });

        const page = await browser.newPage();

        // --- MAGIA: PODSŁUCH SIECIOWY ---
        // Nasłuchujemy każdego zapytania, które wychodzi z przeglądarki
        await page.setRequestInterception(false); // Nie blokujemy, tylko patrzymy

        page.on('request', request => {
            const url = request.url();

            // 1. Szukamy czystego embeda bezpośrednio
            if (url.includes('ebd.cda.pl') && url.includes('121537')) { // Twoje ID filmu
                if (!finalEmbedLink && !url.includes('xml_pool')) {
                    finalEmbedLink = url;
                    console.log(`🎯 Znaleziono czysty Embed: ${url}`);
                }
            }

            // 2. Jeśli złapaliśmy ten "brudny" link XML Pool, wyciągamy z niego prawdę
            if (url.includes('xml_pool') && url.includes('requestUrl=')) {
                try {
                    const params = new URLSearchParams(url.split('?')[1]);
                    const rawUrl = params.get('requestUrl');
                    if (rawUrl && !finalEmbedLink) {
                        finalEmbedLink = decodeURIComponent(rawUrl);
                        console.log(`🧼 Wyczyszczono link z XML Pool: ${finalEmbedLink}`);
                    }
                } catch (e) { /* ignorujemy błędy parsowania */ }
            }
        });

        console.log("🚀 Wchodzę na stronę...");
        await page.goto(episodeUrl, { waitUntil: 'domcontentloaded' });

        console.log("🔍 Klikam 'Pokaż' w tabeli...");
        await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table tbody tr'));
            for (let row of rows) {
                if (row.innerText.toLowerCase().includes('cda')) {
                    const btn = row.querySelector('a, button, .fa-play, a.button');
                    if (btn) btn.click();
                }
            }
        });

        console.log("\n⚡ TERAZ TWOJA KOLEJ (W CHROME):");
        console.log("1. Jeśli widzisz reklamę, poczekaj.");
        console.log("2. Jeśli musisz kliknąć PLAY na środku, ZRÓB TO RĘCZNIE.");
        console.log("3. Jak tylko wideo ruszy, bot powinien złapać link.");
        console.log("⏳ Czekam na sygnał z sieci (max 90s)...");

        // Czekamy, aż zmienna finalEmbedLink zostanie wypełniona przez listener 'page.on'
        const startTime = Date.now();
        while (!finalEmbedLink && Date.now() - startTime < 90000) {
            await new Promise(r => setTimeout(r, 1000));
        }

        if (finalEmbedLink) {
            console.log(`\n🏆 [MAMY TO!] Bot podsłuchał link:`);
            console.log(`👉 ${finalEmbedLink}`);
        } else {
            console.log("❌ Upłynął czas, nie przechwycono żadnego linku CDA.");
        }

        console.log("\n🚪 Zamykam kartę za 5 sekund.");
        await new Promise(r => setTimeout(r, 5000));
        await page.close();
        browser.disconnect();

    } catch (error) {
        console.error(`🔥 Błąd krytyczny: ${error.message}`);
        if (browser) browser.disconnect();
    }
}

const target = 'https://shinden.pl/episode/55778-jujutsu-kaisen/view/192876';
getShindenEmbed(target);