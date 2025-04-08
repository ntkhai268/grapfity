import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from '/Users/dangkhoii/Documents/Graptify/frontend/src/container/Login.tsx';
import Homepage from '/Users/dangkhoii/Documents/Graptify/frontend/src/container/HomePage.tsx';

import LoginLayout from '/Users/dangkhoii/Documents/Graptify/frontend/src/layouts/LoginLayouts.tsx';
import MainLayout from '/Users/dangkhoii/Documents/Graptify/frontend/src/layouts/MainLayouts.tsx';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Login page with LoginLayout */}
      <Route
        path="/"
        element={
          <LoginLayout>
            <Login />
          </LoginLayout>
        }
      />

      {/* Homepage with MainLayout */}
      <Route
        path="/mainpage"
        element={
          <MainLayout>
            <Homepage />
          </MainLayout>
        }
      />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
