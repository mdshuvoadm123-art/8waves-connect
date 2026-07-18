"use client";
import { useEffect, useState, useCallback } from "react";
import NavBar from "@/components/NavBar";

const EMPTY_FACULTY = {
  name: "",
  designation: "",
  department: "",
  email: "",
  phone: "",
  room: "",
  bio: "",
  photoUrl: "",
  courses: "",
};

function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

export default function AdminPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((data) => {
        setAuthed(!!data.authenticated);
        setUsername(data.username || "");
        setAuthChecked(true);
      })
      .catch(() => setAuthChecked(true));
  }, []);

  if (!authChecked) {
    return (
      <>
        <NavBar />
        <div className="login-wrap">Checking session…</div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      {authed ? (
        <Dashboard username={username} onLogout={() => setAuthed(false)} />
      ) : (
        <LoginForm onSuccess={(u) => { setAuthed(true); setUsername(u); }} />
      )}
    </>
  );
}

function LoginForm({ onSuccess }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");
      onSuccess(data.username);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1>Admin sign-in</h1>
        <p className="hint">8WAVES CONNECT control channel</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ username, onLogout }) {
  const [tab, setTab] = useState("queue");
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [sRes, fRes, mRes] = await Promise.all([
      fetch("/api/students?all=1").then((r) => r.json()),
      fetch("/api/faculty").then((r) => r.json()),
      fetch("/api/materials").then((r) => r.json()),
    ]);
    setStudents(sRes.students || []);
    setFaculty(fRes.faculty || []);
    setMaterials(mRes.materials || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    onLogout();
  }

  async function actOnStudent(id, action, extra = {}) {
    const res = await fetch(`/api/students/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    const data = await res.json();
    setNotice(data.message || data.error || "");
    await loadAll();
  }

  async function deleteStudent(id) {
    if (!confirm("Remove this profile permanently?")) return;
    await fetch(`/api/students/${id}`, { method: "DELETE" });
    await loadAll();
  }

  async function deleteMaterial(id) {
    if (!confirm("Remove this material permanently?")) return;
    await fetch(`/api/materials/${id}`, { method: "DELETE" });
    await loadAll();
  }

  const pending = students.filter((s) => s.status === "pending");

  return (
    <div className="admin-shell">
      <div className="container">
        <div className="admin-header">
          <div>
            <div className="section-label">Signed in as</div>
            <h2 style={{ fontSize: 20, marginTop: 4 }}>{username}</h2>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign out</button>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === "queue" ? "is-active" : ""}`} onClick={() => setTab("queue")}>
            Pending queue ({pending.length})
          </button>
          <button className={`tab ${tab === "students" ? "is-active" : ""}`} onClick={() => setTab("students")}>
            All classmates ({students.length})
          </button>
          <button className={`tab ${tab === "faculty" ? "is-active" : ""}`} onClick={() => setTab("faculty")}>
            Faculty ({faculty.length})
          </button>
          <button className={`tab ${tab === "materials" ? "is-active" : ""}`} onClick={() => setTab("materials")}>
            Materials ({materials.length})
          </button>
        </div>

        {notice && <div className="alert alert-success" style={{ marginBottom: 20 }}>{notice}</div>}

        {loading ? (
          <div className="empty-state">Loading…</div>
        ) : (
          <>
            {tab === "queue" && (
              <QueueTab pending={pending} onApprove={(id) => actOnStudent(id, "approve")} onReject={(id) => {
                const reviewNote = prompt("Optional note for why this was rejected:") || "";
                actOnStudent(id, "reject", { reviewNote });
              }} />
            )}
            {tab === "students" && (
              <StudentsTab students={students} onDelete={deleteStudent} onEdit={(id, data) => actOnStudent(id, "edit", { data })} />
            )}
            {tab === "faculty" && (
              <FacultyTab faculty={faculty} onChanged={loadAll} />
            )}
            {tab === "materials" && (
              <MaterialsTab materials={materials} onChanged={loadAll} onDelete={deleteMaterial} />
            )}
          </>
        )}
      </div>
      <div style={{ height: 60 }} />
    </div>
  );
}

