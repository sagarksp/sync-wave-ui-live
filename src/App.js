import React, { useState, useEffect, useRef } from "react";
import { SocketProvider, useSocket } from "./context/SocketContext";
import Login from "./components/Login";
import Player from "./components/Player";
import Queue from "./components/Queue";
import Search from "./components/Search";
import Devices from "./components/Devices";
import NowPlaying from "./components/NowPlaying";
import "./App.css";

function SyncToast({ msg }) {
  if (!msg) return null;
  return <div className="sync-toast">{msg}</div>;
}

function Shell() {
  const { state, connected } = useSocket();
  const [tab, setTab] = useState("search");
  const [toast, setToast] = useState("");
  const prevRef = useRef(null);

  useEffect(() => {
    if (!state || !prevRef.current) {
      prevRef.current = state;
      return;
    }

    const prev = prevRef.current;
    let msg = "";

    if (prev.currentSong?.id !== state.currentSong?.id && state.currentSong) {
      msg = `Now playing: ${state.currentSong.title}`;
    } else if (Math.abs((prev.position || 0) - (state.position || 0)) > 2) {
      const m = Math.floor(state.position / 60);
      const s = String(Math.floor(state.position % 60)).padStart(2, "0");
      msg = `Seeked to ${m}:${s}`;
    } else if (prev.isPlaying !== state.isPlaying) {
      msg = state.isPlaying ? "Playing" : "Paused";
    } else if (JSON.stringify(prev.queue?.map((s) => s.id)) !== JSON.stringify(state.queue?.map((s) => s.id))) {
      msg = "Queue updated";
    }

    prevRef.current = state;

    if (msg) {
      setToast(msg);
      const timeout = setTimeout(() => setToast(""), 2500);
      return () => clearTimeout(timeout);
    }
  }, [state]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-logo">
          <span className="logo-mark">SW</span>
          <span className="logo-name">SyncWave</span>
        </div>
        <div className="header-tabs">
          <button className={`htab ${tab === "search" ? "active" : ""}`} onClick={() => setTab("search")}>
            Search
          </button>
          <button className={`htab ${tab === "queue" ? "active" : ""}`} onClick={() => setTab("queue")}>
            Queue {state?.queue?.length > 0 && <span className="htab-badge">{state.queue.length}</span>}
          </button>
        </div>
        <div className={`conn-badge ${connected ? "on" : "off"}`}>
          {connected ? "Connected" : "Reconnecting..."}
        </div>
      </header>

      <main className="app-main">
        <aside className="sidebar-left">
          <Devices />
        </aside>

        <section className="app-content">
          {tab === "search" ? <Search /> : <Queue />}
        </section>

        <aside className="sidebar-right">
          <NowPlaying />
        </aside>
      </main>

      <footer className="app-footer">
        <Player />
      </footer>

      <SyncToast msg={toast} />
    </div>
  );
}

export default function Root() {
  const [auth, setAuth] = useState(null);
  if (!auth) return <Login onLogin={(id, dev) => setAuth({ id, dev })} />;

  return (
    <SocketProvider accountId={auth.id} deviceName={auth.dev}>
      <Shell />
    </SocketProvider>
  );
}
