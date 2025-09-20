import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * AdminPanel - real-time admin view of students with approve/reject
 * Props:
 *  - onLogout(): optional function to call when admin wants to log out
 */
const AdminPanel = ({ onLogout }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // subscribe to realtime updates so admin and students see changes instantly
    try {
      const q = query(collection(db, "students"), orderBy("createdAt", "desc"));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          setStudents(data);
          setLoading(false);
        },
        (err) => {
          console.error("Snapshot error:", err);
          setError("Failed to load students.");
          setLoading(false);
        }
      );
      return () => unsub();
    } catch (err) {
      console.error(err);
      setError("Failed to initialize listener.");
      setLoading(false);
    }
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const studentRef = doc(db, "students", id);
      await updateDoc(studentRef, { status: newStatus });
      // optimistic UI is not necessary because onSnapshot will reflect change,
      // but we can optionally update local state for immediate feedback:
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status. See console.");
    }
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: 900,
        margin: "24px auto",
        padding: 20,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ margin: 0 }}>Admin Panel — Student Approvals</h2>
        <div>
          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                marginRight: 12,
                padding: "8px 12px",
                borderRadius: 6,
                border: "none",
                background: "#666",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {loading && <p>Loading students...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && students.length === 0 && <p>No students found.</p>}

      <div style={{ display: "grid", gap: 12 }}>
        {students.map((student) => (
          <div
            key={student.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 16,
              background: "#fff",
              borderRadius: 10,
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              border: "1px solid #eef2f7",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{student.name}</p>
              <p style={{ margin: "6px 0 0", color: "#555" }}>
                Reg No: {student.registerNumber}
              </p>
              <p style={{ margin: "6px 0 0" }}>
                Status:{" "}
                <span
                  style={{
                    color:
                      student.status === "approved"
                        ? "green"
                        : student.status === "rejected"
                        ? "red"
                        : "orange",
                    fontWeight: 700,
                  }}
                >
                  {student.status || "pending"}
                </span>
              </p>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => handleStatusChange(student.id, "approved")}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: "#2e7d32",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Approve
              </button>

              <button
                onClick={() => {
                  if (window.confirm("Set status to pending?")) {
                    handleStatusChange(student.id, "pending");
                  }
                }}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: "#f0ad4e",
                  color: "#111",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Pending
              </button>

              <button
                onClick={() => {
                  if (window.confirm("Reject this student?")) {
                    handleStatusChange(student.id, "rejected");
                  }
                }}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: "#c62828",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
