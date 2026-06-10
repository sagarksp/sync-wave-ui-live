import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSocket } from "../context/SocketContext";

function fmt(sec) {
  if (!sec || isNaN(sec)) return "0:00";
  return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
}

export default function Player() {
  const { state, emit } = useSocket();
  const audioRef = useRef(null);
  const [localPos, setLocalPos] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const isSyncingRef = useRef(false);  // prevent feedback loops
  const lastSongIdRef = useRef(null);

  const song = state?.currentSong;

  // ── Sync audio src when song changes ──────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !song) return;
    if (song.id === lastSongIdRef.current) return; // same song

    lastSongIdRef.current = song.id;
    isSyncingRef.current = true;
    audio.src = song.streamUrl || "";
    audio.load();

    // seek to synced position then play/pause
    const onCanPlay = () => {
      isSyncingRef.current = false;
      if (state?.isPlaying) audio.play().catch(() => {});
    };
    audio.addEventListener("canplay", onCanPlay, { once: true });
    return () => audio.removeEventListener("canplay", onCanPlay);
  }, [song?.id]); // eslint-disable-line

  // ── Sync play/pause ───────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !song || isSyncingRef.current) return;
    if (state?.isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [state?.isPlaying]); // eslint-disable-line

  // ── Sync seek position from server ───────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || dragging || isSyncingRef.current) return;
    const serverPos = state?.position || 0;
    if (Math.abs(audio.currentTime - serverPos) > 1.5) {
      audio.currentTime = serverPos;
    }
    setLocalPos(serverPos);
  }, [state?.position]); // eslint-disable-line

  // ── Audio event handlers ──────────────────────────────────
  const handleTimeUpdate = () => {
    if (!dragging) setLocalPos(audioRef.current?.currentTime || 0);
  };
  const handleEnded = () => {
    emit("next_song");
  };
  const handleWaiting = () => setBuffering(true);
  const handlePlaying = () => setBuffering(false);

  const handlePlayPause = () => emit("play_pause", { isPlaying: !state?.isPlaying });
  const handleNext = () => emit("next_song");
  const handlePrev = () => emit("prev_song");

  const handleSeekStart = () => setDragging(true);
  const handleSeekChange = (e) => setLocalPos(Number(e.target.value));
  const handleSeekEnd = (e) => {
    const pos = Number(e.target.value);
    setDragging(false);
    if (audioRef.current) audioRef.current.currentTime = pos;
    emit("seek", { position: pos });
  };

  const handleVolume = (e) => {
    const vol = Number(e.target.value);
    if (audioRef.current) audioRef.current.volume = vol / 100;
    emit("volume_change", { volume: vol });
  };

  const handleSyncToggle = () => emit("toggle_sync", { syncEnabled: !state?.syncEnabled });

  const duration = song?.duration || 0;
  const progress = duration ? (localPos / duration) * 100 : 0;

  return (
    <div className="player">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        crossOrigin="anonymous"
      />

      {/* Song info */}
      <div className="player-info">
        {song ? (
          <>
            <img src={song.cover} alt={song.title} className="player-cover"
              onError={(e) => { e.target.src = "https://via.placeholder.com/46/1a1a2e/fff?text=♪"; }} />
            <div className="player-meta">
              <span className="player-title">{song.title}</span>
              <span className="player-artist">{song.artist}</span>
            </div>
          </>
        ) : (
          <span className="player-empty">No song playing</span>
        )}
      </div>

      {/* Controls */}
      <div className="player-center">
        <div className="player-ctrls">
          <button className="ctrl" onClick={handlePrev} title="Previous">⏮</button>
          <button className="ctrl play" onClick={handlePlayPause} disabled={!song}>
            {buffering ? "⟳" : state?.isPlaying ? "⏸" : "▶"}
          </button>
          <button className="ctrl" onClick={handleNext} title="Next">⏭</button>
        </div>
        <div className="player-progress">
          <span className="ptime">{fmt(localPos)}</span>
          <div className="ptrack">
            <div className="pfill" style={{ width: `${progress}%` }} />
            <input type="range" min={0} max={duration || 100} step={0.1} value={localPos}
              className="pinput"
              onMouseDown={handleSeekStart} onTouchStart={handleSeekStart}
              onChange={handleSeekChange}
              onMouseUp={handleSeekEnd} onTouchEnd={handleSeekEnd}
            />
          </div>
          <span className="ptime">{fmt(duration)}</span>
        </div>
      </div>

      {/* Right */}
      <div className="player-right">
        <button className={`sync-btn ${state?.syncEnabled ? "on" : "off"}`} onClick={handleSyncToggle}>
          🔄 {state?.syncEnabled ? "Live Sync" : "Sync Off"}
        </button>
        <div className="vol-wrap">
          🔊
          <input type="range" min={0} max={100} value={state?.volume ?? 80}
            onChange={handleVolume} className="vol-input" />
        </div>
      </div>
    </div>
  );
}
