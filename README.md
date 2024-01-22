# YouTube Scraper Project

## Overview

This project consists of a Node.js server and a React front-end application that together allow users to scrape data from YouTube, focusing on trending videos and specific channels.

## Server (Node.js)

### Setup
1. Install Node.js if not already installed.
2. Clone the repository.
3. Navigate to the `server` directory.
4. Run `npm install` to install the required dependencies.
5. Start the server using `npm start`.
6. The server will be running on http://localhost:3003.

### Endpoints

- **GET /get/trend**: Get data for trending YouTube videos.
- **GET /get/page**: Get data for a specific YouTube channel's videos.
- **POST /post**: Send a request to scrape YouTube data based on user input.

## Front-end (React)

### Setup
1. Install Node.js if not already installed.
2. Clone the repository.
3. Navigate to the `client` directory.
4. Run `npm install` to install the required dependencies.
5. Start the React application using `npm start`.
6. The application will be accessible on http://localhost:3000.

### Features

- Input a YouTube channel name and the number of videos to scrape.
- Choose to scrape trending videos and/or a specific channel.
- Toggle between light and dark mode for the UI.
- View collected data, including video details and channel information.

### Usage

1. Input the YouTube channel name and the number of videos.
2. Select the desired scraping options (Trendscraper, Pagescraper).
3. Click the "Send Data" button to initiate the scraping process.
4. View the collected data below, organized by video and channel information.

## Technologies Used

- Node.js
- Express
- Puppeteer
- React
- HTML, CSS

## Credits

- The server and scraping logic were implemented by [Your Name].
- The React front-end was designed and developed by [Your Name].

## License

This project is licensed under the [MIT License](LICENSE).

## Todo

- [ ] Refactor the code for improved readability and maintainability.
- [ ] Update documentation based on any changes made.
