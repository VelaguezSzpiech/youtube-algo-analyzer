// app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const scrapingController = require('./controllers/scrapingController');
const trendController = require('./controllers/trendController');
const pageController = require('./controllers/pageController');

const app = express();
const port = 3003;

// Declare scrapingInProgress globally
let scrapingInProgress = false;

app.use(cors());
app.use(bodyParser.json());

// Routes
app.get('/get/trend', trendController.getTrend.bind(null, scrapingInProgress));
app.get('/get/page', pageController.getPage.bind(null, scrapingInProgress));
app.post('/post', scrapingController.handleScraping.bind(null, scrapingInProgress));

// Other routes go here...

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
