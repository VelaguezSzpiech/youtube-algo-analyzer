import React, { useState, useEffect } from 'react';

const serverUrl = 'http://localhost:3003';

const App = () => {
  const [videoData, setVideoData] = useState([]);
  const [inputData, setInputData] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataCollected, setDataCollected] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(serverUrl);
      const result = await response.json();
      
  
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle the error (e.g., show an error message on the UI)
    } finally {
      setLoading(false);
    }
  };
  

  function handleInputChange(e) {
    setInputData(e.target.value);
  }

  async function sendDataToServer() {
    try {
      setLoading(true);
      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: inputData }),
      });

      // Assuming the server responds with updated data
      const updatedData = await response.json();
      setVideoData(updatedData);
    } catch (error) {
      console.error('Error sending data:', error);
      // Handle the error (e.g., show an error message on the UI)
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Fetching and Sending Data Example</h1>

      {/* Input field for sending data */}
      <input
        type="text"
        value={inputData}
        onChange={handleInputChange}
        placeholder="Enter data to send"
      />
      
      {/* Button to trigger data sending */}
      <button onClick={sendDataToServer} disabled={loading}>
        {loading ? 'Sending...' : 'Send Data'}
      </button>

      <div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          dataCollected ? (
            <p>Data already collected</p>
          ) : (
            videoData.map((item) => (
              <div key={item.id}>
                <h1>{item.date}</h1>
                <img src={item.thumbnail} alt="Thumbnail" />
                <h2>{item.videoTitle}</h2>
                <p>Views: {item.views}</p>
                <p>{item.channelName}</p>
                <p>{item.subscibercount}</p>
                <p>{item.amountofvideos}</p>
                {/* Add other properties you want to display */}
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};

export default App;
