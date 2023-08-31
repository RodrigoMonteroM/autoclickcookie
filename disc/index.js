import { chromium } from "playwright";
import fs from "fs";
(async () => {
    // Setup
    const browser = await chromium.launch({
        headless: false,
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("https://orteil.dashnet.org/cookieclicker/");
    try {
        const token = fs.readFileSync("./token.txt", "utf-8");
        await page.evaluate((tokenFile) => {
            localStorage.setItem("CookieClickerGame", tokenFile);
        }, token);
    }
    catch (err) {
        setTimeout(async () => {
            const tokenValue = await page.evaluate(() => {
                const tokenLS = localStorage.getItem("CookieClickerGame");
                return tokenLS;
            });
            fs.writeFileSync("./token.txt", tokenValue);
        }, 5000);
    }
    const buttonConsent = (await page.$(".fc-cta-consent")) ?? null;
    if (buttonConsent)
        await buttonConsent?.click();
    const englishSelected = (await page.$("#langSelect-EN")) ?? null;
    if (englishSelected)
        await englishSelected?.click();
    const startClicking = true;
    await autoSave(page);
    while (startClicking) {
        const cookieButton = await page.$("#bigCookie");
        await cookieButton?.click();
    }
    // Teardown
    /*  await context.close();
    await browser.close(); */
})();
function autoSave(page) {
    setInterval(async () => {
        try {
            const lsToken = await page.evaluate(() => {
                return localStorage.getItem("CookieClickerGame");
            });
            if (lsToken) {
                fs.writeFileSync("./token.txt", lsToken);
            }
            else {
                console.log("Error to get the token from ls");
            }
        }
        catch { }
    }, 10000);
}
