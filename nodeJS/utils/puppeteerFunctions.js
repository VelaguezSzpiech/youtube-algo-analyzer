// utils/puppeteerFunctions.js
const puppeteer = require('puppeteer');

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

        storedData = organizedData;
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
            headless: false
        });
        console.log("number of videos selected",videoCount)
        const page = await browser.newPage();
        await page.goto(youtube);
        await page.setViewport({ width: 1920, height: 10080 });

        await page.waitForSelector('.yt-spec-button-shape-next');
        await page.click('.yt-spec-button-shape-next[aria-label="Accept the use of cookies and other data for the purposes described"]');
        await page.waitForNavigation();

        
        await page.goto(`${channel}/videos`);
     
     

        currentTime = new Date();
       

        await page.waitForSelector('#subscriber-count', "#videos-count");


       const subsData = await page.$$eval('#subscriber-count', (elements, videoCount) => {
    return elements.slice(0, videoCount).map(element => element.textContent.trim());
}, videoCount);
console.log("logging", subsData,);

const videosData = await page.$$eval('#videos-count', (elements, videoCount) => {
    return elements.slice(0, videoCount).map(element => element.textContent.trim());
}, videoCount);
console.log("logging", videosData,);

const channelName = await page.$$eval('#channel-handle', (elements, videoCount) => {
    return elements.slice(0, videoCount).map(element => element.textContent.trim());
}, videoCount);
console.log("logging", channelName,);

const videoTitle = await page.$$eval('#video-title', (elements, videoCount) => {
    return elements.slice(0, videoCount).map(element => element.textContent.trim());
}, videoCount);
console.log("logging", videoTitle,);

const views = await page.$$eval('.style-scope ytd-video-meta-block', (elements, videoCount) => {
    return elements.slice(0, videoCount).map(element => element.textContent.trim().replace(/\n/g, ''));
}, videoCount);
console.log("logging", views,);

const thumbnail = await page.$$eval('.yt-core-image--fill-parent-height.yt-core-image--fill-parent-width.yt-core-image.yt-core-image--content-mode-scale-aspect-fill.yt-core-image--loaded', (elements, videoCount) => {
    return elements.slice(0, videoCount).map(element => element.getAttribute('src'));
}, videoCount);
console.log("logging", thumbnail,);

// const ChannelAge = await page.$$eval('.yt-core-image--fill-parent-height.yt-core-image--fill-parent-width.yt-core-image.yt-core-image--content-mode-scale-aspect-fill.yt-core-image--loaded', (elements, videoCount) => {
//     return elements.slice(0, videoCount).map(element => element.getAttribute('src'));
// }, videoCount);

const topcommentsData =[]
const howmanycommentsData =[]
const VideolikesData =[]
const transcriptData =[]
const videolengthData =[]
const descriptionData =[]

const selectorForSecondElement = '#video-title-link';

const hrefs = await page.$$eval(selectorForSecondElement, (anchors) => anchors.map((anchor) => anchor.href));

