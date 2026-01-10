import React, { useState } from "react";
import axios from "axios";

// Using a variable makes it easier to change later if needed
const API_URL = "https://splitwise-backend-ten.vercel.app";

export default function Auth({ setToken, setUsername }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Update 1: Live URL for Login/Register
    const url = isLogin
      ? `${API_URL}/auth/login`
      : `${API_URL}/auth/register`;

    try {
      let res;

      if (isLogin) {
        // Login
        res = await axios.post(url, form);
      } else {
        // Register then login
        await axios.post(url, form);
        // Update 2: Live URL for Login after Register
        res = await axios.post(`${API_URL}/auth/login`, form);
      }

      // Store token and username
      setToken(res.data.token);
      setUsername(res.data.username);

      alert(isLogin ? "Logged in!" : "Registered and logged in!");

      // Clear form
      setForm({ username: "", password: "" });
    } catch (err) {
      console.log(err.response);
      alert(err.response?.data?.message || "Error occurred");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>{isLogin ? "Login" : "Register"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          style={{ display: "block", marginBottom: "10px", padding: "8px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          style={{ display: "block", marginBottom: "10px", padding: "8px" }}
        />
        <button type="submit" style={{ padding: "8px 15px", background: "#28a745", color: "#fff", border: "none", cursor: "pointer" }}>
          {isLogin ? "Login" : "Register"}
        </button>
      </form>
      <button
        style={{ marginTop: "10px", background: "none", border: "none", color: "blue", cursor: "pointer", textDecoration: "underline" }}
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? "Switch to Register" : "Switch to Login"}
      </button>
    </div>
  );
}