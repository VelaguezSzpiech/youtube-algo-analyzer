const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors'); // Import the CORS middleware


const app = express();
const port = 3003; // or any other port you prefer

app.use(cors());

async function scraper() {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.goto('https://www.youtube.com');
        await page.setViewport({ width: 1920, height: 100000 });

        await page.waitForSelector('.yt-spec-button-shape-next');
        await page.click('.yt-spec-button-shape-next[aria-label="Accept the use of cookies and other data for the purposes described"]');
        await page.waitForNavigation();

        const videoTitle = await page.$$eval('#video-title', (elements) =>
            elements.map((element) => element.textContent.trim())
        );

        const views = await page.$$eval('.inline-metadata-item.style-scope.ytd-video-meta-block', (elements) =>
            elements.map((element) => element.textContent.trim())
        );

        const thumbnail = await page.$$eval('.yt-core-image--fill-parent-height.yt-core-image--fill-parent-width.yt-core-image.yt-core-image--content-mode-scale-aspect-fill.yt-core-image--loaded', (elements) =>
            elements.map((element) => element.getAttribute('src'))
        );

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
            video: {
                thumbnail: thumbnail[index],
                videoTitle: title,
                views: view[index],
                how_old:timeago[index]

            }
        }));
console.log(organizedData)
        return organizedData;

    } catch (error) {
        console.error(`An error occurred while visiting YouTube: ${error}`);
        throw error;
    } finally {
        await browser?.close();
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

