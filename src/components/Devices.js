import React from "react";
import { useSocket } from "../context/SocketContext";

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function deviceIcon(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("mobile") || n.includes("phone")) return "Phone";
  if (n.includes("tv") || n.includes("living")) return "TV";
  if (n.includes("laptop")) return "Laptop";
  if (n.includes("bedroom")) return "Room";
  if (n.includes("office")) return "Desk";
  if (n.includes("kitchen")) return "Kitchen";
  return "Audio";
}

export default function Devices() {
  const { state, connected } = useSocket();
  const devices = state?.devices || [];

  return (
    <div className="devices-panel">
      <div className="panel-header">
        <span className="panel-title">Devices</span>
        <span className={`status-dot ${connected ? "on" : "off"}`} />
      </div>

      {devices.length === 0 ? (
        <div className="devices-empty">No devices</div>
      ) : (
        <div className="devices-list">
          {devices.map((d) => (
            <div key={d.socketId} className="device-row">
              <span className="d-icon">{deviceIcon(d.deviceName)}</span>
              <div className="d-info">
                <span className="d-name">{d.deviceName}</span>
                <span className="d-time">{timeAgo(d.joinedAt)}</span>
              </div>
              <span className="d-live" />
            </div>
          ))}
        </div>
      )}

      {state && (
        <div className={`sync-bar ${state.syncEnabled ? "on" : "off"}`}>
          {state.syncEnabled ? "Live sync active" : "Sync paused"}
        </div>
      )}

      {state?.currentSong && (
        <div className="now-playing-mini">
          <img
            src={state.currentSong.cover}
            alt=""
            className="mini-cover"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/40/1a1a2e/fff?text=Music";
            }}
          />
          <div className="mini-info">
            <span className="mini-title">{state.currentSong.title}</span>
            <span className="mini-artist">{state.currentSong.artist}</span>
          </div>
          <span className="mini-state">{state.isPlaying ? "Play" : "Pause"}</span>
        </div>
      )}
    </div>
  );
}
