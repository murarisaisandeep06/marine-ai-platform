import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet.heat";

function HeatLayer({ data, mode }) {
  const map = useMap();

  useEffect(() => {
    if (!data || !data.length) return;

    const heatPoints = data.map((point) => {
      let intensity = 0;

      if (mode === "temperature") {
        intensity = point.temperature / 40;
      } else if (mode === "depth") {
        intensity = Math.abs(point.depth) / 8000;
      }

      return [point.latitude, point.longitude, intensity];
    });

    const heat = L.heatLayer(heatPoints, {
      radius: 35,
      blur: 30,
      maxZoom: 7,
      minOpacity: 0.3,
      gradient: {
        0.1: "#0000ff",
        0.3: "#00ffff",
        0.5: "#00ff00",
        0.7: "#ffff00",
        0.9: "#ff6600",
        1.0: "#ff0000"
      },
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [data, map, mode]);

  return null;
}

function Legend({ mode }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        background: "rgba(0,0,0,0.8)",
        padding: "10px",
        borderRadius: "8px",
        color: "white",
        fontSize: "12px",
        zIndex: 1000,
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
        {mode === "temperature" ? "Temperature (°C)" : "Depth (m)"}
      </div>

      <div
        style={{
          height: "10px",
          width: "120px",
          background:
            "linear-gradient(to right, blue, cyan, lime, yellow, red)",
          marginBottom: "5px",
        }}
      />

      {mode === "temperature" ? (
        <div>0°C — 40°C</div>
      ) : (
        <div>0m — 8000m</div>
      )}
    </div>
  );
}

function MapView({ data, mode }) {
  return (
    <MapContainer
      center={[15, 75]}
      zoom={4}
      style={{ height: "450px", width: "100%", borderRadius: "20px" }}
    >
      <TileLayer
        attribution="Tiles © Esri"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />

      <TileLayer
        attribution="Labels © Esri"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
      />

      <HeatLayer data={data} mode={mode} />
      <Legend mode={mode} />
    </MapContainer>
  );
}

export default MapView;