import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase"; // make sure your firebase is initialized

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true); // Loading indicator
  const [error, setError] = useState("");

  // Fetch students from Firebase
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "students"));
        const data = querySnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setStudents(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch students.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Handle status change (approve/reject)
  const handleStatusChange = async (id, newStatus) => {
    try {
      const studentRef = doc(db, "students", id);
      await updateDoc(studentRef, { status: newStatus });

      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading students...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div style={{ padding: 30, fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: 25 }}>Admin Dashboard</h2>
      {students.length === 0 && <p>No students found.</p>}
      {students.map((student) => (
        <div
          key={student.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: 10,
            padding: 20,
            marginBottom: 20,
            background: "#f9f9f9",
          }}
        >
          <p><b>Name:</b> {student.name}</p>
          <p><b>Register No:</b> {student.registerNumber}</p>
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
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => handleStatusChange(student.id, "approved")}
              style={{
                padding: 10,
                background: "green",
                color: "white",
                border: "none",
                borderRadius: 5,
                cursor: "pointer",
              }}
            >
              Approve
            </button>
            <button
              onClick={() => handleStatusChange(student.id, "rejected")}
              style={{
                padding: 10,
                background: "red",
                color: "white",
                border: "none",
                borderRadius: 5,
                cursor: "pointer",
              }}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
