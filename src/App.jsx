import { useState, useEffect } from "react";
import "./App.css";

const API_KEY = import.meta.env.VITE_OWM_KEY;

function App() {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [error, setError] = useState("");
  const [forecast, setForecast] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchForecast(city);
  }, [city]);

  async function fetchWeather(e) {
    e.preventDefault();
    if (!city.trim()) return;

    setStatus("loading");
    setError("");
    setData(null);

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=${API_KEY}&units=metric&lang=id`;

      const res = await fetch(url);
      const json = await res.json();
      const cod = Number(json.cod);

      if (!res.ok || cod !== 200) {
        throw new Error(json.message || "Gagal ambil data cuaca");
      }

      setData(json);
      setStatus("done");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  // 🔹 Ambil forecast 5 hari / 3 jam
  async function fetchForecast(city) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
        city
      )}&appid=${API_KEY}&units=metric&lang=id`;
  
      const res = await fetch(url);
      const json = await res.json();
  
      const today = new Date().toISOString().split("T")[0];
      const todayData = json.list.filter((item) =>
        item.dt_txt.startsWith(today)
      );
  
      // helper cari data terdekat ke jam target
      const pickNearest = (targetHour) => {
        if (todayData.length === 0) return null;
        let nearest = todayData[0];
        let minDiff = Math.abs(new Date(nearest.dt_txt).getHours() - targetHour);
  
        for (let item of todayData) {
          const h = new Date(item.dt_txt).getHours();
          const diff = Math.abs(h - targetHour);
          if (diff < minDiff) {
            minDiff = diff;
            nearest = item;
          }
        }
        return nearest;
      };
  
      const parts = {
        pagi: pickNearest(9),   // target jam 9
        siang: pickNearest(13), // target jam 13
        sore: pickNearest(17),  // target jam 17
        malam: pickNearest(21), // target jam 21
      };
  
      setForecast(parts);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className={`page weather ${darkMode ? "dark" : ""}`}>
      <div className="container">
        {/* 🔘 Toggle dark mode */}
        <div className="theme-toggle">
          <button onClick={() => setDarkMode((d) => !d)}>
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        <h1>Weather App</h1>

        {/* Form cari kota */}
        <form onSubmit={fetchWeather} className="card weather-form">
          <input
            className="input input--search"
            placeholder="Ketik nama kota… (mis. Jakarta)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button className="button button--primary">Cari</button>
        </form>

        {status === "loading" && <p className="muted">Memuat data…</p>}
        {status === "error" && <p className="empty">Error: {error}</p>}

        {status === "done" && data && (
          <div className="weather-card">
            <div className="wc-left">
              <h2 className="city">
                {data.name}, {data.sys?.country}
              </h2>
              <div className="temp">{Math.round(data.main.temp)}°C</div>
              <p className="desc">{data.weather?.[0]?.description}</p>
            </div>

            <div className="wc-right">
              <img
                className="icon"
                src={`https://openweathermap.org/img/wn/${data.weather?.[0]?.icon}@2x.png`}
                alt={data.weather?.[0]?.main || "weather"}
              />
              <ul className="meta">
                <li>Terasa: {Math.round(data.main.feels_like)}°C</li>
                <li>Kelembapan: {data.main.humidity}%</li>
                <li>Angin: {Math.round(data.wind.speed)} m/s</li>
                <li>Tekanan: {data.main.pressure} hPa</li>
              </ul>
            </div>
          </div>
        )}

        {/* 🔹 Forecast Hari Ini */}
        {forecast && (
          <div className="forecast">
            <h2>Perkiraan Hari Ini</h2>
            <div className="forecast-grid">
              {Object.entries(forecast).map(([time, data]) => (
                <div key={time} className="forecast-item">
                  <h3>{time.toUpperCase()}</h3>
                  {data ? (
                    <>
                      <img
                        src={`https://openweathermap.org/img/wn/${data.weather?.[0]?.icon}.png`}
                        alt={data.weather?.[0]?.main}
                      />
                      <p>{Math.round(data.main.temp)}°C</p>
                      <p>{data.weather[0].description}</p>
                    </>
                  ) : (
                    <p>❌ Tidak ada data</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
