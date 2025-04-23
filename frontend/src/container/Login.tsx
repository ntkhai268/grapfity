import React, { useState, useEffect } from 'react';
import '../styles/LoginForm.css';
import { GoogleLogin } from '@react-oauth/google';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const container = document.querySelector('.container');
    const registerBtn = document.querySelector('.register-btn');
    const loginBtn = document.querySelector('.login-btn');

    registerBtn?.addEventListener('click', () => {
      container?.classList.add('active');
    });

    loginBtn?.addEventListener('click', () => {
      container?.classList.remove('active');
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Đăng nhập thành công!');
        window.location.href = 'http://localhost:5173/mainpage';
      } else {
        alert(data.error || 'Sai tài khoản hoặc mật khẩu!');
      }
    } catch (err) {
      console.error('Lỗi kết nối server:', err);
      alert('Không thể kết nối đến máy chủ.');
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch('http://localhost:3001/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Đăng nhập Google thành công!');
        window.location.href = 'http://localhost:5173/mainpage';
      } else {
        alert(data.error || 'Đăng nhập Google thất bại!');
      }
    } catch (err) {
      console.error('Lỗi khi gửi credential:', err);
      alert('Không thể kết nối máy chủ khi đăng nhập bằng Google.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const roleId = 1;  // Mặc định roleId là 1
    try {
      const response = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, roleId })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Đăng ký thành công!');
        window.location.href = 'http://localhost:5173/mainpage'; // Chuyển hướng sau khi đăng ký thành công
      } else {
        alert(data.error || 'Đăng ký thất bại!');
      }
    } catch (err) {
      console.error('Lỗi kết nối server:', err);
      alert('Không thể kết nối đến máy chủ.');
    }
  };

  return (
    <div className="container">
      <div className="form-box login">
        <form onSubmit={handleLogin}>
          <h1>Login</h1>
          <div className="input-box">
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <i className='bx bxs-user'></i>
          </div>
          <div className="input-box">
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <i className='bx bxs-lock-alt'></i>
          </div>
          <div className="forgot-link"><a href="#">Forgot Password?</a></div>
          <button type="submit" className="btn">Login</button>
          <p>or login with social platforms</p>
          <div className="social-icons">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => alert('Đăng nhập Google thất bại!')}
            />
          </div>
        </form>
      </div>

      <div className="form-box register">
        <form onSubmit={handleRegister}>
          <h1>Registration</h1>
          <div className="input-box">
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <i className='bx bxs-user'></i>
          </div>
          <div className="input-box">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <i className='bx bxs-envelope'></i>
          </div>
          <div className="input-box">
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <i className='bx bxs-lock-alt'></i>
          </div>
          <button type="submit" className="btn">Register</button>
          <p>or register with social platforms</p>
          <div className="social-icons">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => alert('Đăng ký Google thất bại!')}
            />
          </div>
        </form>
      </div>

      <div className="toggle-box">
        <div className="toggle-panel toggle-left">
          <h1>Graptify</h1>
          <p>Don't have an account?</p>
          <button className="btn register-btn" type="button">Register</button>
        </div>
        <div className="toggle-panel toggle-right">
          <h1>Graptify</h1>
          <p>Already have an account?</p>
          <button className="btn login-btn" type="button">Login</button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
