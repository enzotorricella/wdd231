const { chromium } = require('C:/Users/enzo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('fs');
const assert = require('assert/strict');
(async () => {
 const browser = await chromium.launch({channel:'chrome',headless:true});
 const page = await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/chamber/directory.html');
 await page.waitForFunction(()=>document.querySelectorAll('.member').length===7);
 await page.screenshot({path:__dirname+'/directory-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'List',exact:true}).click();
 assert.equal(await page.locator('#members').getAttribute('class'),'list');
 assert.equal(await page.locator('.member img').first().isVisible(),false);
 await page.locator('#search').fill('coffee');
 assert.equal(await page.locator('.member').count(),1);
 await page.locator('#search').fill('');
 await page.locator('#category').selectOption('Food & drink');
 assert.equal(await page.locator('.member').count(),2);
 await page.locator('#search').fill('not-a-business');
 assert.equal(await page.locator('.member').count(),0);
 assert.match(await page.locator('#status').innerText(),/No businesses/);
 await page.locator('#search').fill('');
 await page.locator('#category').selectOption('all');
 await page.getByRole('button',{name:'Grid',exact:true}).click();
 for(const width of [320,375,768,1440]) {
   await page.setViewportSize({width,height:900});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${width}`);
 }
 await page.setViewportSize({width:375,height:812});
 await page.getByRole('button',{name:'Open navigation menu',exact:true}).click();
 assert.equal(await page.locator('#menu-button').getAttribute('aria-expanded'),'true');
 assert.equal(await page.locator('#navigation').isVisible(),true);
 await page.getByRole('button',{name:'Close navigation menu',exact:true}).click();
 await page.screenshot({path:__dirname+'/directory-mobile.png',fullPage:true});
 for(const file of ['index.html','join.html','discover.html']) {
  const response=await page.goto('http://127.0.0.1:8765/chamber/'+file);
  assert.equal(response.status(),200);
 }
 await page.route('**/data/members.json',route=>route.fulfill({status:503,body:'Unavailable'}));
 await page.goto('http://127.0.0.1:8765/chamber/directory.html');
 await page.locator('#retry').waitFor({state:'visible'});
 await page.unroute('**/data/members.json');
 await page.locator('#retry').click();
 await page.waitForFunction(()=>document.querySelectorAll('.member').length===7);
 assert.deepEqual(errors,[]);
 console.log('PASS: 7 members, grid/list, search, sector filters, empty state, retry, navigation, linked pages, and widths 320/375/768/1440. No JS errors.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
