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
import {
  FiEdit2,
  FiTrash2,
  FiLogOut,
  FiUser,
  FiX,
  FiCheck,
  FiPlus,
  FiCheckCircle,
} from "react-icons/fi";

const Dashboard = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchTasks();
      } else {
        navigate("/login");
      }
    });
    return unsubscribe;
  }, [navigate]);

  async function fetchTasks() {
    try {
      setIsLoading(true);
      const querySnapshot = await getDocs(collection(db, "tasks"));
      const taskData = [];
      querySnapshot.forEach((doc) => {
        taskData.push({ id: doc.id, ...doc.data() });
      });
      setTasks(taskData);
    } catch (err) {
      setError("Failed to fetch tasks");
    } finally {
      setIsLoading(false);
    }
  }

  const addTask = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError("");
      if (editingId) {
        await updateDoc(doc(db, "tasks", editingId), {
          name,
          description,
          deadline,
          updatedAt: new Date(),
        });
        setEditingId(null);
      } else {
        await addDoc(collection(db, "tasks"), {
          name,
          description,
          deadline,
          status: "Pending",
          createdAt: new Date(),
        });
      }
      setName("");
      setDescription("");
      setDeadline("");
      setError("");
      setIsRightPanelOpen(false);
      await fetchTasks();
    } catch (err) {
      setError(editingId ? "Failed to update task" : "Failed to add task");
    } finally {
      setIsLoading(false);
    }
  };

  const editTask = (task) => {
    setEditingId(task.id);
    setName(task.name);
    setDescription(task.description);
    setDeadline(task.deadline);
    setIsRightPanelOpen(true);
  };

  const deleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        setIsLoading(true);
        await deleteDoc(doc(db, "tasks", taskId));
        await fetchTasks();
      } catch (err) {
        setError("Failed to delete task");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setDeadline("");
    setError("");
    setIsRightPanelOpen(false);
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

  const toggleTaskStatus = async (task) => {
    try {
      setIsLoading(true);
      const newStatus = task.status === "Pending" ? "Completed" : "Pending";
      await updateDoc(doc(db, "tasks", task.id), {
        status: newStatus,
        updatedAt: new Date(),
      });
      await fetchTasks();
    } catch (err) {
      setError("Failed to update task status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Task Manager</h1>
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
        <div className="task-list-container">
          <h2>Task Records</h2>

          {isLoading && tasks.length === 0 ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading Tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks found</p>
              <button
                onClick={() => setIsRightPanelOpen(true)}
                className="add-first-btn"
              >
                <FiPlus />
                <span>Add Your First Task</span>
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td>{task.name}</td>
                      <td>{task.description}</td>
                      <td>{task.deadline}</td>
                      <td>{task.status}</td>
                      <td className="actions">
                        <button
                          onClick={() => toggleTaskStatus(task)}
                          disabled={isLoading}
                          className={`status-btn ${
                            task.status === "Completed" ? "completed" : ""
                          }`}
                          title={
                            task.status === "Pending"
                              ? "Mark as completed"
                              : "Mark as pending"
                          }
                        >
                          <FiCheckCircle />
                        </button>
                        <button
                          onClick={() => editTask(task)}
                          disabled={isLoading}
                          className="edit-btn"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
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
        {isRightPanelOpen && (
          <div className="task-form-container">
            <form onSubmit={addTask} className="task-form">
              <h2>{editingId ? "Edit Task" : "Add New Task"}</h2>

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
                <label htmlFor="description">Description:</label>
                <input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="deadline">Deadline:</label>
                <input
                  type="text"
                  id="deadline"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="submit-btn"
                >
                  {isLoading ? (
                    "Processing..."
                  ) : editingId ? (
                    <>
                      <FiCheck />
                      <span>Update Task</span>
                    </>
                  ) : (
                    "Add Task"
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
        <div className="controls">
          <button
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            className={`toggle-form-btn ${isRightPanelOpen ? "active" : ""}`}
          >
            <FiPlus />
            <span>{isRightPanelOpen ? "Close Form" : "Add Task"}</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
