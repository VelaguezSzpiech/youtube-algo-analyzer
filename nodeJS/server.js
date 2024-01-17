const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const bodyParser = require('body-parser');

const MAX_TEST_TIME = 1 * 60 * 300000;
const app = express();
const port = 3003;

app.use(cors());
app.use(bodyParser.json());
let scrapingInProgress = false;
let storedData = [];
let pagestoredData = [];

app.get('/get/trend', async (req, res,videoCount) => {
    try {
      if (scrapingInProgress) {
        res.json({ message: 'Scraping in progress, please wait' });
      } else {
          res.json(storedData);
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('An error occurred while handling the GET request.');
    }
});
app.get('/get/page', async (req, res,videoCount) => {
    try {
      if (scrapingInProgress) {
        res.json({ message: 'Scraping in progress, please wait' });
      } else {
          res.json(pagestoredData);
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('An error occurred while handling the GET request.');
    }
});
app.post('/post', async (req, res) => {
    try {
      const channel = req.body.data;
      const videoCount = req.body.data2;
      const functionNames = req.body.functions;

      if (scrapingInProgress) {
        res.json({ message: 'Scraping already in progress, please wait' });
        return;
      }
  
      scrapingInProgress = true;
     

      for (const functionName of functionNames) {
        if (functionName === 'trendscraper') {
          await trendscraper(channel, videoCount);
        } else if (functionName === 'pagescraper') {
          await pagescraper(channel, videoCount);
        }
      }
      res.json({ message: 'Data collected and processed', channel, videoCount });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('An error occurred while handling the POST request.');
    } finally {
      scrapingInProgress = false;
    }
  });


  const youtube ="https://www.youtube.com/"
async function trendscraper(channel,videoCount) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new"
        });
        const page = await browser.newPage();
        await page.goto(youtube);
        await page.setViewport({
            width: 1920,
            height: 100000
        });

        await page.waitForSelector('.yt-spec-button-shape-next');
        await page.click('.yt-spec-button-shape-next[aria-label="Accept the use of cookies and other data for the purposes described"]');
        await page.waitForNavigation();
        await page.waitForSelector('[title="Trending"]'); // Adjust the timeout value as needed

        const hrefValue = await page.$eval('[title="Trending"]', (element) => {
            // Extract the href attribute value
            return element.getAttribute('href');
        });
        const fullURL = youtube + hrefValue;

        await page.goto(fullURL);

        const videoTitle = await page.$$eval('#video-title', (elements) => elements.map((element) => element.textContent.trim()));

        const views = await page.$$eval('.inline-metadata-item.style-scope.ytd-video-meta-block', (elements) => elements.map((element) => element.textContent.trim()));

        const thumbnail = await page.$$eval('.yt-core-image--fill-parent-height.yt-core-image--fill-parent-width.yt-core-image.yt-core-image--content-mode-scale-aspect-fill.yt-core-image--loaded', (elements) => elements.map((element) => element.getAttribute('src')));

        const subs = [];
        const videos = [];

        const selectorForSecondElement = 'div#text-container yt-formatted-string.style-scope.ytd-channel-name.complex-string a.yt-simple-endpoint.style-scope.yt-formatted-string';

        const hrefs = await page.$$eval(selectorForSecondElement, (anchors) => anchors.map((anchor) => anchor.href));
        
        let pageCounter = 0;

        // Visit each URL
        currentTime = new Date();
        for (const href of hrefs) {
            if (pageCounter >= videoCount) {
                console.log(`Visited ${videoCount} pages as per the specified videoCount.`);
                break;
            }

            // Navigate to the extracted URL
            await page.goto(href);
            await page.waitForSelector('#subscriber-count', "#videos-count");

            const subsData = await page.$$eval('#subscriber-count', (elements) => elements.length > 0 ? elements.map((element) => element.textContent.trim()) : ['N/A']);

            const videosData = await page.$$eval('#videos-count', (elements) => elements.length > 0 ? elements.map((element) => element.textContent.trim()) : ['N/A']);
            console.log("logging", subsData, "and", videosData, "...");

            console.log(`Navigated to ${href}`);
            subs.push(subsData);
            videos.push(videosData);
            await page.waitForTimeout(100);
            pageCounter++;
        }

        const view = [];
        const timeago = [];

        views.forEach((item, index) => {
            if (index % 2 === 0) {
                // Even index, add to the first array
                view.push(item);
            } else {
                // Odd index, add to the second array
                timeago.push(item);
            }
        });

        const organizedData = videoTitle.map((title, index) => ({
          thumbnail: thumbnail[index],
          videoTitle: title,
          views: view[index],
            how_old: timeago[index],
            channelName: hrefs[index],
            subscriberCount: subs[index],
            amountOfVideos: videos[index],
            date: new Date()
        }));

        storedData = organizedData.slice(0, videoCount);
        return { storedData, organizedData };
    } catch (error) {
        console.error(`An error occurred while visiting YouTube: ${error}`);
        throw error;
    } finally {+
        await browser?.close();
        console.log("done scraping the trend page");
    }
}
async function pagescraper(channel,videoCount){
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: "new"
        });
        console.log(videoCount)
        const page = await browser.newPage();
        await page.goto(youtube);
        await page.setViewport({ width: 1920, height: 10080 });

        await page.waitForSelector('.yt-spec-button-shape-next');
        await page.click('.yt-spec-button-shape-next[aria-label="Accept the use of cookies and other data for the purposes described"]');
        await page.waitForNavigation();

        
        await page.goto(`${channel}/videos`);
     
     
        await new Promise(resolve => setTimeout(resolve, 1));  // Wait for 1 second

        currentTime = new Date();
       

        await page.waitForSelector('#subscriber-count', "#videos-count");


       const subsData = await page.$$eval('#subscriber-count', (elements, videoCount) => {
    return elements.slice(0, videoCount).map(element => element.textContent.trim());
}, videoCount);

const videosData = await page.$$eval('#videos-count', (elements, videoCount) => {
    return elements.slice(0, videoCount).map(element => element.textContent.trim());
}, videoCount);

const channelName = await page.$$eval('#channel-handle', (elements, videoCount) => {
    return elements.slice(0, videoCount).map(element => element.textContent.trim());
}, videoCount);

const videoTitle = await page.$$eval('#video-title', (elements, videoCount) => {
    return elements.slice(0, videoCount).map(element => element.textContent.trim());
}, videoCount);

const views = await page.$$eval('.style-scope ytd-video-meta-block', (elements, videoCount) => {
    return elements.slice(0, videoCount).map(element => element.textContent.trim());
}, videoCount);

const thumbnail = await page.$$eval('.yt-core-image--fill-parent-height.yt-core-image--fill-parent-width.yt-core-image.yt-core-image--content-mode-scale-aspect-fill.yt-core-image--loaded', (elements, videoCount) => {
    return elements.slice(0, videoCount).map(element => element.getAttribute('src'));
}, videoCount);

       
     
      
        const organizedData = videoTitle.map((title, index) => ({
          thumbnail: thumbnail[index] || 'N/A',
          videoTitle: title || 'N/A',
          views: views[0] || 'N/A',
          channelName: channelName[0] || 'N/A',
          subscriberCount: subsData[0] || 'N/A',
          amountOfVideos: videosData[0] || 'N/A',
      }));
      

        pagestoredData = organizedData;

        return { pagestoredData };
    } catch (error) {
        console.error(`An error occurred while visiting YouTube: ${error}`);
        throw error;
    } finally {
        await browser?.close();
        console.log("done scraping the "+channel);
    }
}
// Example usage:
// scraper('https://www.youtube.com/', 5).then(result => console.log(result));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
