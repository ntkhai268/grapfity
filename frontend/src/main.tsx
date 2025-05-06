// import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
// import "./hooks/Trans_Tab"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId="806916828607-7d3ookn22cupeq0gk62madphn6gp3q9f.apps.googleusercontent.com">
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GoogleOAuthProvider>
);
