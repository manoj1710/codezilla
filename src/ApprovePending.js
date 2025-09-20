import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase"; // already in your backend

const ApprovePending = () => {
  const [students, setStudents] = useState([]);

  // Load students from Firestore
  useEffect(() => {
    const fetchStudents = async () => {
      const querySnapshot = await getDocs(collection(db, "students"));
      const data = querySnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setStudents(data);
    };

    fetchStudents();
  }, []);

  // Update status
  const handleUpdate = async (id, newStatus) => {
    const studentRef = doc(db, "students", id);
    await updateDoc(studentRef, { status: newStatus });

    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
  };

  return (
    <div
      style={{
        padding: "30px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f4f6f9",
        minHeight: "100vh",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "25px",
          color: "#1a237e",
        }}
      >
        Student Approvals
      </h2>

      {students.map((student) => (
        <div
          key={student.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "20px",
            marginBottom: "20px",
            background: "#fff",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        >
          <p>
            <b>Name:</b> {student.name}
          </p>
          <p>
            <b>Register No:</b> {student.registerNumber}
          </p>
          <p>
            <b>Status:</b>{" "}
            <span
              style={{
                color:
                  student.status === "approved"
                    ? "green"
                    : student.status === "rejected"
                    ? "red"
                    : "orange",
                fontWeight: "bold",
              }}
            >
              {student.status || "pending"}
            </span>
          </p>

          <div style={{ display: "flex", gap: "15px", marginTop: "15px" }}>
            <button
              style={{
                flex: 1,
                padding: "10px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: "#28a745",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              onClick={() => handleUpdate(student.id, "approved")}
            >
              Approve
            </button>

            <button
              style={{
                flex: 1,
                padding: "10px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: "#ffc107",
                color: "#000",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              onClick={() => handleUpdate(student.id, "pending")}
            >
              Pending
            </button>

            <button
              style={{
                flex: 1,
                padding: "10px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: "#dc3545",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              onClick={() => handleUpdate(student.id, "rejected")}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApprovePending;
