import React, { useState, useEffect } from "react";
import {
  db,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  doc,
  collection,
} from "../../firebase";
import { auth } from "../../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2, FiLogOut, FiUser, FiX, FiCheck, FiPlus } from "react-icons/fi";

const Dashboard = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchStudents();
      } else {
        navigate("/login");
      }
    });
    return unsubscribe;
  }, [navigate]);

  async function fetchStudents() {
    try {
      setIsLoading(true);
      const querySnapshot = await getDocs(collection(db, "students"));
      const studentData = [];
      querySnapshot.forEach((doc) => {
        studentData.push({ id: doc.id, ...doc.data() });
      });
      setStudents(studentData);
    } catch (err) {
      setError("Failed to fetch students");
    } finally {
      setIsLoading(false);
    }
  }

  const addStudent = async (e) => {
    e.preventDefault();
    const emailExist = students.some((student) => student.email === email && student.id !== editingId);
    if (emailExist) {
      setError("Student with this email already exists");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      if (editingId) {
        await updateDoc(doc(db, "students", editingId), {
          name,
          email,
          age: Number(age),
          fatherName,
          updatedAt: new Date(),
        });
        setEditingId(null);
      } else {
        await addDoc(collection(db, "students"), {
          name,
          email,
          age: Number(age),
          fatherName,
          createdAt: new Date(),
        });
      }
      setName("");
      setEmail("");
      setAge("");
      setFatherName("");
      setIsFormOpen(false);
      await fetchStudents();
    } catch (err) {
      setError(editingId ? "Failed to update student" : "Failed to add student");
    } finally {
      setIsLoading(false);
    }
  };

  const editStudent = (student) => {
    setEditingId(student.id);
    setName(student.name);
    setEmail(student.email);
    setAge(student.age);
    setFatherName(student.fatherName);
    setIsFormOpen(true);
  };

  const deleteStudent = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        setIsLoading(true);
        await deleteDoc(doc(db, "students", studentId));
        await fetchStudents();
      } catch (err) {
        setError("Failed to delete student");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setAge("");
    setFatherName("");
    setIsFormOpen(false);
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      setError("Failed to logout");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Student Management</h1>
          <div className="user-actions">
            {currentUser && (
              <div className="user-info">
                <FiUser />
                <span>{currentUser.email}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="logout-btn"
            >
              <FiLogOut />
              <span>{isLoading ? "Logging Out..." : "Logout"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="controls">
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className={`toggle-form-btn ${isFormOpen ? 'active' : ''}`}
          >
            <FiPlus />
            <span>{isFormOpen ? 'Close Form' : 'Add Student'}</span>
          </button>
        </div>

        {isFormOpen && (
          <div className="student-form-container">
            <form onSubmit={addStudent} className="student-form">
              <h2>{editingId ? "Edit Student" : "Add New Student"}</h2>
              
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="age">Age:</label>
                <input
                  type="number"
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="5"
                  max="25"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="fathername">Father's Name:</label>
                <input
                  type="text"
                  id="fathername"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-actions">
                <button type="submit" disabled={isLoading} className="submit-btn">
                  {isLoading ? (
                    "Processing..."
                  ) : editingId ? (
                    <>
                      <FiCheck />
                      <span>Update Student</span>
                    </>
                  ) : (
                    "Add Student"
                  )}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={isLoading}
                    className="cancel-btn"
                  >
                    <FiX />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        <div className="student-list-container">
          <h2>Student Records</h2>
          
          {isLoading && students.length === 0 ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading Students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <p>No students found</p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="add-first-btn"
              >
                <FiPlus />
                <span>Add Your First Student</span>
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Age</th>
                    <th>Father's Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.age}</td>
                      <td>{student.fatherName}</td>
                      <td className="actions">
                        <button
                          onClick={() => editStudent(student)}
                          disabled={isLoading}
                          className="edit-btn"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => deleteStudent(student.id)}
                          disabled={isLoading}
                          className="delete-btn"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;