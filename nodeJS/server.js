const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const bodyParser = require('body-parser');

const MAX_TEST_TIME = 1 * 60 * 300;
const app = express();
const port = 3003;


app.use(cors());
app.use(bodyParser.json());
let scrapingInProgress = false;
let storedData = []; // Variable to store the collected data
// GET route for handling requests
app.get('/', async (req, res) => {
  try {
    // If scraping is in progress, inform the client
    if (scrapingInProgress) {
      res.json({ message: 'Scraping in progress, please wait' });
    } else {
      // If there is stored data, return it
      if (storedData.length > 10) {
        res.json({ message: 'Data is collected', data: storedData });
      } else {
        res.json({ message: 'No data collected yet' });
      }
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while handling the GET request.');
  }
});

// POST route for handling data submission and starting scraping
app.post('/', async (req, res) => {
  try {
    // Assuming the client sends data in the format { data: "someData", videoCount: 5 }
    const { data: incomingData, videoCount } = req.body;

    // Check if scraping is already in progress
    if (scrapingInProgress) {
      res.json({ message: 'Scraping already in progress, please wait' });
      return;
    }

    // Store the incoming data in a string variable
    
      scrapingInProgress = true; // Set the flag to indicate scraping is in progress
      storedData = []; // Reset stored data for a new scraping session
      await scraper(incomingData, videoCount);
      res.json({ message: 'Data collected and processed', data: storedData });
   
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while handling the POST request.');
  } finally {
    scrapingInProgress = false; // Reset the flag when scraping is done
  }
});

let startTime = new Date();
async function scraper(url, videoCount) {
  let browser;

  try {
    browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url);
    await page.setViewport({ width: 1920, height: 100000 });
 

    await page.waitForSelector('.yt-spec-button-shape-next');
    await page.click('.yt-spec-button-shape-next[aria-label="Accept the use of cookies and other data for the purposes described"]');
    await page.waitForNavigation();
    await page.waitForSelector('[title="Trending"]'); // Adjust the timeout value as needed

    const hrefValue = await page.$eval('[title="Trending"]', (element) => {
        // Extract the href attribute value
        return element.getAttribute('href');
      });
      const fullURL = url + hrefValue;

      await page.goto(fullURL);

    const videoTitle = await page.$$eval('#video-title', (elements) =>
        elements.map((element) => element.textContent.trim())
    );

    const views = await page.$$eval('.inline-metadata-item.style-scope.ytd-video-meta-block', (elements) =>
        elements.map((element) => element.textContent.trim())
    );

    const thumbnail = await page.$$eval('.yt-core-image--fill-parent-height.yt-core-image--fill-parent-width.yt-core-image.yt-core-image--content-mode-scale-aspect-fill.yt-core-image--loaded', (elements) =>
        elements.map((element) => element.getAttribute('src'))
    );

    const subs = [];
    const videos = [];

    const selectorForSecondElement = 'div#text-container yt-formatted-string.style-scope.ytd-channel-name.complex-string a.yt-simple-endpoint.style-scope.yt-formatted-string';

    const hrefs = await page.$$eval(selectorForSecondElement, (anchors) => {
        return anchors.map((anchor) => anchor.href);
    });
    
    // Visit each URL
    currentTime = new Date();
    for (const href of hrefs) {
    
      // Navigate to the extracted URL
      await page.goto(href);
      await page.waitForSelector('#subscriber-count',"#videos-count");
      
      
      if (currentTime - startTime > MAX_TEST_TIME) {
          console.log(`Maximum test time (${MAX_TEST_TIME} milliseconds) exceeded. Stopping the test.`);
          break;
      }
      
        const subsData = await page.$$eval('#subscriber-count', (elements) =>
        elements.length > 0 ? elements.map((element) => element.textContent.trim()) : ['N/A']
        );
        
        const videosData = await page.$$eval('#videos-count', (elements) =>
        elements.length > 0 ? elements.map((element) => element.textContent.trim()) : ['N/A']
        );
        console.log("logsging", subsData, "and", videosData, "...");
        
        console.log(`Navigated to ${href}`);
        subs.push(subsData);
        videos.push(videosData);
        await page.waitForTimeout(100);
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
            how_old:timeago[index],
            channelName:hrefs[index],
            subscibercount:subs[index],
            amountofvideos: videos[index],
            date: new Date()
        
    }));

    
    
    storedData = organizedData.slice(0, videoCount);
    return storedData,organizedData
  } catch (error) {
    console.error(`An error occurred while visiting YouTube: ${error}`);
    throw error;
  } finally {
    await browser?.close();
    console.log("done scraping")
  }
}


// Call startServer function to begin the process

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});