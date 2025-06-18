import React from 'react';
import '../styles/LoginForm.css'; // Đảm bảo đường dẫn đúng với file CSS bạn vừa dùng

const LoginLayout = ({ children }: { children: React.ReactNode }) => {
    // useEffect(() => {
    //   document.body.classList.add("profile-page");
    //   return () => {
    //     // react tự động gọi khi 
    //     document.body.classList.remove("profile-page");
    //   };
    // }, []);
  return (
    <div className="login-background">
      {children}
    </div>
  );
};

export default LoginLayout;
