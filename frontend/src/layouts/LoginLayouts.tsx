import React from 'react';
import '../styles/LoginForm.css';

const LoginLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="login-background">
      {children}
    </div>
  );
};

export default LoginLayout;
