import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

async function downloadImages() {
  let data = {};

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  console.log('page loading');
  await page.goto(process.env.WEBSITE, {
    waitUntil: 'networkidle0',
    timeout: 0,
  });
  console.log('page loaded');
  //Nitro links always work, src attribute does not because those are
  //dynamically assigned when a page with that element is shown - unless
  //streetview failed, which gives it a faulty src href
  let numberOfImages = await page.$$eval(
    '.property-image',
    (divs) => divs.length
  );
  console.log(numberOfImages);

  //iterate over number of property divs, save img tags nitro-lazy-src links
  for (let i = 1; i < numberOfImages + 1; i++) {
    let aTag = await page.$x(
      `/html/body/div[1]/div/div/div[1]/div[5]/a[${i}]/div/div[1]/img`
    );
    let src = await page.evaluate(
      (el) => el.getAttribute('nitro-lazy-src'),
      aTag[0]
    );
    console.log(src);
    if (!src) {
      //Most of the time, this means StreetView picture is empty
      //and nitro-lazy-src does not exist. It still downloads it to keep hierarchy
      let srcNotNitro = await page.evaluate(
        (el) => el.getAttribute('src'),
        aTag[0]
      );
      saveImg(i, srcNotNitro);
      console.log(`Saved file number ${i}`);
    } else {
      data[i] = src;
      saveImg(i, src);
      console.log(`Saved file number ${i}`);
    }
  }
  //TODO: check if file exists by comparing links to .json file.
  //will be helpful and time-saving if we want to keep this workflow

  let jsonData = JSON.stringify(data);
  fs.writeFileSync('all_links.json', jsonData);

  await browser.close();
}

downloadImages();

const saveImg = async (index, srcLink) => {
  const fileName = index.toString() + '.jpg';
  const filePath = './images/' + fileName;
  const response = await fetch(srcLink);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(filePath, buffer);
};
