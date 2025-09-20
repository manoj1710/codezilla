import React, { useState } from "react";

/**
 * Simple, inline-styled admin login component.
 * Props:
 *  - onSuccess(): called when admin logs in successfully
 */
const AdminLogin = ({ onSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Hardcoded admin credentials — replace with real auth later if needed
  const ADMIN_USER = "admin@smvec.ac.in";
  const ADMIN_PASS = "admin@123";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      if (onSuccess) onSuccess();
    } else {
      alert("Invalid admin credentials");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f3f6fb",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: 360,
          background: "#1a237e",
          color: "yellow",
          padding: 28,
          borderRadius: 10,
          boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <h2 style={{ textAlign: "center", margin: "0 0 8px" }}>Admin Login</h2>

        <label style={{ fontSize: 13 }}>Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="admin@smvec.ac.in"
          required
          style={{
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ddd",
            outline: "none",
          }}
        />

        <label style={{ fontSize: 13 }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          required
          style={{
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ddd",
            outline: "none",
          }}
        />

        <button
          type="submit"
          style={{
            marginTop: 8,
            padding: 10,
            borderRadius: 6,
            border: "none",
            background: "yellow",
            color: "#1a237e",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Sign In
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
