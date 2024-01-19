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
let storedtrendData = [];
let pagestoredData = [];

app.get('/get/trend', async (req, res,) => {
    try {
      if (scrapingInProgress) {
        res.json({ message: 'Scraping in progress, please wait' });
      } else {
          res.json(storedtrendData);
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
          console.log("going to "+youtube)
          await page.setViewport({
              width: 1920,
              height: 1580
          });
  
          await page.waitForSelector('.yt-spec-button-shape-next');
          await page.click('.yt-spec-button-shape-next[aria-label="Accept the use of cookies and other data for the purposes described"]');
          await page.waitForNavigation();
          await page.waitForSelector('[title="Trending"]'); // Adjust the timeout value as needed
  
          const hrefValue = await page.$eval('[title="Trending"]', (element) => {
              // Extract the href attribute value
              return element.getAttribute('href');
          });
          const fullURL = youtube + hrefValue ;
  
          await page.goto(fullURL);
          console.log("going to "+fullURL)
          //goes to trending page
      
          
          await page.waitForSelector('a#video-title yt-formatted-string'); // Adjust the timeout value as needed
          
        const videoTitle = await page.$$eval('a#video-title yt-formatted-string', (elements, videoCount) => {
            return elements.slice(0, videoCount).map(element => element.textContent.trim());
        }, videoCount);
        console.log("logging title", videoTitle,);
        
        const views = await page.$$eval('span.style-scope.ytd-video-meta-block', (elements, videoCount) => {
            return elements.slice(0, videoCount).map(element => element.textContent.trim().replace(/\n/g, ''));
        }, videoCount);
        console.log("logging views", views,);
        
        const thumbnail = await page.$$eval('yt-image img', (elements, videoCount) => {
            return elements.slice(0, videoCount).map(element => element.getAttribute('src'));
        }, videoCount);
        console.log("logging thumbnail", thumbnail,);
  
        const topcommentsData =[]
        const howmanycommentsData =[]
        const VideolikesData =[]
        const transcriptData =[]
        const videolengthData =[]
        const descriptionData =[]

          const selectorForSecondElement = 'a#video-title.yt-simple-endpoint.style-scope.ytd-video-renderer[title]';
  
          const hrefs = await page.$$eval(selectorForSecondElement, (anchors) => anchors.map((anchor) => anchor.href));
          
          let pageCounter = 0;

          

          // Visit each URL
          currentTime = new Date();
          for (const href of hrefs) {
              if (pageCounter >= videoCount) {
                  console.log(`Visited ${videoCount} pages as per the specified videoCount.`);
                  break;
              }
  
              
             console.log(href)
                await page.goto(href);
        
                // Increment the page counter
                pageCounter++;
            
                console.log(`Invalid href value: ${href}`);
            
              
             

                await page.waitForSelector('ytd-text-inline-expander #expand-sizer');
              await page.click('ytd-text-inline-expander #expand-sizer');
              await page.waitForSelector('#description-inline-expander');

              const description = await page.$$eval('#description-inline-expander', (elements) => elements.length > 0 ? elements.map((element) => element.textContent.trim().replace(/\n/g, '')) : ['N/A']);
              console.log("Logging Description:", description);
              
  
              // Wait for the "Show transcript" button to be present
              // Wait for the "Show transcript" button to be present
              await page.waitForSelector('button[aria-label="Show transcript"]');
  
              // Click on the "Show transcript" button
              await page.click('button[aria-label="Show transcript"]');

              const transcriptselector = ".segment.style-scope.ytd-transcript-segment-renderer ";
              await page.waitForSelector(transcriptselector);
             
              const transcript = await page.$$eval(transcriptselector, (elements) => elements.length > 0 ? elements.map((element) => element.textContent.trim().replace(/\n/g, '')) : ['N/A']);
              console.log("Logging Transcript:", transcript);
            
              
              const howmanycomments = await page.$$eval('#count yt-formatted-string', (elements, videoCount) => {
                  return elements.slice(0, videoCount).map(element => element.textContent.trim().replace(/\n/g, ''));
              }, videoCount);
              console.log("Logging Number of Comments:", howmanycomments);
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
            const hrefAttribute = await page.$eval('.ytd-channel-name yt-formatted-string a', (anchor) => anchor.getAttribute('href'));
            console.log('Channel Href:', hrefAttribute);
          
            await page.goto(youtube+hrefAttribute);
            console.log("going to ", youtube+hrefAttribute);

            await page.waitForSelector('#more-icon');

            await page.click('#more-icon');

            await page.waitForSelector('.description-item');

            const descriptionItems = await page.$$eval('.description-item', elements =>
    elements.map(element => element.textContent.trim())
  );
            console.log("logging channeldata", descriptionItems);


            
              
            const organizedData = videoTitle.map((title, index) => ({
                YTname: {
                    name: descriptionItems[2] || 'N/A',
                    subscriberCount: descriptionItems[3] || 'N/A',
                    amountOfVideos: descriptionItems[4] || 'N/A',
                    howOld:descriptionItems[6]|| 'N/A' ,
                    channelviews:descriptionItems[5]|| 'N/A',
                    location:descriptionItems[7]|| 'N/A',
                },
                YTvideo: {
                    thumbnail: thumbnail[index] || 'N/A',
                    videoTitle: title || 'N/A',
                    views: views[index] || 'N/A',
                    topComments: topcommentsData[0],
                    howmanycommentsData: howmanycommentsData[index],
                    likes: VideolikesData[index],
                    videolengthData: videolengthData[index],
                    descriptionData: descriptionData[index],
                    transcript: transcriptData[0],
                }
            }));
        
        storedtrendData = organizedData;
        return { storedtrendData, organizedData };
      } catch (error) {
          console.error(`An error occurred while visiting YouTube: ${error}`);
          throw error;
      } finally {
          
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
         
  
        
  
  
   
          await page.waitForSelector('#more-icon');

          await page.click('#more-icon');

          await page.waitForSelector('.description-item');

          const descriptionItems = await page.$$eval('.description-item', elements =>
  elements.map(element => element.textContent.trim())
);
          console.log("logging channeldata", descriptionItems);
 

          await page.waitForSelector('#video-title'); // Adjust the timeout value as needed
          
          const videoTitle = await page.$$eval('#video-title', (elements, videoCount) => {
              return elements.slice(0, videoCount).map(element => element.textContent.trim());
          }, videoCount);
          console.log("logging title", videoTitle,);
  
  const views = await page.$$eval('span.style-scope.ytd-video-meta-block', (elements, videoCount) => {
      return elements.slice(0, videoCount).map(element => element.textContent.trim().replace(/\n/g, ''));
  }, videoCount);
  console.log("logging views", views,);
  
  const thumbnail = await page.$$eval('yt-image img', (elements, videoCount) => {
    return elements.slice(0, videoCount).map(element => element.getAttribute('src'));
}, videoCount);
console.log("logging thumbnail", thumbnail,);
  
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
            
              await page.waitForSelector('ytd-text-inline-expander #expand-sizer');
              await page.click('ytd-text-inline-expander #expand-sizer');
  
              const description = await page.$$eval('#description-inline-expander', (elements) => elements.length > 0 ? elements.map((element) => element.textContent.trim().replace(/\n/g, '')) : ['N/A']);
              console.log("Logging Description:", description);
              
  
              // Wait for the "Show transcript" button to be present
              // Wait for the "Show transcript" button to be present
              await page.waitForSelector('button[aria-label="Show transcript"]');
              await page.click('button[aria-label="Show transcript"]');
             
              const transcriptselector = ".segment.style-scope.ytd-transcript-segment-renderer ";

              await page.waitForSelector(transcriptselector);
//add a feature skip if not there
              const transcript = await page.$$eval(transcriptselector, (elements) => elements.length > 0 ? elements.map((element) => element.textContent.trim().replace(/\n/g, '')) : ['N/A']);
              console.log("Logging Transcript:", transcript);
  
              await page.waitForSelector('#count yt-formatted-string');

              const howmanycomments = await page.$$eval('#count yt-formatted-string', (elements, videoCount) => {
                return elements.slice(0, videoCount).map(element => element.textContent.trim().replace(/\n/g, ''));
            }, videoCount);
            console.log("Logging Number of Comments:", howmanycomments);
           
            await page.waitForSelector('.style-scope ytd-comment-renderer');

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

         
      
        
  
          const organizedData = videoTitle.map((title, index) => ({
              YTname: {
                name: descriptionItems[2] || 'N/A',
                subscriberCount: descriptionItems[3] || 'N/A',
                amountOfVideos: descriptionItems[4] || 'N/A',
                howOld:descriptionItems[6]|| 'N/A' ,
                channelviews:descriptionItems[5]|| 'N/A',
                location:descriptionItems[7]|| 'N/A',
              },
              YTvideo: {
                  thumbnail: thumbnail[index] || 'N/A',
                  videoTitle: title || 'N/A',
                  views: views[index] || 'N/A',
                  topComments: topcommentsData[0],
                  howmanycommentsData: howmanycommentsData[index],
                  likes: VideolikesData[index],
                  videolengthData: videolengthData[index],
                  descriptionData: descriptionData[index],
                  transcript: transcriptData[0],
              }
          }));
  
  
          pagestoredData = organizedData;
          
          return pagestoredData
      
      } catch (error) {
          console.error(`An error occurred while visiting YouTube: ${error}`);
          throw error;
      } finally {
          await browser?.close();
          console.log("done scraping "+channel);
  
      }
}
  
// Example usage:
// scraper('https://www.youtube.com/', 5).then(result => console.log(result));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
