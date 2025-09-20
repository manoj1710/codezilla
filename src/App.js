import React, { useState, useEffect } from "react";
import Auth from "./Auth";
import AdminPanel from "./AdminPanel";
import Compiler from "./Compiler";
import Compiler2 from "./Compiler2";
import { db } from "./firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const App = () => {
  const [userType, setUserType] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [studentStatus, setStudentStatus] = useState(null);
  const [compilerStep, setCompilerStep] = useState(1);

  const handleLogin = (type, name = "", regNo = "") => {
    setUserType(type);

    if (type === "admin") return; // admin panel

    // student login
    setStudentName(name);
    setRegisterNumber(regNo);
  };

  const handleLogout = () => {
    setUserType(null);
    setStudentName("");
    setRegisterNumber("");
    setStudentStatus(null);
    setCompilerStep(1);
  };

  // 🔥 Real-time student status listener
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
      });

      return () => unsubscribe(); // cleanup listener on logout/unmount
    }
  }, [userType, studentName, registerNumber]);

  // Admin view
  if (userType === "admin") return <AdminPanel onLogout={handleLogout} />;

  // Student flow
  if (userType === "student") {
    if (studentStatus === "pending" || studentStatus === null) {
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

    if (studentStatus === "approved") {
      return (
        <>
          {compilerStep === 1 && <Compiler onNext={() => setCompilerStep(2)} />}
          {compilerStep === 2 && <Compiler2 onBack={() => setCompilerStep(1)} />}
        </>
      );
    }

    return (
      <div style={{ textAlign: "center", padding: 50, fontFamily: "Arial, sans-serif", color: "red" }}>
        <h2>Access denied.</h2>
      </div>
    );
  }

  return <Auth onLogin={handleLogin} />;
};

export default App;
