import React, { useState } from "react";
import axios from "axios";

export default function Auth({ setToken, setUsername }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin
      ? "http://localhost:5000/auth/login"
      : "http://localhost:5000/auth/register";

    try {
      let res;

      if (isLogin) {
        // Login
        res = await axios.post(url, form);
      } else {
        // Register then login
        await axios.post(url, form);
        res = await axios.post("http://localhost:5000/auth/login", form);
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
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">{isLogin ? "Login" : "Register"}</button>
      </form>
      <button
        style={{ marginTop: "10px" }}
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? "Switch to Register" : "Switch to Login"}
      </button>
    </div>
  );
}
