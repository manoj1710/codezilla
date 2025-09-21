// src/App.js

import React, { useState, useEffect } from "react";
import Auth from "./Auth";
import AdminPanel from "./AdminPanel";
import ExamCompiler from './ExamCompiler';
import { db } from "./firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

// A simple loading component
const LoadingIndicator = () => (
  <div style={{ textAlign: "center", padding: 50, fontFamily: "Arial, sans-serif" }}>
    <h2>Loading...</h2>
  </div>
);

const App = () => {
  const [userType, setUserType] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [studentStatus, setStudentStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // <-- Improvement 2: New loading state

  const handleLogin = (type, name = "", regNo = "") => {
    setUserType(type);
    if (type === "student") {
      setStudentName(name);
      setRegisterNumber(regNo);
      setIsLoading(true); // Start loading when student logs in
    }
  };

  const handleLogout = () => {
    setUserType(null);
    setStudentName("");
    setRegisterNumber("");
    setStudentStatus(null);
  };

  useEffect(() => {
    if (userType === "student" && studentName && registerNumber) {
      const q = query(
        collection(db, "students"),
        where("name", "==", studentName),
        where("registerNumber", "==", registerNumber)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          setStudentStatus(data.status || "pending");
        } else {
          setStudentStatus("pending");
        }
        setIsLoading(false); // <-- Improvement 2: Stop loading once status is fetched
      });

      return () => unsubscribe();
    }
  }, [userType, studentName, registerNumber]);

  if (userType === "admin") {
    return <AdminPanel onLogout={handleLogout} />;
  }

  if (userType === "student") {
    // <-- Improvement 2: Show loading indicator while checking status
    if (isLoading) {
        return <LoadingIndicator />;
    }

    // <-- Improvement 1: Streamlined logic with if/else if
    if (studentStatus === "approved") {
      return <ExamCompiler studentName={studentName} registerNumber={registerNumber} />;
    } else if (studentStatus === "rejected") {
      return (
        <div style={{ textAlign: "center", padding: 50, fontFamily: "Arial, sans-serif", color: "red" }}>
          <h2>Access Denied. Your request was rejected by the admin.</h2>
        </div>
      );
    } else { // This handles 'pending' or any other status
      return (
        <div style={{ textAlign: "center", padding: 50, fontFamily: "Arial, sans-serif" }}>
          <h2>Please wait for admin approval...</h2>
          <p style={{ marginTop: 12 }}>
            {studentName && <span><b>Name:</b> {studentName} &nbsp;</span>}
            {registerNumber && <span><b>Reg No:</b> {registerNumber}</span>}
          </p>
        </div>
      );
    }
  }

  return <Auth onLogin={handleLogin} />;
};

export default App;