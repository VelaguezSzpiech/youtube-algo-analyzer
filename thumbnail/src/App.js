import React, { useState } from 'react';
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



const handleModeSwitch = () => {
  setDarkMode(!darkMode);
  document.body.classList.toggle('dark-mode');
};

const fetchData = async (url) => {
  try {
    setLoading(true);
    const response = await fetch(url);
    const result = await response.json();

 
    if (result.length > 0) {
      console.log(result)
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
    <h2>the video data</h2>
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
