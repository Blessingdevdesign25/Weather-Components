import React, { useState, useEffect } from 'react';
import { Search, Wind, Droplets, Thermometer, MapPin, Cloud, Sun, CloudRain, CloudLightning, CloudSnow, Loader2, AlertCircle } from 'lucide-react';

const WeatherIcon = ({ code, size = 48, className = "" }) => {
  if (code === 0) return <Sun className={className} size={size} style={{ color: '#fbbf24' }} />;
  if (code >= 1 && code <= 3) return <Cloud className={className} size={size} style={{ color: '#94a3b8' }} />;
  if (code >= 45 && code <= 48) return <Cloud className={className} size={size} style={{ color: '#64748b' }} />;
  if (code >= 51 && code <= 65) return <CloudRain className={className} size={size} style={{ color: '#60a5fa' }} />;
  if (code >= 71 && code <= 77) return <CloudSnow className={className} size={size} style={{ color: '#bfdbfe' }} />;
  if (code >= 80 && code <= 82) return <CloudRain className={className} size={size} style={{ color: '#3b82f6' }} />;
  if (code >= 95) return <CloudLightning className={className} size={size} style={{ color: '#a855f7' }} />;
  return <Cloud className={className} size={size} style={{ color: '#94a3b8' }} />;
};

const App = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const getAtmosphere = (code) => {
    if (code === 0) return '/weather-bg/clear.png';
    if (code >= 1 && code <= 48) return '/weather-bg/cloudy.png';
    if (code >= 51 && code <= 82) return '/weather-bg/rainy.png';
    if (code >= 95) return '/weather-bg/rainy.png';
    return '/weather-bg/clear.png';
  };

  const fetchWeather = async (e) => {
    if (e) e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("We couldn't find that city. Try something else.");
      }

      const { latitude, longitude, name, country, admin1 } = geoData.results[0];
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
        humidity: weatherData.hourly.relative_humidity_2m[0] 
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      <div className="atmosphere-base">
        <div 
          className="atmosphere-overlay" 
          style={{ backgroundImage: `url(${weather ? getAtmosphere(weather.code) : '/weather-bg/clear.png'})` }}
        />
      </div>
      <div className="grain-overlay" />

      <main className="main-content">
        <header className="text-center animate-entrance" style={{ marginBottom: '3rem' }}>
          <div className="flex items-center justify-center gap-3 mb-2">
            <Cloud style={{ color: '#334155' }} size={32} />
            <h1 className="location-title" style={{ fontSize: '2.5rem' }}>SkyCast</h1>
          </div>
          <p className="text-secondary" style={{ opacity: 0.7 }}>{greeting}. Ready to explore the skies?</p>
        </header>

        <form onSubmit={fetchWeather} className="search-form animate-entrance stagger-1">
          <div className="glass-card search-input-group">
            <Search className="text-muted" size={20} />
            <input 
              type="text" 
              placeholder="Search a city..."
              className="search-input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={loading}
              className="search-button"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Search"}
            </button>
          </div>
        </form>

        {error && (
          <div className="glass-card animate-entrance" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', color: '#ef4444', marginBottom: '2rem' }}>
            <AlertCircle size={24} />
            <span style={{ fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {weather ? (
          <div className="glass-card animate-entrance stagger-2" style={{ padding: '2.5rem' }}>
            <div className="flex justify-between items-start" style={{ marginBottom: '3rem' }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={20} className="text-muted" />
                  <h2 className="location-title">{weather.name}</h2>
                </div>
                <p className="text-secondary" style={{ marginLeft: '1.75rem' }}>{weather.region}, {weather.country}</p>
              </div>
              <div className="text-right">
                <span className="label-caps">Conditions</span>
                <div className="flex items-center gap-3" style={{ marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 500 }}>
                    {weather.code === 0 ? 'Clear Skies' : 'Changing Skies'}
                  </span>
                  <WeatherIcon code={weather.code} size={32} />
                </div>
              </div>
            </div>

            <div className="text-center" style={{ marginBottom: '4rem' }}>
              <span className="label-caps">Temperature</span>
              <div className="temp-large">{Math.round(weather.temp)}°</div>
            </div>

            <div className="details-grid">
              <div className="detail-item">
                <div className="icon-circle bg-blue">
                  <Droplets size={20} />
                </div>
                <span className="label-caps" style={{ marginBottom: '0.25rem' }}>Humidity</span>
                <p style={{ fontWeight: 700, fontSize: '1.125rem' }}>{weather.humidity}%</p>
              </div>
              <div className="detail-item">
                <div className="icon-circle bg-slate">
                  <Wind size={20} />
                </div>
                <span className="label-caps" style={{ marginBottom: '0.25rem' }}>Wind</span>
                <p style={{ fontWeight: 700, fontSize: '1.125rem' }}>{weather.windSpeed} <span style={{ fontSize: '0.875rem', fontWeight: 400 }}>km/h</span></p>
              </div>
              <div className="detail-item">
                <div className="icon-circle bg-orange">
                  <Thermometer size={20} />
                </div>
                <span className="label-caps" style={{ marginBottom: '0.25rem' }}>Feels Like</span>
                <p style={{ fontWeight: 700, fontSize: '1.125rem' }}>{Math.round(weather.temp)}°</p>
              </div>
            </div>
          </div>
        ) : (
          !loading && !error && (
            <div className="text-center animate-entrance stagger-2" style={{ padding: '5rem 0', opacity: 0.4 }}>
              <Cloud size={80} style={{ margin: '0 auto 1.5rem', color: '#94a3b8' }} />
              <p style={{ fontSize: '1.25rem', fontWeight: 300, fontStyle: 'italic' }}>Search a city to see the magic happen...</p>
            </div>
          )
        )}
      </main>

      <footer className="text-center animate-entrance stagger-3" style={{ marginTop: 'auto', padding: '2rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        SkyCast &copy; {new Date().getFullYear()} • Minimalist Weather Experience
      </footer>
    </div>
  );
};

export default App;
