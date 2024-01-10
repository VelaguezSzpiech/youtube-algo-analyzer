const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors'); // Import the CORS middleware
const MongoClient = require('mongodb').MongoClient;

const MAX_TEST_TIME = 1 * 60 * 1000;
const app = express();
const port = 3003; // or any other port you prefer

app.use(cors());

async function scraper() {
    const startTime = new Date();
    
    let browser;
    try {
       
        browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.goto('https://www.youtube.com');
        await page.setViewport({ width: 1920, height: 100000 });

        await page.waitForSelector('.yt-spec-button-shape-next');
        await page.click('.yt-spec-button-shape-next[aria-label="Accept the use of cookies and other data for the purposes described"]');
        await page.waitForNavigation();
        await page.waitForSelector('[title="Trending"]', { timeout: 50000 }); // Adjust the timeout value as needed

        const hrefValue = await page.$eval('[title="Trending"]', (element) => {
            // Extract the href attribute value
            return element.getAttribute('href');
          });
          const fullURL = 'https://www.youtube.com' + hrefValue;

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
        for (const href of hrefs) {
           
        
            currentTime = new Date();
        
            if (currentTime - startTime > MAX_TEST_TIME) {
                console.log(`Maximum test time (${MAX_TEST_TIME} milliseconds) exceeded. Stopping the test.`);
                break;
            }
        
            // Navigate to the extracted URL
            await page.goto(href);
            await page.waitForSelector('#subscriber-count',"#videos-count");


        
            
            const subsData = await page.$$eval('#subscriber-count', (elements) =>
            elements.length > 0 ? elements.map((element) => element.textContent.trim()) : ['N/A']
            );
            
            const videosData = await page.$$eval('#videos-count', (elements) =>
            elements.length > 0 ? elements.map((element) => element.textContent.trim()) : ['N/A']
            );
            console.log("logging", subsData, "and", videosData, "...");
            
            console.log(`Navigated to ${href}`);
            subs.push(subsData);
            videos.push(videosData);
            await page.waitForTimeout(2000);
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

        await saveToDatabase(organizedData);

    return organizedData;

        

    } catch (error) {
        console.error(`An error occurred while visiting YouTube: ${error}`);
        throw error;
    } finally {
        await browser?.close();
    }
    
}

async function saveToDatabase(organizedData) {
// Update the connection string for your local MongoDB server
const uri = 'mongodb://localhost:27017/YoutubeDBName';  // Update the database name
const client = new MongoClient(uri);

try {
    await client.connect();
    const database = client.db('YoutubeDBName');  // Update the database name

    const collection = database.collection('YoutubeDBName');  // Update the collection name

    // Insert data into the collectionc
    console.log("adding to DB...")
    await collection.insertMany(organizedData);
    console.log("added to DB!")

} finally {
    await client.close();
}

}
async function startServer() {
    try {
        const organizedData = await scraper();
        // Start the server after defining routes
        const server = app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });

        // Define routes after starting the server
        app.get('/', (req, res) => {
            // Respond with the scraped data
            res.json(organizedData);
        });

    } catch (error) {
        console.error('Error:', error);
        process.exit(1); // Exit the process on error
    }
}

// Call startServer function to begin the process
startServer();

