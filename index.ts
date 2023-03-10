import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import * as fs from 'fs';

interface ImageInfo {
  src: string;
  filename: string;
}

// Browser and page instance
async function instance() {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();
  return { page, browser };
}

// Extract all imageLinks from the page
async function extractImageLinks() {
  const { page, browser } = await instance();

  // Get the page url from the user
  let baseURL = process.argv[2] ? process.argv[2] : 'https://stocksnap.io';

  try {
    await page.goto(baseURL, { waitUntil: 'networkidle0' });
    await page.waitForSelector('body');

    let imageLinks = await page.evaluate(() => {
      let imgTags = Array.from(document.querySelectorAll('img'));

      let imageArray: ImageInfo[] = [];

      imgTags.map((image) => {
        let src = image.src;

        //input thing
        const minPriceInput = await page.$('.input-slider-range-value2');

        let srcArray = src.split('/');
        let pos = srcArray.length - 1;
        let filename = srcArray[pos];

        imageArray.push({
          src,
          filename,
        });
      });

      return imageArray;
    });

    await browser.close();
    return imageLinks;
  } catch (err) {
    console.log(err);
  }
}

(async function () {
  console.log('Downloading images...');

  let imageLinks = await extractImageLinks();

  imageLinks?.map((image) => {
    let filename = `./images/${image.filename}`;
    saveImageToDisk(image.src, filename);
  });

  console.log('Download complete, check the images folder');
})();

function saveImageToDisk(url: string, filename: string) {
  fetch(url)
    .then((res) => {
      const dest = fs.createWriteStream(filename);
      res.body?.pipe(dest);
    })
    .catch((err) => {
      console.log(err);
    });
}
