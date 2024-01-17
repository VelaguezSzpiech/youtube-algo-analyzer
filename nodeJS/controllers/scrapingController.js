// controllers/scrapingController.js
const { trendscraper, pagescraper } = require('../utils/puppeteerFunctions');

async function handleScraping(scrapingInProgress,req, res) {
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
}

module.exports = {
    handleScraping,
};
