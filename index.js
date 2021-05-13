//Без цих рядків бібліотека боту видає якісь дивні повідомлення в консоль
process.env["NTBA_FIX_350"] = 1;
process.env.NTBA_FIX_319 = 1;
//Без цього рядку вилітає помилка версії драйвера
require('chromedriver');

//Підключення модулів
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

//Підключаємо файл з параметрами
const params = require("./params")
//Задаємо назву файлу для запису та надсилання зображення
const src = 'captcha.jpg';

let {Builder, By, Key, util} = require('selenium-webdriver');
const driver = new Builder().forBrowser('chrome').build();

const bot = new TelegramBot(params.bot_token, {
        polling: true
});
    
let resp = ""
//Оголошуємо функції

async function decodeBase64Image(dataString) {
    let matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    response.type = matches[1];
    response.data = Buffer.from(matches[2], 'base64');

    return response;
}

//Оголошуємо і запускаємо головну функцію
(async function start() {
    driver.get("https://captcha.com/demos/features/captcha-demo.aspx");
    let data = await driver.findElement(By.id("demoCaptcha_CaptchaImage")).getAttribute("src");

    let imageBuffer =  await decodeBase64Image(data);

    fs.writeFileSync(src, imageBuffer.data, function(err, result) {
        if (err) console.log('error', err);
    });

    bot.sendPhoto(params.tg_id, src);


    
    bot.onText(/(.+)/, (msg, match) => {
        if (msg.chat.id == params.tg_id) {
            enterCode(match[1]);
        }
    });

    async function enterCode(text) {
        await driver.findElement(By.name("captchaCode")).sendKeys(text,Key.RETURN);
    }
})();


