const {chromium}=require('C:/Users/enzo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage();
 await page.goto('https://byui-cse.github.io/wdd-audits/wdd231-w02-chamber-directory.html');
 await page.locator('#username').fill('enzotorricella');
 await page.locator('#runAudit').click();
 await page.waitForFunction(()=>document.querySelector('#report').innerText.includes('CSS'),{},{timeout:90000});
 await page.waitForTimeout(5000);
 const report=await page.locator('#report').innerText();
 fs.writeFileSync(__dirname+'/chamber-page-audit.txt',report);
 console.log(report);
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
