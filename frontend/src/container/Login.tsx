import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/LoginForm.css";
// import { GoogleLogin } from "@react-oauth/google";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();  // Hook để điều hướng
  const location = useLocation();  // Hook để lấy thông tin location
  // --- Login form state ---
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // --- Register form state ---
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regError, setRegError] = useState<string | null>(null);

  useEffect(() => {
    const container = document.querySelector(".container");
    const registerBtn = document.querySelector(".register-btn");
    const loginBtn = document.querySelector(".login-btn");

    registerBtn?.addEventListener("click", () => {
      container?.classList.add("active");
      setLoginError(null);
      setRegError(null);
    });

    loginBtn?.addEventListener("click", () => {
      container?.classList.remove("active");
      setLoginError(null);
      setRegError(null);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });

      const data: {
        message: string;
        token?: string;
        roleId?: number;
      } = await response.json();

      if (response.ok && data.token && data.roleId != null) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("roleId", data.roleId.toString());
        const from = location.state?.from?.pathname || '/';  // Lấy thông tin trang trước đó
        navigate(from, { replace: true });  // Điều hướng về trang trước đó

        if (data.roleId === 1) {
          navigate("/mainpage"); 
        } else if (data.roleId === 2) {
          window.location.href = "http://localhost:5173/admin";
        } else {
          navigate("/");
        }
      } else {
        setLoginError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Lỗi kết nối server:", err);
      setLoginError("Không thể kết nối đến máy chủ.");
    }
  };

  // const handleGoogleLoginSuccess = async (credentialResponse: any) => {
  //   try {
  //     const res = await fetch("http://localhost:3001/api/auth/google", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ credential: credentialResponse.credential }),
  //     });

  //     const data = await res.json();
  //     if (res.ok) {
  //       alert("Đăng nhập Google thành công!");
  //       window.location.href = "http://localhost:5173/mainpage";
  //     } else {
  //       alert(data.error || "Đăng nhập Google thất bại!");
  //     }
  //   } catch (err) {
  //     console.error("Lỗi khi gửi credential:", err);
  //     alert("Không thể kết nối máy chủ khi đăng nhập bằng Google.");
  //   }
  // };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (regPassword !== regConfirmPassword) {
      setRegError("Mật khẩu và xác nhận mật khẩu phải khớp");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userName: regUsername,
          email: regEmail,
          password: regPassword,
          roleId: 1, // mặc định roleId 1 cho user thường
        }),
      });
      const data: { message: string } = await response.json();
      if (response.ok) {
        alert("Đăng ký thành công!");
        window.location.href = "http://localhost:5173/mainpage";
      } else {
        setRegError(data.message || "Đăng ký thất bại!");
      }
    } catch (err) {
      console.error("Lỗi kết nối server:", err);
      setRegError("Không thể kết nối đến máy chủ.");
    }
  };

  return (
    <div className="container">
      {/* LOGIN */}
      <div className="form-box login">
        <form onSubmit={handleLogin}>
          <h1>Login</h1>
          {loginError && <div className="error-text">{loginError}</div>}
          <div className="input-box">
            <input
              type="text"
              placeholder="Username"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-box">
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
          </div>
          <div className="forgot-link">
            <a href="#">Forgot Password?</a>
          </div>
          <button type="submit" className="btn">
            Login
          </button>
          
         
        </form>
      </div>

      {/* REGISTER */}
      <div className="form-box register">
        <form onSubmit={handleRegister}>
          <h1>Registration</h1>
          {regError && <div className="error-text">{regError}</div>}
          <div className="input-box">
            <input
              type="text"
              placeholder="Username"
              value={regUsername}
              onChange={(e) => setRegUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-box">
            <input
              type="email"
              placeholder="Email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-box">
            <input
              type="password"
              placeholder="Password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-box">
            <input
              type="password"
              placeholder="Confirm Password"
              value={regConfirmPassword}
              onChange={(e) => setRegConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn">
            Register
          </button>
          
        </form>
      </div>

      {/* TOGGLE PANELS */}
      <div className="toggle-box">
        <div className="toggle-panel toggle-left">
          <h1>Graptify</h1>
          <p>Don't have an account?</p>
          <button className="btn register-btn" type="button">
            Register
          </button>
        </div>
        <div className="toggle-panel toggle-right">
          <h1>Graptify</h1>
          <p>Already have an account?</p>
          <button className="btn login-btn" type="button">
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
