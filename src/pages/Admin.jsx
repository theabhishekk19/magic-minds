import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
const LS_TOKEN = "MM_ADMIN_TOKEN";

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem(LS_TOKEN) || "");
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem(LS_TOKEN));

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const statusOptions = useMemo(
    () => ["new", "contacted", "scheduled", "done", "cancelled"],
    []
  );

  const stats = useMemo(() => {
    return {
      total: appointments.length,
      new: appointments.filter((a) => a.status === "new").length,
      contacted: appointments.filter((a) => a.status === "contacted").length,
      done: appointments.filter((a) => a.status === "done").length,
    };
  }, [appointments]);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  const login = async () => {
    try {
      setErr("");

      if (!username || !password) {
        setErr("Please enter username and password");
        return;
      }

      const res = await fetch(`${API}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem(LS_TOKEN, data.token);
      setToken(data.token);
      setLoggedIn(true);
      setUsername("");
      setPassword("");
      fetchAppointments("", "all", data.token);
    } catch (e) {
      setErr(e.message || "Login error");
    }
  };

  const logout = () => {
    localStorage.removeItem(LS_TOKEN);
    setToken("");
    setLoggedIn(false);
    setAppointments([]);
    setSelectedAppointment(null);
  };

  const fetchAppointments = async (
    qq = q,
    ss = statusFilter,
    customToken = token
  ) => {
    try {
      setErr("");
      setLoading(true);

      const params = new URLSearchParams();
      if (qq.trim()) params.set("q", qq.trim());
      if (ss && ss !== "all") params.set("status", ss);

      const res = await fetch(`${API}/api/appointments?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${customToken}`,
        },
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Fetch failed");
      }

      setAppointments(data.data || []);
    } catch (e) {
      setErr(e.message || "Server error");
      if (
        String(e.message || "").toLowerCase().includes("unauthorized") ||
        String(e.message || "").toLowerCase().includes("invalid")
      ) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedIn && token) {
      fetchAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    const t = setTimeout(() => fetchAppointments(q, statusFilter), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      setErr("");

      const res = await fetch(`${API}/api/appointments/${id}/status`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Status update failed");

      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status } : a))
      );

      if (selectedAppointment && selectedAppointment._id === id) {
        setSelectedAppointment((prev) => ({ ...prev, status }));
      }
    } catch (e) {
      setErr(e.message || "Status update error");
    }
  };

  const deleteAppointment = async (id) => {
    const ok = window.confirm("Delete this appointment?");
    if (!ok) return;

    try {
      setErr("");

      const res = await fetch(`${API}/api/appointments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Delete failed");

      setAppointments((prev) => prev.filter((a) => a._id !== id));

      if (selectedAppointment && selectedAppointment._id === id) {
        setSelectedAppointment(null);
      }
    } catch (e) {
      setErr(e.message || "Delete error");
    }
  };

  const statusClass = (status) => {
    if (status === "new") return "badge-new";
    if (status === "contacted") return "badge-contacted";
    if (status === "scheduled") return "badge-scheduled";
    if (status === "done") return "badge-done";
    if (status === "cancelled") return "badge-cancelled";
    return "";
  };

  if (!loggedIn) {
    return (
      <div className="admin-login-page">
        <div className="container">
          <div className="admin-login-center">
            <div className="admin-login-card2">
              <span className="section-tag">Admin Access</span>
              <h1 className="admin-title">Admin Login</h1>
              <p className="admin-sub">
                Login with your username and password to manage appointments.
              </p>

              <div className="admin-login-form2">
                <input
                  className="admin-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  type="text"
                />

                <input
                  className="admin-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  type="password"
                />

                <button
                  className="btn btn-primary admin-login-btn2"
                  onClick={login}
                >
                  Login
                </button>

                {err && <p className="admin-error">{err}</p>}

                <Link to="/" className="admin-back-link2">
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-topbar">
          <div>
            <h1>Admin Panel</h1>
            <p>Search, update status, view full details, and manage appointments.</p>
          </div>

          <div className="admin-actions">
            <Link to="/" className="btn btn-secondary">
              ← Back
            </Link>
            <button className="btn btn-secondary" onClick={logout}>
              Logout
            </button>
            <button
              className="btn btn-primary"
              onClick={() => fetchAppointments()}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <h3>{stats.total}</h3>
            <p>Total Requests</p>
          </div>
          <div className="admin-stat-card">
            <h3>{stats.new}</h3>
            <p>New</p>
          </div>
          <div className="admin-stat-card">
            <h3>{stats.contacted}</h3>
            <p>Contacted</p>
          </div>
          <div className="admin-stat-card">
            <h3>{stats.done}</h3>
            <p>Done</p>
          </div>
        </div>

        <div className="admin-filters">
          <input
            className="admin-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by parent / phone / email / child / service"
          />

          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {err && <p className="admin-error">{err}</p>}
        {loading && <p>Loading...</p>}

        {!loading && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Parent</th>
                  <th>Phone</th>
                  <th>Child</th>
                  <th>Age</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Date/Time</th>
                  <th>View</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center" }}>
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  appointments.map((a) => (
                    <tr key={a._id}>
                      <td>{a.name}</td>
                      <td>{a.phone}</td>
                      <td>{a.childName || "-"}</td>
                      <td>{a.childAge || "-"}</td>
                      <td>{a.service}</td>

                      <td>
                        <div style={{ display: "grid", gap: "8px" }}>
                          <span className={`status-badge ${statusClass(a.status)}`}>
                            {a.status || "new"}
                          </span>

                          <select
                            className="admin-select small"
                            value={a.status || "new"}
                            onChange={(e) => updateStatus(a._id, e.target.value)}
                          >
                            {statusOptions.map((s) => (
                              <option key={s} value={s}>
                                {s.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td>
                        <div>{a.preferredDate || "-"}</div>
                        <div style={{ color: "#64748b", fontSize: "13px" }}>
                          {a.preferredTime || "-"}
                        </div>
                      </td>

                      <td>
                        <button
                          className="btn btn-secondary small-btn"
                          onClick={() => setSelectedAppointment(a)}
                        >
                          View
                        </button>
                      </td>

                      <td>
                        <button
                          className="btn btn-secondary small-btn"
                          onClick={() => deleteAppointment(a._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {selectedAppointment && (
          <div
            className="admin-modal-overlay"
            onClick={() => setSelectedAppointment(null)}
          >
            <div
              className="admin-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-top">
                <h2>Appointment Details</h2>
                <button
                  className="admin-modal-close"
                  onClick={() => setSelectedAppointment(null)}
                >
                  ✕
                </button>
              </div>

              <div className="admin-modal-grid">
                <div><strong>Parent Name:</strong> {selectedAppointment.name}</div>
                <div><strong>Phone:</strong> {selectedAppointment.phone}</div>
                <div><strong>Email:</strong> {selectedAppointment.email}</div>
                <div><strong>Child Name:</strong> {selectedAppointment.childName}</div>
                <div><strong>Child Age:</strong> {selectedAppointment.childAge}</div>
                <div><strong>Service:</strong> {selectedAppointment.service}</div>
                <div><strong>Preferred Date:</strong> {selectedAppointment.preferredDate || "-"}</div>
                <div><strong>Preferred Time:</strong> {selectedAppointment.preferredTime || "-"}</div>
                <div>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`status-badge ${statusClass(
                      selectedAppointment.status
                    )}`}
                  >
                    {selectedAppointment.status || "new"}
                  </span>
                </div>
                <div>
                  <strong>Created:</strong>{" "}
                  {new Date(selectedAppointment.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="admin-message-box">
                <strong>Message / Notes</strong>
                <p>{selectedAppointment.message || "No message provided."}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}