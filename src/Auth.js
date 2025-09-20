import React, { useState } from "react";
import { db } from "./firebase"; 
import { collection, addDoc } from "firebase/firestore";

const Auth = () => {
  const [loginType, setLoginType] = useState("student");
  const [studentName, setStudentName] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "students"), {
        name: studentName,
        registerNumber,
        loginType,
        status: "pending", // always start as pending
        createdAt: new Date(),
      });

      alert("✅ Details submitted successfully!");
      setStudentName("");
      setRegisterNumber("");
    } catch (error) {
      console.error("Error submitting details:", error);
      alert("❌ Failed to submit. Check console.");
    }
  };

  return (
    <div style={styles.container}>
      {/* ===== Middle Logo at top ===== */}
      <div style={styles.topLogo}>
        <img src="/logo1.png" alt="MiddleLogo" style={styles.middleLogo} />
      </div>

      {/* ===== Smaller Logos under middle ===== */}
      <div style={styles.smallLogos}>
        <img src="/logo2.png" alt="Logo2" style={styles.smallLogo} />
        <img src="/logo3.png" alt="Logo3" style={styles.smallLogo} />
      </div>

      {/* ===== Login Box ===== */}
      <div style={styles.loginBox}>
        <p style={styles.loginAs}>LOG IN AS:</p>
        <div style={styles.selector}>
          <button
            type="button"
            style={{
              ...styles.selectorBtn,
              ...(loginType === "admin" ? styles.activeBtn : {}),
            }}
            onClick={() => setLoginType("admin")}
          >
            ADMIN
          </button>
          <button
            type="button"
            style={{
              ...styles.selectorBtn,
              ...(loginType === "student" ? styles.activeBtn : {}),
            }}
            onClick={() => setLoginType("student")}
          >
            STUDENT
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={styles.signIn}>SIGN IN</h3>

          <div style={styles.inputGroup}>
            <label style={styles.label}>STUDENT NAME</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>REGISTER NUMBER</label>
            <input
              type="text"
              value={registerNumber}
              onChange={(e) => setRegisterNumber(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.submitBtn}>
            SUBMIT
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    backgroundColor: "#fff",
    minHeight: "100vh",
    padding: "20px",
  },
  topLogo: {
    marginBottom: "10px",
  },
  middleLogo: {
    height: "100px",
  },
  smallLogos: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    marginBottom: "20px",
  },
  smallLogo: {
    width: "60px",
    height: "60px",
    objectFit: "contain",
  },
  loginBox: {
    margin: "20px auto",
    backgroundColor: "#1a237e",
    padding: "30px",
    borderRadius: "8px",
    width: "350px",
    color: "white",
  },
  loginAs: {
    fontWeight: "bold",
    marginBottom: "10px",
  },
  selector: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },
  selectorBtn: {
    padding: "10px 20px",
    border: "none",
    background: "blue",
    color: "yellow",
    fontWeight: "bold",
    cursor: "pointer",
    margin: "0 5px",
  },
  activeBtn: {
    border: "2px solid yellow",
  },
  signIn: {
    marginBottom: "20px",
    fontWeight: "bold",
    color: "yellow",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  inputGroup: {
    marginBottom: "15px",
    textAlign: "left",
  },
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

export default Auth;
