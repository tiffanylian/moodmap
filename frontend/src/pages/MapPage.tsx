import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPins, logout } from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import type { MoodPin } from "../types";

export default function MapPage() {
  const [pins, setPins] = useState<MoodPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    // Fetch pins from Supabase
    const loadPins = async () => {
      try {
        const data = await fetchPins();
        setPins(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load pins");
      } finally {
        setLoading(false);
      }
    };

    loadPins();
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        <h2>Mood Map</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => navigate("/submit")}
            style={{
              padding: "8px 12px",
              borderRadius: 4,
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            Add another pin
          </button>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: "8px 12px",
              borderRadius: 4,
              border: "1px solid #ccc",
              cursor: "pointer",
              background: "#fee",
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Mapbox placeholder */}
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          height: 320,
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "repeating-linear-gradient(45deg, #fafafa, #fafafa 10px, #f0f0f0 10px, #f0f0f0 20px)",
        }}
      >
        <span style={{ color: "#555" }}>
          Map placeholder — Mapbox will render here
        </span>
      </div>

      <h3>Current pins</h3>

      {error && (
        <div style={{ color: "#ef4444", marginBottom: 16 }}>{error}</div>
      )}

      {loading && <p>Loading pins…</p>}

      {!loading && !error && pins.length === 0 && <p>No pins yet.</p>}

      {!loading && pins.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, marginTop: 12 }}>
          {pins.map((pin) => (
            <li
              key={pin.id}
              style={{
                padding: "8px 0",
                borderBottom: "1px solid #eee",
                fontSize: 14,
              }}
            >
              <strong>{pin.mood}</strong>
              {pin.message && ` — ${pin.message}`}
              <div style={{ color: "#777", fontSize: 12, marginTop: 2 }}>
                {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
