"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function OstotorongoPage() {
  const [students, setStudents] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((data) => setStudents(data.students || []))
      .catch(() => setError("Couldn't load the directory. Try refreshing."));
  }, []);

  return (
    <>
      <NavBar />
      <section className="hero" style={{ paddingBottom: 24 }}>
        <div className="container">
          <div className="eyebrow">Channel 01 — 8.0 Hz</div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)" }}>
            OSTOTORONGO <span className="grad">directory</span>
          </h1>
          <p className="hero-sub">
            Every approved classmate profile, all in one place. Don't see
            yourself yet, or need to fix something?
          </p>
          <div className="hero-cta">
            <Link href="/ostotorongo/submit" className="btn btn-primary">Submit / update my details</Link>
          </div>

          <div className="class-photo-frame">
            <img src="/class-photo.jpg" alt="Our class, NAOE-08" className="class-photo" />
          </div>
        </div>
      </section>

      <section className="section" style={{ borderTop: "none" }}>
        <div className="container">
          {error && <div className="empty-state">{error}</div>}

          {!error && students === null && (
            <div className="empty-state">Tuning in… loading classmates.</div>
          )}

          {!error && students && students.length === 0 && (
            <div className="empty-state">
              No approved profiles yet. Be the first — head to{" "}
              <Link href="/ostotorongo/submit" style={{ color: "var(--wave-teal)" }}>
                submit your details
              </Link>
              .
            </div>
          )}

          {!error && students && students.length > 0 && (
            <div className="card-grid">
              {students.map((s) => (
                <div className="profile-card" key={s._id}>
                  <div className="avatar">
                    {s.photoUrl ? (
                      <img
                        src={s.photoUrl}
                        alt={s.name}
                        style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                      />
                    ) : (
                      initials(s.name)
                    )}
                  </div>
                  <div>
                    <div className="profile-name">{s.name}</div>
                    <div className="profile-meta">
                      {[s.rollNumber, s.session].filter(Boolean).join(" · ") || "—"}
                    </div>
                    {s.bloodGroup && (
                      <div className="profile-meta" style={{ marginTop: 4 }}>
                        BLOOD GROUP: {s.bloodGroup}
                      </div>
                    )}
                  </div>
                  {s.bio && <p className="profile-bio">{s.bio}</p>}
                  {s.hometown && <div className="profile-meta">FROM {s.hometown.toUpperCase()}</div>}
                  {s.phone && <div className="profile-meta">PHONE: {s.phone}</div>}
                  {(s.email || s.phone || s.socialLink) && (
                    <div className="profile-links">
                      {s.email && <a href={`mailto:${s.email}`}>Email</a>}
                      {s.phone && <a href={`tel:${s.phone}`}>Call</a>}
                      {s.socialLink && (
                        <a href={s.socialLink} target="_blank" rel="noreferrer">
                          Profile
                        </a>
                      )}
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
