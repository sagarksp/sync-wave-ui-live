import React from "react";
import { useSocket } from "../context/SocketContext";

function fmt(sec) {
  if (!sec) return "";
  return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
}

export default function Queue() {
  const { state, emit } = useSocket();
  const queue = state?.queue || [];
  const currentId = state?.currentSong?.id;

  const play = (song) => {
    emit("play_song", { song });
  };

  const remove = (e, id) => {
    e.stopPropagation();
    emit("set_queue", { queue: queue.filter((s) => s.id !== id) });
  };

  const moveUp = (e, idx) => {
    e.stopPropagation();
    if (idx === 0) return;

    const q = [...queue];
    [q[idx - 1], q[idx]] = [q[idx], q[idx - 1]];
    emit("set_queue", { queue: q });
  };

  const moveDown = (e, idx) => {
    e.stopPropagation();
    if (idx === queue.length - 1) return;

    const q = [...queue];
    [q[idx], q[idx + 1]] = [q[idx + 1], q[idx]];
    emit("set_queue", { queue: q });
  };

  const clearQueue = () => emit("set_queue", { queue: [] });

  return (
    <div className="queue-panel">
      <div className="panel-header">
        <span className="panel-title">Queue</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="panel-badge">{queue.length}</span>
          {queue.length > 0 && (
            <button className="clear-btn" onClick={clearQueue} title="Clear queue">
              x
            </button>
          )}
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="queue-empty">
          <div style={{ fontSize: 32 }}>Music</div>
          <div>Search songs to add to queue</div>
        </div>
      ) : (
        <div className="queue-list">
          {queue.map((song, idx) => {
            const active = song.id === currentId;

            return (
              <div key={song.id} className={`queue-item ${active ? "active" : ""}`} onClick={() => play(song)}>
                <div className="qi-left">
                  <div className="qi-cover-wrap">
                    <img
                      src={song.cover}
                      alt={song.title}
                      className="qi-cover"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/36/1a1a2e/fff?text=Music";
                      }}
                    />
                    {active && (
                      <div className="qi-bars">
                        <span />
                        <span />
                        <span />
                      </div>
                    )}
                  </div>
                  <div className="qi-info">
                    <span className="qi-title">{song.title}</span>
                    <span className="qi-artist">{song.artist}</span>
                  </div>
                </div>
                <div className="qi-right">
                  <span className="qi-dur">{fmt(song.duration)}</span>
                  <div className="qi-actions">
                    <button className="qi-btn" onClick={(e) => moveUp(e, idx)}>
                      Up
                    </button>
                    <button className="qi-btn" onClick={(e) => moveDown(e, idx)}>
                      Down
                    </button>
                    <button className="qi-btn del" onClick={(e) => remove(e, song.id)}>
                      x
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
