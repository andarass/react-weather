import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const API_KEY = import.meta.env.VITE_OWM_KEY;

function App() {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [error, setError] = useState("");

  async function fetchWeather(e) {
    e.preventDefault();
    const q = city.trim();
    if (!q) return;

    setStatus("loading");
    setError("");
    setData(null);

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        q
      )}&appid=${API_KEY}&units=metric&lang=id`;

      const res = await fetch(url);
      const json = await res.json();

      // OWM kadang kirim json.cod berupa string, kadang number—amanin dua-duanya
      const cod = Number(json.cod);
      if (!res.ok || cod !== 200) {
        throw new Error(json.message || "Gagal mengambil cuaca");
      }

      setData(json);
      setStatus("done");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  return (
    <div className="page weather">
      <div className="container">
        <h1>React Weather</h1>

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

        {status === "loading" && <p className="muted">Memuat data cuaca…</p>}
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
      </div>
    </div>
  );
}

export default App
