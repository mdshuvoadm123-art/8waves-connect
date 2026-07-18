"use client";
import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/materials")
      .then((r) => r.json())
      .then((data) => setMaterials(data.materials || []))
      .catch(() => setError("Couldn't load materials. Try refreshing."));
  }, []);

  return (
    <>
      <NavBar />
      <section className="hero" style={{ paddingBottom: 24 }}>
        <div className="container">
          <div className="eyebrow">Channel 03 — Materials</div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)" }}>
            Study <span className="grad">materials</span>
          </h1>
          <p className="hero-sub">
            Pick a folder below — it opens straight in Google Drive.
          </p>
        </div>
      </section>

      <section className="section" style={{ borderTop: "none" }}>
        <div className="container">
          {error && <div className="empty-state">{error}</div>}
          {!error && materials === null && <div className="empty-state">Loading…</div>}
          {!error && materials && materials.length === 0 && (
            <div className="empty-state">No material folders added yet.</div>
          )}
          {!error && materials && materials.length > 0 && (
            <div className="tuner" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
              {materials.map((m) => (
                <a
                  key={m._id}
                  href={m.driveLink}
                  target="_blank"
                  rel="noreferrer"
                  className="channel-card teal"
                  style={{ display: "block", textDecoration: "none" }}
                >
                  <div className="channel-freq">DRIVE FOLDER</div>
                  <h3>{m.name}</h3>
                  <div className="channel-actions">
                    <span className="btn btn-ghost btn-sm">Open in Drive</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
