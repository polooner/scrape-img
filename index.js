import puppeteer from 'puppeteer';

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

async function downloadImages() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  console.log('page loading');
  await page.goto('https://evergreeninvestments.co/daily-dose-of-deals/', {
    waitUntil: 'networkidle0',
    timeout: 0,
  });
  console.log('page loaded');
  //Nitro links always work, src attribute does not because those are
  //dynamically assigned when a page with that element is shown
  let imgTags = await page.$$('. lazyloaded');
  for (let link of imgTags) {
    const attr = await page.evaluate(
      (el) => el.getAttribute('nitro-lazy-src'),
      link
    );
    console.log(attr);
  }

  // await page.evaluate(() => {
  //   const links = Array.from(document.querySelectorAll('img.lazyloaded')); // get all links
  //   return links.map((link) => link.nitrolazysrc); // return the first 20 links as an array of hrefs
  // });
  // await delay(10000);

  await page.screenshot({ encoding: 'binary', path: './image.png' });
  await browser.close();

  // const imgUrls = await page.$$eval('.', (links) => {
  //   return links.map((link) => link.href);
  // });

  // for (const url of imgUrls) {
  //   await page.goto(url, { waitUntil: 'networkidle2' });
  //   const imgSrc = await page.$eval('img', (img) => img.src);
  //   await page.goto(imgSrc, { waitUntil: 'networkidle2' });
  //   const buffer = await page.screenshot({ encoding: 'binary' });
  //   // You can save the image buffer to a file using a Node.js file system module
  //   // Example: fs.writeFileSync('image.png', buffer);
  // }

  // await browser.close();
}

downloadImages();
