import React, { useState ,useEffect } from 'react';
import './App.css';

const serverUrl = 'http://localhost:3003';

const App = (url) => {
  const [videoData, setVideoData] = useState([]);
  const [inputData, setInputData] = useState('');
  const [inputData2, setInputData2] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataCollected, setDataCollected] = useState(false);
  const [isTrendScraperChecked, setIsTrendScraperChecked] = useState(false);
const [isPageScraperChecked, setIsPageScraperChecked] = useState(false);
const [darkMode, setDarkMode] = useState(false); // Add this line
const [lastPressTimestamp, setLastPressTimestamp] = useState(null);



const handleModeSwitch = () => {
  setDarkMode(!darkMode);
  document.body.classList.toggle('dark-mode');
};
let result=[]
const fetchData = async (url) => {
  try {
    setLoading(true);
    const response = await fetch(url);
     result = await response.json();

 
    if (result.length > 0) {
      return result;
    } else {
      console.error('Data received is not an array or is empty:', result);
      return [];
    }

 
  
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  } finally {
    setLoading(false);
  }
};

  function handleInputChange(e) {
    setInputData(e.target.value);
  }

  function handleInput2Change(e) {
    setInputData2(e.target.value);
  }
  function handleInput2Change(e) {
    setInputData2(e.target.value);
  }

  const [prevInputData, setPrevInputData] = useState(null);
  const [prevInputData2, setPrevInputData2] = useState(null);
  const [prevIsTrendScraperChecked, setPrevIsTrendScraperChecked] = useState(null);
  const [prevIsPageScraperChecked, setPrevIsPageScraperChecked] = useState(null);
  const [sendDataCount, setSendDataCount] = useState(0);

  async function sendDataToServer() {
    try {
      setLoading(true);
    const functionsToRun = [];

    if (isTrendScraperChecked) {
      functionsToRun.push('trendscraper');
    }
    if (isPageScraperChecked) {
      functionsToRun.push('pagescraper');
    }

    // Log the changes if any
    let hasChanged = false;
    if (prevInputData !== null && prevInputData !== inputData) {
      console.log('Text input has changed.');
      hasChanged = true;
    }
    if (prevInputData2 !== null && prevInputData2 !== inputData2) {
      console.log('Number input has changed.');
      hasChanged = true;
    }
    if (prevIsTrendScraperChecked !== null && prevIsTrendScraperChecked !== isTrendScraperChecked) {
      console.log('TrendScraper checkbox has changed.');
      hasChanged = true;
    }
    if (prevIsPageScraperChecked !== null && prevIsPageScraperChecked !== isPageScraperChecked) {
      console.log('PageScraper checkbox has changed.');
      hasChanged = true;
    }

    // Update the previous state with the current state
    setPrevInputData(inputData);
    setPrevInputData2(inputData2);
    setPrevIsTrendScraperChecked(isTrendScraperChecked);
    setPrevIsPageScraperChecked(isPageScraperChecked);

    // Increase the sendDataCount by 1
    setSendDataCount(sendDataCount + 1);
    console.log('Send Data button has been pressed', sendDataCount + 1, 'times.');

    if (sendDataCount >= 1 && !hasChanged) {
      // Fetch data from the server if the button is clicked for the second time and there are no changes
      const fetchPromises = [];
      if (isTrendScraperChecked) {
        fetchPromises.push(fetchData('http://localhost:3003/get/trend'));
      }
      if (isPageScraperChecked) {
        fetchPromises.push(fetchData('http://localhost:3003/get/page'));
      }

      const allData = await Promise.allSettled(fetchPromises);
      console.log('All data promises settled:', allData);

      const newData = allData
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value)
        .flat();

      console.log('New data from promises:', newData);

      setVideoData(newData);
    } else {
      console.log('Sending data to server:', { data: inputData, data2: inputData2, functions: functionsToRun });

      const response = await fetch(`${serverUrl}/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: inputData,
          data2: inputData2,
          functions: functionsToRun,
        }),
      });

      const updatedData = await response.json();
      console.log('Data received from server:', updatedData);

      setVideoData(updatedData);
      setDataCollected(true);
    }
  
      const fetchPromises = [];
  
      if (isTrendScraperChecked) {
        fetchPromises.push(fetchData(`${serverUrl}/get/trend`));
      }
      if (isPageScraperChecked) {
        fetchPromises.push(fetchData(`${serverUrl}/get/page`));
      }
  
      const allData = await Promise.allSettled(fetchPromises);
      console.log('All data promises settled:', allData);
  
      const newData = allData
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value)
        .flat();
  
      console.log('New data from promises:', newData);
  
      setVideoData(newData);
    } catch (error) {
      console.error('Error sending or fetching data:', error);
    } finally {
      setLoading(false);
    }
  }
  
  
  return (
    <div>
      <div className={darkMode ? 'dark-mode' : ''}>
      <button onClick={handleModeSwitch}>
        Switch to {darkMode ? 'Light' : 'Dark'} Mode
      </button>
      {/* Rest of your component... */}
    </div>
  <div className='parent'>
  <div className='input-parent'>
    <input class="input-text" type="text" value={inputData} onChange={handleInputChange} placeholder="youtuber" />
    <input class="input-number" type="number" value={inputData2} onChange={handleInput2Change} placeholder="videos" />
  </div>
  <label class="label-checkbox">
    <div class="checkbox-container">
      <input class="checkbox-trendscraper" type="checkbox" checked={isTrendScraperChecked} onChange={() => setIsTrendScraperChecked(!isTrendScraperChecked)} />
      <span>trendscraper</span>
    </div>
    <div class="checkbox-container">
      <input class="checkbox-pagescraper" type="checkbox" checked={isPageScraperChecked} onChange={() => setIsPageScraperChecked(!isPageScraperChecked)} />
      <span>pagescraper</span>
    </div>
  </label>
  <button class="data-button" onClick={sendDataToServer} disabled={loading}>
    {loading ? 'Sending...' : 'Send Data'}
  </button>
</div>

<div className='data-all-parent'>
        {loading ? (
          <p>Loading...</p>
        ) : dataCollected ? (
          Array.isArray(videoData) && videoData.length > 0 ? (
            videoData.map((result) => (
              <div className='data-sub-parent' key={result.YTname.amountOfVideos}>
  <h1 className='youtuberName'>{result.YTname.name}</h1>
  <div className='video-data-container'>
    <img className='Thumbnail' src={result.YTvideo.thumbnail} alt="Thumbnail" />
    <ul className='video'>
    <li>{result.YTvideo.videoTitle}</li>
    <li>Views: {result.YTvideo.views}</li>
    <li>{result.YTvideo.howmanycommentsData}</li>
    <li>{result.YTvideo.videolengthData}</li>
    <li>likes:{result.YTvideo.likes}K</li>
  </ul>
  </div>
  <ul className='channeldata'>
    <li>{result.YTname.location}</li>
    <li>Views: {result.YTname.howOld}</li>
    <li>{result.YTname.subscriberCount}</li>
    <li>{result.YTname.amountOfVideos}</li>
    <li>{result.YTname.channelviews}</li>
  </ul>
</div>

            ))
          ) : (
            <p>No video data available</p>
          )
        ) : (
          <p></p>
        )}
      </div>
    </div>
  );
};

export default App;
