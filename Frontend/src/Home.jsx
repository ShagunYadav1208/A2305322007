// import style from './Home.module.css'
import React, { useState } from 'react';
// import { useNavigate } from 'react-router';

export default function Home({sessionData}){
    const [longUrls, setLongUrls] = useState(Array(5).fill(''));
  const [shortUrls, setShortUrls] = useState(Array(5).fill(''));
//   const navigate = useNavigate()

  const handleChange = (index, value) => {
    const newUrls = [...longUrls];
    newUrls[index] = value;
    setLongUrls(newUrls);
  };

  const shortenUrls = async () => {
    const newShortUrls = await Promise.all(
        longUrls.map(async (url) => {
        if (!url) return '';
        try {
            const formData = new FormData();
            formData.append("frontendURL", window.location.origin)
            const res = await fetch(sessionData.mainURL + '/api/shorten-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ longUrl: url }),
            });

            const data = await res.json();
            // if(data.success == false && data.redirectTo){
            //     navigate(`/${data.redirectTo}`)
            // }
            return data.shortUrl || 'Error';
        } catch (err) {
            console.error(err);
            return 'Error';
        }
        })
    );
    setShortUrls(newShortUrls);
    };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="shortener-container">
      <h2>Bulk URL Shortener</h2>

      {longUrls.map((url, index) => (
        <div key={index} className="url-block">
          <input
            type="text"
            value={url}
            onChange={(e) => handleChange(index, e.target.value)}
            placeholder={`Enter Long URL ${index + 1}`}
            className="url-input"
          />
          {shortUrls[index] && (
            <div className="result-block">
              <span className="short-url">{shortUrls[index]}</span>
              <button onClick={() => copyToClipboard(shortUrls[index])}>Copy</button>
            </div>
          )}
        </div>
      ))}

      <button onClick={shortenUrls} className="shorten-button">Shorten All URLs</button>

      {/* Embedded CSS */}
      <style>{`
        .shortener-container {
          max-width: 600px;
          margin: 40px auto;
          padding: 30px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(15px);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #fff;
          font-family: Arial, sans-serif;
        }

        .shortener-container h2 {
          text-align: center;
          margin-bottom: 20px;
          font-size: 24px;
        }

        .url-block {
          margin-bottom: 20px;
        }

        .url-input {
          width: 100%;
          padding: 10px;
          border-radius: 10px;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 16px;
          outline: none;
        }

        .result-block {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.15);
          padding: 10px;
          margin-top: 5px;
          border-radius: 10px;
        }

        .short-url {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 80%;
        }

        .result-block button {
          background-color: white;
          color: black;
          padding: 6px 12px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .result-block button:hover {
          background-color: #ddd;
        }

        .shorten-button {
          width: 100%;
          padding: 12px;
          font-size: 16px;
          font-weight: bold;
          color: white;
          background: #007bff;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .shorten-button:hover {
          background: #0056b3;
        }

        body {
          background: linear-gradient(135deg, #1f1c2c, #928dab);
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  );
};