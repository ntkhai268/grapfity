import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './assets/styles1.css';
import './css/Song-manager/songmanager.css';
import "./js/waveform";
import "./js/playlist.js";

import "./js/trans_tab";
import "./js/Manager_song_play_pause.js";
import "./js/GlobalAudioManager.js"; 
import "./js/FooterAudioPlayer.js";



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