function QueueTab({ pending, onApprove, onReject }) {
  if (pending.length === 0) {
    return <div className="empty-state">Queue is empty — nothing waiting for review.</div>;
  }
  return (
    <div>
      {pending.map((s) => (
        <div className="queue-item" key={s._id}>
          <div className="details">
            <h4>
              {s.name} {s.replacesId && <span className="badge badge-pending" style={{ marginLeft: 8 }}>update request</span>}
            </h4>
            <div className="kv">
              {s.rollNumber && <div><b>Roll:</b> {s.rollNumber}</div>}
              {s.session && <div><b>Session:</b> {s.session}</div>}
              {s.email && <div><b>Email:</b> {s.email}</div>}
              {s.phone && <div><b>Phone:</b> {s.phone}</div>}
              {s.hometown && <div><b>Hometown:</b> {s.hometown}</div>}
              {s.bio && <div><b>Bio:</b> {s.bio}</div>}
              {s.submittedBy && <div><b>Submitter contact:</b> {s.submittedBy}</div>}
            </div>
          </div>
          <div className="row-actions">
            <button className="btn btn-primary btn-sm" onClick={() => onApprove(s._id)}>Approve</button>
            <button className="btn btn-danger btn-sm" onClick={() => onReject(s._id)}>Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function StudentsTab({ students, onDelete, onEdit }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});

  function startEdit(s) {
    setEditingId(s._id);
    setDraft(s);
  }

  function saveEdit() {
    onEdit(editingId, draft);
    setEditingId(null);
  }

  if (students.length === 0) return <div className="empty-state">No classmate records yet.</div>;

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll</th>
            <th>Status</th>
            <th>Contact</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              {editingId === s._id ? (
                <>
                  <td><input value={draft.name || ""} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} /></td>
                  <td><input value={draft.rollNumber || ""} onChange={(e) => setDraft((d) => ({ ...d, rollNumber: e.target.value }))} /></td>
                  <td><StatusBadge status={s.status} /></td>
                  <td><input value={draft.email || ""} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} /></td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-primary btn-sm" onClick={saveEdit}>Save</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td>{s.name}</td>
                  <td>{s.rollNumber || "—"}</td>
                  <td><StatusBadge status={s.status} /></td>
                  <td>{s.email || s.phone || "—"}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(s)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => onDelete(s._id)}>Delete</button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FacultyTab({ faculty, onChanged }) {
  const [form, setForm] = useState(EMPTY_FACULTY);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: "", message: "" });
    try {
      const url = editingId ? `/api/faculty/${editingId}` : "/api/faculty";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Your admin session expired. Please sign out and sign back in, then try again.");
        }
        throw new Error(data.error || "Couldn't save this faculty member.");
      }

      setForm(EMPTY_FACULTY);
      setEditingId(null);
      setStatus({ type: "success", message: editingId ? "Faculty member updated." : "Faculty member added." });
      onChanged();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  }

  function startEdit(f) {
    setEditingId(f._id);
    setForm({ ...EMPTY_FACULTY, ...f });
    setStatus({ type: "", message: "" });
  }

  async function handleDelete(id) {
    if (!confirm("Remove this faculty member?")) return;
    await fetch(`/api/faculty/${id}`, { method: "DELETE" });
    onChanged();
  }

  return (
    <div>
      <form className="form" onSubmit={handleSubmit} style={{ marginBottom: 40 }}>
        <div className="form-note">
          {editingId ? "Editing an existing faculty member." : "Add a new faculty member. This is the only way faculty profiles are created."}
        </div>
        <div className="field">
          <label>Name *</label>
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Designation</label>
          <input name="designation" value={form.designation} onChange={handleChange} placeholder="e.g. Associate Professor" />
        </div>
        <div className="field">
          <label>Department</label>
          <input name="department" value={form.department} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Room</label>
          <input name="room" value={form.room} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Email</label>
          <input name="email" value={form.email} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <div className="field full">
          <label>Courses taught</label>
          <input name="courses" value={form.courses} onChange={handleChange} placeholder="Comma separated" />
        </div>
        <div className="field full">
          <label>Photo URL</label>
          <input name="photoUrl" value={form.photoUrl} onChange={handleChange} />
        </div>
        <div className="field full">
          <label>Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} />
        </div>
        {status.message && (
          <div className={`alert ${status.type === "error" ? "alert-error" : "alert-success"}`}>
            {status.message}
          </div>
        )}
        <div className="field full" style={{ flexDirection: "row", gap: 10 }}>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : editingId ? "Save changes" : "Add faculty member"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost" onClick={() => { setEditingId(null); setForm(EMPTY_FACULTY); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Designation</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {faculty.map((f) => (
              <tr key={f._id}>
                <td>{f.name}</td>
                <td>{f.designation || "—"}</td>
                <td>{f.department || "—"}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => startEdit(f)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(f._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MaterialsTab({ materials, onChanged, onDelete }) {
  const EMPTY = { name: "", driveLink: "", order: 0 };
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "order" ? Number(value) : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: "", message: "" });
    try {
      const url = editingId ? `/api/materials/${editingId}` : "/api/materials";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't save this category.");
      setForm(EMPTY);
      setEditingId(null);
      setStatus({ type: "success", message: editingId ? "Category updated." : "Category added." });
      onChanged();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  }

  function startEdit(m) {
    setEditingId(m._id);
    setForm({ name: m.name, driveLink: m.driveLink, order: m.order || 0 });
    setStatus({ type: "", message: "" });
  }

  return (
    <div>
      <form className="form" onSubmit={handleSubmit} style={{ marginBottom: 40 }}>
        <div className="form-note">
          {editingId
            ? "Editing an existing folder link."
            : "Add a folder shortcut, e.g. \"Software\", \"1-1\", \"1-2\", \"2-1\". Clicking it on the public site opens the Drive link directly."}
        </div>
        <div className="field">
          <label>Name *</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. 1-1" required />
        </div>
        <div className="field">
          <label>Display order</label>
          <input name="order" type="number" value={form.order} onChange={handleChange} />
        </div>
        <div className="field full">
          <label>Google Drive link *</label>
          <input name="driveLink" value={form.driveLink} onChange={handleChange} placeholder="https://drive.google.com/..." required />
          <span className="field-hint">Make sure sharing is set to "Anyone with the link."</span>
        </div>
        {status.message && (
          <div className={`alert ${status.type === "error" ? "alert-error" : "alert-success"}`}>
            {status.message}
          </div>
        )}
        <div className="field full" style={{ flexDirection: "row", gap: 10 }}>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : editingId ? "Save changes" : "Add category"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost" onClick={() => { setEditingId(null); setForm(EMPTY); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {materials.length === 0 ? (
        <div className="empty-state">No material folders added yet.</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Order</th>
                <th>Drive link</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m._id}>
                  <td>{m.name}</td>
                  <td>{m.order ?? 0}</td>
                  <td style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <a href={m.driveLink} target="_blank" rel="noreferrer" style={{ color: "var(--wave-teal)" }}>{m.driveLink}</a>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(m)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => onDelete(m._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
