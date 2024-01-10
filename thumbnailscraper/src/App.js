import React, { useEffect, useState } from 'react';

const App = () => {
  const [videoData, setVideoData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3003');
        const data = await response.json();

        // Filter out objects without 'video' property and set the state
        const filteredData = data.filter(item => item.video);
        setVideoData(filteredData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Fetching Data Example</h1>
      <div>
        {videoData.map((item, index) => (
          <div key={index}>
            <h2>{item.video.videoTitle}</h2>
            <p>Views: {item.video.views}</p>
            <p> {item.video.how_old}</p>
            <img src={item.video.thumbnail} alt="Thumbnail" />
            {/* Add other properties you want to display */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
