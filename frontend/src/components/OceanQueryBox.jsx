import { useState } from "react";
import axios from "axios";

function OceanQueryBox() {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [result, setResult] = useState("");

  const fetchPointData = async () => {
    if (!lat || !lon) {
      setResult("Please enter both latitude and longitude.");
      return;
    }

    try {
      const res = await axios.get("http://localhost:8000/ocean/", {
        params: { lat, lon },
      });

      const data = res.data;

      if (!data.length) {
        setResult("No ocean data found at this location.");
        return;
      }

      const point = data[0];

      setResult(
        `Temperature: ${point.temperature.toFixed(2)}°C | Depth: ${point.depth.toFixed(
          2
        )}m | Region: ${point.region}`
      );
    } catch {
      setResult("Error fetching data.");
    }
  };

  return (
    <div style={boxStyle}>
      <h3>📍 Point-Based Ocean Analysis</h3>

      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <input
          type="number"
          placeholder="Latitude"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Longitude"
          value={lon}
          onChange={(e) => setLon(e.target.value)}
          style={inputStyle}
        />
        <button onClick={fetchPointData} style={buttonStyle}>
          Analyze
        </button>
      </div>

      {result && <div style={{ color: "#94a3b8" }}>{result}</div>}
    </div>
  );
}

const boxStyle = {
  marginTop: "30px",
  padding: "25px",
  background: "#1e293b",
  borderRadius: "18px",
};

const inputStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #334155",
  background: "#0f172a",
  color: "white",
};

const buttonStyle = {
  padding: "10px 15px",
  background: "#2563eb",
  border: "none",
  borderRadius: "8px",
  color: "white",
  cursor: "pointer",
};

export default OceanQueryBox;