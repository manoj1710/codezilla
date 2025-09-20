import React, { useState } from "react";

const AdminLogin = ({ onSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const styles = {
    form: { display: "flex", flexDirection: "column" },
    signIn: { marginBottom: "20px", fontWeight: "bold", color: "yellow" },
    inputGroup: { marginBottom: "15px", textAlign: "left" },
    label: {
      display: "block",
      backgroundColor: "blue",
      color: "yellow",
      padding: "5px",
      fontWeight: "bold",
      marginBottom: "5px",
    },
    input: {
      width: "100%",
      padding: "10px",
      borderRadius: "4px",
      border: "1px solid #ccc",
      fontSize: "14px",
    },
    submitBtn: {
      marginTop: "10px",
      background: "blue",
      color: "yellow",
      padding: "10px 20px",
      border: "none",
      fontWeight: "bold",
      cursor: "pointer",
    },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === "admin@smvec.ac.in" && password === "admin@123") {
      if (onSuccess) onSuccess(); // Notify parent of successful login
    } else {
      alert("Invalid admin credentials");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={styles.signIn}>SIGN IN</h3>
      <div style={styles.inputGroup}>
        <label style={styles.label}>USERNAME</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          required
        />
      </div>
      <div style={styles.inputGroup}>
        <label style={styles.label}>PASSWORD</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
      </div>
      <button type="submit" style={styles.submitBtn}>
        SUBMIT
      </button>
    </form>
  );
};

export default AdminLogin;
