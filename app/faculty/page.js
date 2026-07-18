"use client";
import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export default function FacultyPage() {
  const [faculty, setFaculty] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/faculty")
      .then((r) => r.json())
      .then((data) => setFaculty(data.faculty || []))
      .catch(() => setError("Couldn't load the faculty list. Try refreshing."));
  }, []);

  return (
    <>
      <NavBar />
      <section className="hero" style={{ paddingBottom: 24 }}>
        <div className="container">
          <div className="eyebrow">Channel 02 — 3.6 Hz</div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)" }}>
            FACULTY <span className="grad">roster</span>
          </h1>
          <p className="hero-sub">
            Maintained by the admin. Spot something outdated? Let the admin know directly.
          </p>
        </div>
      </section>

      <section className="section" style={{ borderTop: "none" }}>
        <div className="container">
          {error && <div className="empty-state">{error}</div>}
          {!error && faculty === null && <div className="empty-state">Loading faculty…</div>}
          {!error && faculty && faculty.length === 0 && (
            <div className="empty-state">No faculty members have been added yet.</div>
          )}
          {!error && faculty && faculty.length > 0 && (
            <div className="card-grid">
              {faculty.map((f) => (
                <div className="profile-card" key={f._id}>
                  <div className="avatar">
                    {f.photoUrl ? (
                      <img
                        src={f.photoUrl}
                        alt={f.name}
                        style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                      />
                    ) : (
                      initials(f.name)
                    )}
                  </div>
                  <div>
                    <div className="profile-name">{f.name}</div>
                    <div className="profile-meta">
                      {[f.designation, f.department].filter(Boolean).join(" · ") || "—"}
                    </div>
                  </div>
                  {f.courses && <div className="profile-meta">TEACHES: {f.courses}</div>}
                  {f.bio && <p className="profile-bio">{f.bio}</p>}
                  {f.room && <div className="profile-meta">ROOM {f.room}</div>}
                  {(f.email || f.phone) && (
                    <div className="profile-links">
                      {f.email && <a href={`mailto:${f.email}`}>Email</a>}
                      {f.phone && <a href={`tel:${f.phone}`}>Call</a>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
