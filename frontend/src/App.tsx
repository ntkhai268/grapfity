import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from '/Users/dangkhoii/Documents/Graptify/frontend/src/component/login/LoginForm.tsx';
import MainPage from '/Users/dangkhoii/Documents/Graptify/frontend/src/component/mainpage/mainpage.tsx';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/mainpage" element={<MainPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;