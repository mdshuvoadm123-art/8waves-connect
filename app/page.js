import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import WaveformHero from "@/components/WaveformHero";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <NavBar />

      <section className="hero">
        <div className="container">
          <div className="eyebrow">Signal is live — class directory online</div>
          <h1>
            Two channels.
            <br />
            One <span className="grad">class frequency.</span>
          </h1>
          <p className="hero-sub">
            8WAVES CONNECT is where our batch stays tuned in — classmate profiles
            in OSTOTORONGO, and the people who taught us in FACULTY. Every
            classmate entry is reviewed by an admin before it goes live, so the
            directory always stays accurate.
          </p>
          <div className="hero-cta">
            <Link href="/ostotorongo" className="btn btn-primary">Enter Ostotorongo</Link>
            <Link href="/faculty" className="btn btn-violet">View Faculty</Link>
          </div>
          <WaveformHero />
        </div>
      </section>

      <section className="section" id="channels">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-label">Tune in</div>
              <h2 className="section-title">Pick a channel</h2>
            </div>
          </div>

          <div className="tuner">
            <div className="channel-card teal">
              <div className="channel-freq">CH. 01 — 8.0 Hz</div>
              <h3>OSTOTORONGO</h3>
              <p>
                The classmate directory. Add your own details any time — an
                admin reviews every new submission and every edit before it
                shows up here, so nobody's profile can be changed without
                approval.
              </p>
              <div className="channel-actions">
                <Link href="/ostotorongo" className="btn btn-ghost btn-sm">Browse classmates</Link>
                <Link href="/ostotorongo/submit" className="btn btn-primary btn-sm">Submit my details</Link>
              </div>
            </div>

            <div className="channel-card violet">
              <div className="channel-freq">CH. 02 — 3.6 Hz</div>
              <h3>FACULTY</h3>
              <p>
                Course teachers and department staff, added and kept up to
                date by the admin only. A quiet, reliable reference for who
                taught what.
              </p>
              <div className="channel-actions">
                <Link href="/faculty" className="btn btn-ghost btn-sm">Browse faculty</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-label">How it works</div>
              <h2 className="section-title">Every entry passes through one admin</h2>
            </div>
          </div>
          <div className="card-grid">
            <div className="profile-card">
              <div className="channel-freq">STEP 01</div>
              <div className="profile-name">Submit</div>
              <p className="profile-bio">
                A classmate fills out the Ostotorongo form with their details —
                first time, or as an update to what's already live.
              </p>
            </div>
            <div className="profile-card">
              <div className="channel-freq">STEP 02</div>
              <div className="profile-name">Review</div>
              <p className="profile-bio">
                The submission lands in the admin queue as "pending." It is
                never shown publicly until it's reviewed.
              </p>
            </div>
            <div className="profile-card">
              <div className="channel-freq">STEP 03</div>
              <div className="profile-name">Go live</div>
              <p className="profile-bio">
                Once approved, the profile (or the update) appears in the
                Ostotorongo directory for everyone to see.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
