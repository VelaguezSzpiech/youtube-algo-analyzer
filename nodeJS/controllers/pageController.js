// controllers/trendController.js
const { trendscraper } = require('../utils/puppeteerFunctions.js');

async function getPage(scrapingInProgress,req, res) {
    try {
          if (scrapingInProgress) {
            res.json({ message: 'Scraping in progress, please wait' });
          } else {
              res.json(pagestoredData);
              console.log("pushed")
          }
     } catch (error) {
          console.error('Error:', error);
          res.status(500).send('An error occurred while handling the GET request.');
    }

}

module.exports = {
    getPage,
};
