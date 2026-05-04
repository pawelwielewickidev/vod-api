const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function getDirectLink(embedUrl) {
    console.log(`\n🚀 Odpalam skrypt z wbudowanym AdBlockiem: ${embedUrl}`);

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--mute-audio']
    });

    const page = await browser.newPage();
    let targetVideoUrl = null;
    let found = false;

    // WAŻNE: Włączamy możliwość ingerencji w ruch sieciowy
    await page.setRequestInterception(true);

    const blackList = ['filmy_o_przyjazni', 'reklama', 'pre-roll', 'ads', 'gemius'];

    page.on('request', request => {
        // Jeśli już mamy film, puszczamy resztę ruchu normalnie
        if (found) {
            request.continue();
            return;
        }

        const url = request.url().toLowerCase();

        // --- 1. ZABIJAMY REKLAMY ---
        const isAd = blackList.some(word => url.includes(word));
        if (isAd) {
            console.log(`🔪 UBIJAM REKLAMĘ: ${url.substring(0, 50)}...`);
            request.abort(); // To sprawi, że player dostanie błąd i pominie reklamę!
            return;
        }

        // --- 2. ŁAPIEMY WŁAŚCIWY FILM ---
        // Szukamy mp4 lub manifestu m3u8 (na wypadek gdyby CDA zmieniło format)
        if (url.includes('.mp4') || url.includes('.m3u8')) {
            if (!url.includes('google') && !url.includes('favicon')) {
                found = true;
                targetVideoUrl = request.url();

                console.log(`\n✅ ZNALEZIONO GŁÓWNY LINK!`);
                console.log(`🔗 Baza URL: ${targetVideoUrl.split('?')[0]}`);
            }
        }

        // Puszczamy całą resztę ruchu (obrazki, skrypty strony)
        request.continue();
    });

    try {
        await page.goto(embedUrl, { waitUntil: 'networkidle2' });

        console.log("🖱️ Klikam Play...");
        await page.mouse.click(400, 300);

        // Dajemy mu 20 sekund. Skoro reklamy są zabijane, odcinek powinien ruszyć w 2 sekundy.
        await new Promise(r => setTimeout(r, 20000));

    } catch (err) {
        console.error('❌ Błąd:', err.message);
    } finally {
        await browser.close();

        if (targetVideoUrl) {
            console.log("\n=========================================================");
            console.log("🎯 SKOPIUJ TEN LINK DO BAZY DANYCH (kolumna video_file_path):");
            console.log(targetVideoUrl); // Zostawiamy z parametrami, mogą być ważne dla autoryzacji CDA
            console.log("=========================================================\n");
        } else {
            console.log("😥 Nie udało się wyciągnąć głównego linku.");
        }
    }
}

const targetUrl = process.argv[2] || 'https://ebd.cda.pl/620x368/164566574f';
getDirectLink(targetUrl);