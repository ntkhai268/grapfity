import React from 'react';
import '/Users/dangkhoii/Documents/Graptify/frontend/src/styles/LoginForm.css'; // Đảm bảo đường dẫn đúng với file CSS bạn vừa dùng

const LoginLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="login-background">
      {children}
    </div>
  );
};

export default LoginLayout;
