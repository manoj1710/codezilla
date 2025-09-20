import React, { useState } from "react";
import Auth from "./Auth"; // the unified auth file you already have
import AdminPanel from "./AdminPanel";
import AdminLogin from "./AdminLogin";
import Compiler from "./Compiler";
import Compiler2 from "./Compiler2";
import { db } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

/**
 * App - orchestrates the flow:
 *  - shows Auth (student/admin selection) by default
 *  - admin -> AdminPanel
 *  - student -> pending / approved / rejected -> compilers or message
 *
 * Auth must call onLogin(type, name, registerNumber)
 */
const App = () => {
  const [userType, setUserType] = useState(null); // "admin" or "student"
  const [studentName, setStudentName] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [studentStatus, setStudentStatus] = useState(null);
  const [compilerStep, setCompilerStep] = useState(1);

  // Called by Auth.js when user submits (admin or student)
  const handleLogin = async (type, name = "", regNo = "") => {
    setUserType(type);

    if (type === "admin") {
      // show panel
      return;
    }

    // student
    setStudentName(name);
    setRegisterNumber(regNo);

    try {
      const q = query(
        collection(db, "students"),
        where("name", "==", name),
        where("registerNumber", "==", regNo)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const studentData = snapshot.docs[0].data();
        setStudentStatus(studentData.status);
      } else {
        // no record yet; Auth.js should have created it, but fallback to pending
        setStudentStatus("pending");
      }
    } catch (err) {
      console.error("Error checking student status:", err);
      setStudentStatus("pending");
    }
  };

  const handleLogout = () => {
    // return to Auth screen
    setUserType(null);
    setStudentName("");
    setRegisterNumber("");
    setStudentStatus(null);
    setCompilerStep(1);
  };

  // Admin view
  if (userType === "admin") {
    return <AdminPanel onLogout={handleLogout} />;
  }

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

    // rejected or other
    return (
      <div style={{ textAlign: "center", padding: 50, fontFamily: "Arial, sans-serif", color: "red" }}>
        <h2>Access denied.</h2>
      </div>
    );
  }

  // Default: show auth page
  return <Auth onLogin={handleLogin} />;
};

export default App;
