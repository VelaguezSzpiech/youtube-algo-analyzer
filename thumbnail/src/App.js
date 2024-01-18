import React, { useState } from 'react';
const serverUrl = 'http://localhost:3003';

const App = () => {
  const [videoData, setVideoData] = useState([]);
  const [inputData, setInputData] = useState('');
  const [inputData2, setInputData2] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataCollected, setDataCollected] = useState(false);
  const [isTrendScraperChecked, setIsTrendScraperChecked] = useState(false);
const [isPageScraperChecked, setIsPageScraperChecked] = useState(false);


const fetchData = async (url) => {
  try {
    setLoading(true);
    const response = await fetch(url);
    const result = await response.json();
    if (Array.isArray(result) && result.length > 0) {
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
      setVideoData(updatedData);
      setDataCollected(true);
    } catch (error) {
      console.error('Error sending data:', error);
    } finally {
      setLoading(false);
    }
    const fetchPromises = [];
    if (isTrendScraperChecked) {
      fetchPromises.push(fetchData(`${serverUrl}/get/trend`));
    }
    if (isPageScraperChecked) {
      fetchPromises.push(fetchData(`${serverUrl}/get/page`));
    }
    const allData = await Promise.all(fetchPromises);
    setVideoData(allData.flat());
  }
  


  return (
    <div>
      <h1>Fetching and Sending Data Example</h1>
      <input type="text" value={inputData} onChange={handleInputChange} placeholder="Enter data to send" />
      <input type="number" value={inputData2} onChange={handleInput2Change} placeholder="Enter second data to send" />
      <label>
  <input type="checkbox" checked={isTrendScraperChecked} onChange={() => setIsTrendScraperChecked(!isTrendScraperChecked)} />
  Run Trend Scraper
</label>
<label>
  <input type="checkbox" checked={isPageScraperChecked} onChange={() => setIsPageScraperChecked(!isPageScraperChecked)} />
  Run Page Scraper
</label>
      <button onClick={sendDataToServer} disabled={loading}>
        {loading ? 'Sending...' : 'Send Data'}
      </button>
      <div>
        {loading ? (
          <p>Loading...</p>
        ) : dataCollected ? (
          Array.isArray(videoData) && videoData.length > 0 ? (
            videoData.map((result) => (
              <div key={result.date}>
                <h1>{result.date}</h1>
                <img src={result.thumbnail} alt="Thumbnail" />
                <h2>{result.videoTitle}</h2>
                <p>Views: {result.views}</p>
                <p>{result.channelName}</p>
                <p>{result.subscriberCount}</p>
                <p>{result.amountOfVideos}</p>
              </div>
            ))
          ) : (
            <p>No video data available</p>
          )
        ) : (
          <p>Data not collected yet</p>
        )}
      </div>
    </div>
  );
};

export default App;
