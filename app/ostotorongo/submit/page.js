"use client";
import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const EMPTY = {
  name: "",
  rollNumber: "",
  session: "",
  email: "",
  phone: "",
  bloodGroup: "",
  hometown: "",
  bio: "",
  photoUrl: "",
  socialLink: "",
  submittedBy: "",
};

export default function SubmitPage() {
  const [mode, setMode] = useState("new"); // "new" | "update"
  const [approved, setApproved] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((data) => setApproved(data.students || []))
      .catch(() => {});
  }, []);

  function handleModeChange(next) {
    setMode(next);
    setSelectedId("");
    setForm(EMPTY);
    setStatus({ type: "", message: "" });
  }

  function handleSelectExisting(id) {
    setSelectedId(id);
    const existing = approved.find((s) => s._id === id);
    if (existing) {
      setForm({ ...EMPTY, ...existing });
    }
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (mode === "update" && !selectedId) {
      setStatus({ type: "error", message: "Pick which existing profile you're updating first." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          replacesId: mode === "update" ? selectedId : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus({ type: "success", message: data.message });
      setForm(EMPTY);
      setSelectedId("");
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <NavBar />
      <section className="hero" style={{ paddingBottom: 24 }}>
        <div className="container">
          <div className="eyebrow">Channel 01 — Submission form</div>
          <h1 style={{ fontSize: "clamp(30px, 5vw, 48px)" }}>
            Add or update your <span className="grad">profile</span>
          </h1>
          <p className="hero-sub">
            Nothing you send here goes live automatically — an admin reviews
            every new profile and every requested change first.
          </p>
        </div>
      </section>

      <section className="section" style={{ borderTop: "none" }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="tabs">
            <button
              type="button"
              className={`tab ${mode === "new" ? "is-active" : ""}`}
              onClick={() => handleModeChange("new")}
            >
              New profile
            </button>
            <button
              type="button"
              className={`tab ${mode === "update" ? "is-active" : ""}`}
              onClick={() => handleModeChange("update")}
            >
              Update existing profile
            </button>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            {mode === "update" && (
              <div className="field full">
                <label htmlFor="existing">Which profile is this?</label>
                <select id="existing" value={selectedId} onChange={(e) => handleSelectExisting(e.target.value)}>
                  <option value="">Select your name…</option>
                  {approved.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} {s.rollNumber ? `— ${s.rollNumber}` : ""}
                    </option>
                  ))}
                </select>
                <span className="field-hint">
                  We'll pre-fill the form with what's currently live so you only need to change what's wrong.
                </span>
              </div>
            )}

            <div className="form-note">
              {mode === "new"
                ? "Fill in as much as you're comfortable sharing. Only Name is required."
                : "Edit the fields below. The change goes to the admin queue and won't overwrite your current profile until it's approved."}
            </div>

            <div className="field">
              <label htmlFor="name">Full name *</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="rollNumber">Roll number</label>
              <input id="rollNumber" name="rollNumber" value={form.rollNumber} onChange={handleChange} />
            </div>
            <div className="field">
              <label htmlFor="session">Session / batch</label>
              <input id="session" name="session" placeholder="e.g. 2021-22" value={form.session} onChange={handleChange} />
            </div>
            <div className="field">
              <label htmlFor="bloodGroup">Blood group</label>
              <input id="bloodGroup" name="bloodGroup" placeholder="e.g. O+" value={form.bloodGroup} onChange={handleChange} />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" name="email" value={form.email} onChange={handleChange} />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="field">
              <label htmlFor="hometown">Hometown</label>
              <input id="hometown" name="hometown" value={form.hometown} onChange={handleChange} />
            </div>
            <div className="field">
              <label htmlFor="socialLink">Social / portfolio link</label>
              <input id="socialLink" name="socialLink" placeholder="https://" value={form.socialLink} onChange={handleChange} />
            </div>
            <div className="field full">
              <label htmlFor="photoUrl">Photo URL</label>
              <input id="photoUrl" name="photoUrl" placeholder="https://…" value={form.photoUrl} onChange={handleChange} />
              <span className="field-hint">Link to an image hosted elsewhere (e.g. Google Drive, Imgur).</span>
            </div>
            <div className="field full">
              <label htmlFor="bio">Short bio</label>
              <textarea id="bio" name="bio" maxLength={600} value={form.bio} onChange={handleChange} />
            </div>
            <div className="field full">
              <label htmlFor="submittedBy">Your contact (for the admin only, not shown publicly)</label>
              <input id="submittedBy" name="submittedBy" placeholder="Phone or email, in case the admin needs to reach you" value={form.submittedBy} onChange={handleChange} />
            </div>

            {status.message && (
              <div className={`alert ${status.type === "error" ? "alert-error" : "alert-success"}`}>
                {status.message}
              </div>
            )}

            <div className="field full">
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? "Sending…" : "Send for approval"}
              </button>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </>
  );
}
