import React, { useState, useEffect } from 'react';
import { Search, Wind, Droplets, Thermometer, MapPin, Cloud, Sun, CloudRain, CloudLightning, CloudSnow, Loader2, AlertCircle } from 'lucide-react';

const WeatherIcon = ({ code, isDay }) => {
  if (code === 0) return <Sun className="weather-icon yellow" size={48} />;
  if (code >= 1 && code <= 3) return <Cloud className="weather-icon blue" size={48} />;
  if (code >= 45 && code <= 48) return <Cloud className="weather-icon gray" size={48} />;
  if (code >= 51 && code <= 65) return <CloudRain className="weather-icon blue" size={48} />;
  if (code >= 71 && code <= 77) return <CloudSnow className="weather-icon white" size={48} />;
  if (code >= 80 && code <= 82) return <CloudRain className="weather-icon blue" size={48} />;
  if (code >= 95) return <CloudLightning className="weather-icon purple" size={48} />;
  return <Cloud className="weather-icon" size={48} />;
};

const App = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async (e) => {
    if (e) e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError(null);
    setWeather(null);

    try {
      // 1. Geocoding: Get coordinates for the city
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found. Please try another name.");
      }

      const { latitude, longitude, name, country, admin1 } = geoData.results[0];

      // 2. Weather: Get current weather using coordinates
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relative_humidity_2m`);
      const weatherData = await weatherRes.json();

      setWeather({
        name,
        country,
        region: admin1,
        temp: weatherData.current_weather.temperature,
        windSpeed: weatherData.current_weather.windspeed,
        code: weatherData.current_weather.weathercode,
        isDay: weatherData.current_weather.is_day,
        // Relative humidity is in hourly data, we'll just take the first one for simplicity or average
        humidity: weatherData.hourly.relative_humidity_2m[0] 
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="bg-blur" />
      
      <main className="content animate-fade-in">
        <header className="header">
          <div className="logo">
            <Cloud className="text-primary" size={32} />
            <h1>SkyCast</h1>
          </div>
          <p className="subtitle">Real-time weather insights, anywhere.</p>
        </header>

        <form onSubmit={fetchWeather} className="search-container">
          <div className="input-wrapper glass-card">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search city (e.g. London, Tokyo)..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <button type="submit" disabled={loading} className="search-btn">
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Search"}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-card glass-card animate-fade-in">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {weather && (
          <div className="weather-card glass-card animate-fade-in">
            <div className="weather-main">
              <div className="location-info">
                <div className="location">
                  <MapPin size={18} className="text-primary" />
                  <h2>{weather.name}, {weather.country}</h2>
                </div>
                <p className="region">{weather.region}</p>
              </div>
              <div className="temp-display">
                <span className="temp">{Math.round(weather.temp)}°</span>
                <WeatherIcon code={weather.code} isDay={weather.isDay} />
              </div>
            </div>

            <div className="weather-details">
              <div className="detail-item">
                <Thermometer size={20} />
                <div className="detail-text">
                  <span>Temperature</span>
                  <p>{weather.temp}°C</p>
                </div>
              </div>
              <div className="detail-item">
                <Droplets size={20} />
                <div className="detail-text">
                  <span>Humidity</span>
                  <p>{weather.humidity}%</p>
                </div>
              </div>
              <div className="detail-item">
                <Wind size={20} />
                <div className="detail-text">
                  <span>Wind Speed</span>
                  <p>{weather.windSpeed} km/h</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!weather && !loading && !error && (
          <div className="empty-state animate-fade-in">
            <Sun className="text-muted" size={64} style={{ opacity: 0.3 }} />
            <p>Enter a city name to see the magic happen.</p>
          </div>
        )}
      </main>

      <style jsx="true">{`
        .app-container {
          min-height: 100vh;
          width: 100%;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .content {
          width: 100%;
          max-width: 600px;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .header {
          text-align: center;
        }

        .logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .logo h1 {
          font-size: 2.5rem;
          font-weight: 700;
          letter-spacing: -1px;
        }

        .subtitle {
          color: var(--text-muted);
          font-size: 1.1rem;
        }

        .text-primary { color: var(--primary); }

        .search-container {
          width: 100%;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          padding: 0.5rem 0.5rem 0.5rem 1.5rem;
          gap: 1rem;
          transition: all 0.3s ease;
        }

        .input-wrapper:focus-within {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-2px);
        }

        .search-icon { color: var(--text-muted); }

        input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-main);
          font-size: 1.1rem;
          font-family: inherit;
          outline: none;
        }

        .search-btn {
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 100px;
        }

        .search-btn:hover:not(:disabled) {
          background: var(--primary-hover);
          transform: scale(1.02);
        }

        .search-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .weather-card {
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .weather-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .location h2 {
          font-size: 1.8rem;
          font-weight: 600;
        }

        .location {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .region {
          color: var(--text-muted);
          margin-top: 0.25rem;
          margin-left: 1.7rem;
        }

        .temp-display {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .temp {
          font-size: 4rem;
          font-weight: 700;
        }

        .weather-icon.yellow { color: #facc15; }
        .weather-icon.blue { color: #60a5fa; }
        .weather-icon.gray { color: #94a3b8; }
        .weather-icon.white { color: #f8fafc; }
        .weather-icon.purple { color: #a855f7; }

        .weather-details {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          border-top: 1px solid var(--glass-border);
          padding-top: 2rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.75rem;
        }

        .detail-text span {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-text p {
          font-weight: 600;
          font-size: 1.1rem;
        }

        .error-card {
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.2);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 4rem;
          text-align: center;
          color: var(--text-muted);
        }

        @media (max-width: 480px) {
          .weather-details {
            grid-template-columns: 1fr;
          }
          .temp { font-size: 3rem; }
          .weather-main { flex-direction: column; gap: 1rem; }
        }
      `}</style>
    </div>
  );
};

export default App;