let pageCounter = 0;
currentTime = new Date();

        // Visit each URL
        for (const href of hrefs) {

            if (pageCounter >= videoCount) {
                console.log(`Visited ${videoCount} pages as per the specified videoCount.`);
                break;
            }
          

            // Navigate to the extracted URL
            await page.goto(href);
          
            await new Promise(resolve => setTimeout(resolve, 5000)); 
            await page.click('ytd-text-inline-expander #expand-sizer');

            const description = await page.$$eval('#description-inline-expander', (elements) => elements.length > 0 ? elements.map((element) => element.textContent.trim().replace(/\n/g, '')) : ['N/A']);
            console.log("Logging Description:", description);
            

            // Wait for the "Show transcript" button to be present
          // Wait for the "Show transcript" button to be present
            await page.waitForSelector('button[aria-label="Show transcript"]');

// Click on the "Show transcript" button
            await page.click('button[aria-label="Show transcript"]');
            await new Promise(resolve => setTimeout(resolve, 1000));

            const transcriptselector = ".segment.style-scope.ytd-transcript-segment-renderer ";
            const transcript = await page.$$eval(transcriptselector, (elements) => elements.length > 0 ? elements.map((element) => element.textContent.trim().replace(/\n/g, '')) : ['N/A']);
            console.log("Logging Transcript:", transcript);
            await new Promise(resolve => setTimeout(resolve, 100));

          
            const howmanycomments = await page.$$eval('#count yt-formatted-string', (elements, videoCount) => {
                return elements.slice(0, videoCount).map(element => element.textContent.trim().replace(/\n/g, ''));
            }, videoCount);
            console.log("Logging Number of Comments:", howmanycomments);
            await new Promise(resolve => setTimeout(resolve, 1));  // Wait for 1 second

            const topcomments  = await page.$$eval('.style-scope ytd-comment-renderer', (elements, videoCount) => {
                return elements.slice(0, videoCount).map(element => {
                    const author = element.querySelector('.style-scope ytd-comment-renderer #author-text')?.textContent.trim() || 'N/A';
                    const content = element.querySelector('.style-scope ytd-comment-renderer #content-text')?.textContent.trim().replace(/\n/g, '') || 'N/A';
                    const likes = element.querySelector('.style-scope ytd-comment-renderer #vote-count-middle')?.textContent.trim() || '0';
                    const dislikes = element.querySelector('.style-scope ytd-comment-renderer #dislike-button .style-scope yt-icon-button #button #text')?.textContent.trim() || '0';
                    const replies = element.querySelector('.style-scope ytd-comment-renderer #replies .style-scope yt-button-renderer #text')?.textContent.trim() || '0';
            
                    return {
                        author,
                    
                        content,
                        likes,
                        dislikes,
                        replies,
                    };
                });
            }, videoCount);
            
            console.log("Logging Top Comments:", topcomments);
            await new Promise(resolve => setTimeout(resolve, 1));  // Wait for 10 seconds
            

            const Videolikes = await page.$$eval('button[title="I like this"]', (elements) => {
                return elements.length > 0 ? elements.map((element) => {
                    const ariaLabelAttribute = element.getAttribute('aria-label');
                    return ariaLabelAttribute ? ariaLabelAttribute.trim() : 'N/A';
                }) : ['N/A'];
            });           
             console.log("logging videolikes", Videolikes,);
            await new Promise(resolve => setTimeout(resolve, 1));  // Wait for 1 second


            const videolength = await page.$$eval('.ytp-time-duration', (elements) => elements.length > 0 ? elements.map((element) => element.textContent.trim().replace(/\n/g, '')) : ['N/A']);
            console.log("Logging Video Length:", videolength);
            await new Promise(resolve => setTimeout(resolve, 1));  // Wait for 1 second
            


          

            console.log(`Navigated to ${href}`);
            topcommentsData.push(topcomments);
            howmanycommentsData.push(howmanycomments);
            transcriptData.push(transcript);
            VideolikesData.push(Videolikes);
            videolengthData.push(videolength);
            descriptionData.push(description);
        
            await page.waitForTimeout(100);
            pageCounter++;
        }

        const ytvdeo = videoTitle.map((title, index) => ({
            thumbnail: thumbnail[index] || 'N/A',
            videoTitle: title || 'N/A',
            views: views[index] || 'N/A',
            topComments: topcommentsData[0],
            howmanycommentsData:howmanycommentsData[index],
            likes: VideolikesData[index],
            videolengthData:videolengthData[index],
            descriptionData:descriptionData[index],
            transcript:transcriptData[0],
        }));

const ytchanneldata = {
    name:channelName[0],
    subscriberCount: subsData[0] || 'N/A',
    amountOfVideos: videosData[0] || 'N/A',
    howOld: 'Channel age',
};


const organizedData = {
    ytchanneldata,
    ytvdeo,
  };
      

  pagestoredData = organizedData;
  return { pagestoredData, organizedData };

      
    } catch (error) {
        console.error(`An error occurred while visiting YouTube: ${error}`);
        throw error;
    } finally {
        console.log("done scraping the "+channel);

    }
}

module.exports = {
    trendscraper,
    pagescraper,
};
