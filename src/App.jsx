import { useMemo, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import logo from "./assets/logo.png";
import Admin from "./pages/Admin";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

function HomePage() {
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    childName: "",
    childAge: "",
    preferredDate: "",
    preferredTime: "",
    service: "",
    message: "",
  });

  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage("");

    if (
      !formData.name ||
      !formData.phone ||
      !formData.email ||
      !formData.childName ||
      !formData.childAge ||
      !formData.service ||
      !formData.preferredDate
    ) {
      setStatusMessage(
        "Please fill parent name, phone, email, child name, child age, preferred date and service."
      );
      return;
    }

    if (formData.preferredDate < today) {
      setStatusMessage("Past date cannot be selected.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data?.success) {
        setStatusMessage("✅ Appointment submitted! We’ll contact you soon.");

        setFormData({
          name: "",
          phone: "",
          email: "",
          childName: "",
          childAge: "",
          preferredDate: "",
          preferredTime: "",
          service: "",
          message: "",
        });
      } else {
        setStatusMessage(data?.message || "Something went wrong.");
      }
    } catch {
      setStatusMessage("Server connection error.");
    } finally {
      setLoading(false);
    }
  };

  const services = useMemo(
    () => [
      { title: "Speech Therapy", desc: "Communication, language, and confidence building." },
      { title: "Occupational Therapy", desc: "Motor, sensory processing, and daily living skills." },
      { title: "Behaviour Therapy", desc: "Routines, emotional regulation, and positive behaviour." },
      { title: "Special Education Support", desc: "Personalised learning strategies for every child." },
      { title: "Developmental Assessment", desc: "Identify strengths, needs, and next steps clearly." },
      { title: "Parent Guidance", desc: "Home routines, progress tracking, and parent coaching." },
    ],
    []
  );

  const therapists = useMemo(
    () => [
      { name: "Senior Speech Therapist", role: "Speech & Language" },
      { name: "Occupational Therapist", role: "Sensory & Motor Skills" },
      { name: "Behaviour Specialist", role: "ABA / Behaviour Support" },
      { name: "Special Educator", role: "Learning & Development" },
    ],
    []
  );

  const testimonials = useMemo(
    () => [
      {
        name: "Parent of 5-year-old",
        text: "We saw a big change in communication within weeks. The team is very supportive and explains everything clearly.",
        rating: 5,
      },
      {
        name: "Parent of 7-year-old",
        text: "Therapy plans are structured and the environment is very child-friendly. Highly recommended.",
        rating: 5,
      },
      {
        name: "Parent of 4-year-old",
        text: "The progress tracking and guidance helped us a lot at home. Staff is caring and professional.",
        rating: 5,
      },
    ],
    []
  );

  const faqs = useMemo(
    () => [
      {
        q: "How do I book an appointment?",
        a: "Fill the appointment form below. Our team will call you to confirm time & therapy plan.",
      },
      {
        q: "Do you offer personalised therapy plans?",
        a: "Yes. After assessment, we create a personalised plan based on your child’s needs and goals.",
      },
      {
        q: "How many sessions are usually needed?",
        a: "It depends on the child’s goals. We review progress regularly and guide you accordingly.",
      },
      {
        q: "Do you guide parents for home practice?",
        a: "Yes. Parent guidance is a key part of our approach for faster, consistent progress.",
      },
    ],
    []
  );

  const [faqOpen, setFaqOpen] = useState(0);

  const StarRow = ({ count = 5 }) => (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ opacity: i < count ? 1 : 0.25 }}>
          ⭐
        </span>
      ))}
    </div>
  );

  return (
    <>
      <header className="topbar">
        <div className="container nav">
          <div className="brand">
            <img src={logo} alt="Magic Minds Logo" className="brand-logo" />
            <div>
              <h2>MAGIC MINDS</h2>
              <p>Child Development & Rehabilitation Centre</p>
            </div>
          </div>

          <div className="nav-actions">
            <a href="#contact" className="btn btn-light">
              Book Appointment
            </a>
            <Link to="/admin" className="btn btn-secondary">
              Admin
            </Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-text">
            <span className="tag">Empowering Children, Enriching Futures</span>
            <h1>
              Helping Every Child Grow with <span>Care, Therapy & Support</span>
            </h1>
            <p>
              Magic Minds provides personalised, evidence-informed therapies in a warm, child-friendly environment—designed
              for progress, confidence, and long-term development.
            </p>

            <div className="hero-buttons">
              <a href="#contact" className="btn btn-primary">
                Get a Free Call
              </a>
              <a href="#services" className="btn btn-secondary">
                Explore Services
              </a>
            </div>

            <div className="hero-stats">
              <div className="stat-card">
                <h3>500+</h3>
                <p>Families Supported</p>
              </div>
              <div className="stat-card">
                <h3>10+</h3>
                <p>Expert Therapists</p>
              </div>
              <div className="stat-card">
                <h3>4.9/5</h3>
                <p>Parent Ratings</p>
              </div>
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span className="section-tag">✅ Child-first Approach</span>
              <span className="section-tag">🧠 Evidence-informed Therapy</span>
              <span className="section-tag">📈 Progress Tracking</span>
            </div>
          </div>

          <div className="hero-image-card">
            <img src={logo} alt="Magic Minds" className="hero-logo" />
            <div style={{ marginTop: 14, textAlign: "center" }}>
              <StarRow count={5} />
              <p style={{ marginTop: 6, color: "var(--muted)" }}>
                Trusted by parents for therapy & development support
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="services" id="services">
        <div className="container">
          <div className="section-head">
            <span className="section-tag">Our Services</span>
            <h2>Therapies & Development Support</h2>
            <p>Structured, compassionate, and professional support tailored to every child’s journey.</p>
          </div>

          <div className="services-grid">
            {services.map((s) => (
              <div className="service-card" key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="why-us">
        <div className="container why-grid">
          <div className="why-card">
            <span className="section-tag">How We Work</span>
            <h2 style={{ marginTop: 12 }}>A Clear 3-Step Support Plan</h2>
            <p>We keep everything simple and transparent so parents always know what’s happening and why.</p>
            <ul>
              <li>
                <b>Assessment:</b> Understand needs, strengths & goals.
              </li>
              <li>
                <b>Therapy Plan:</b> Personalised sessions + home guidance.
              </li>
              <li>
                <b>Progress:</b> Track improvements and adjust plan.
              </li>
            </ul>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
              <a href="#contact" className="btn btn-primary">
                Book Consultation
              </a>
              <a href="#faq" className="btn btn-secondary">
                Read FAQ
              </a>
            </div>
          </div>

          <div className="why-highlight">
            <div className="mini-box">
              <h3>Child-Friendly Space</h3>
              <p>A positive, safe environment where children feel comfortable and encouraged.</p>
            </div>
            <div className="mini-box">
              <h3>Holistic Approach</h3>
              <p>Therapy, learning, behaviour, and family support—together.</p>
            </div>
            <div className="mini-box">
              <h3>Trusted Care</h3>
              <p>Compassion, consistency, and long-term development focus.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="services" id="team" style={{ background: "var(--bg)" }}>
        <div className="container">
          <div className="section-head">
            <span className="section-tag">Our Team</span>
            <h2>Experienced Therapists & Educators</h2>
            <p>Certified professionals working together for your child’s progress.</p>
          </div>

          <div className="services-grid">
            {therapists.map((t) => (
              <div className="service-card" key={t.name}>
                <h3 style={{ marginBottom: 6 }}>{t.name}</h3>
                <p style={{ marginBottom: 12 }}>{t.role}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="section-tag">✅ Certified</span>
                  <span className="section-tag">📌 Personalised Plan</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="services" id="testimonials" style={{ background: "#fff" }}>
        <div className="container">
          <div className="section-head">
            <span className="section-tag">Testimonials</span>
            <h2>What Parents Say</h2>
            <p>Real experiences from families who trusted Magic Minds.</p>
          </div>

          <div className="services-grid">
            {testimonials.map((r, idx) => (
              <div className="service-card" key={idx}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <h3 style={{ fontSize: 16 }}>{r.name}</h3>
                  <StarRow count={r.rating} />
                </div>
                <p style={{ marginTop: 12, fontSize: 14.5, lineHeight: 1.75 }}>“{r.text}”</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="why-us" id="faq">
        <div className="container">
          <div className="section-head" style={{ marginBottom: 18 }}>
            <span className="section-tag">FAQ</span>
            <h2>Common Questions</h2>
            <p>Quick answers before you book your first session.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, maxWidth: 900, margin: "0 auto" }}>
            {faqs.map((f, idx) => {
              const open = faqOpen === idx;
              return (
                <div
                  key={f.q}
                  className="why-card"
                  style={{ padding: 18, borderRadius: 18, cursor: "pointer" }}
                  onClick={() => setFaqOpen(open ? -1 : idx)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}>
                    <h3 style={{ fontSize: 16, color: "var(--blue)", lineHeight: 1.35 }}>{f.q}</h3>
                    <span style={{ fontWeight: 900, fontSize: 18 }}>{open ? "–" : "+"}</span>
                  </div>

                  {open && (
                    <p style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.75 }}>
                      {f.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="contact" id="contact">
        <div className="container contact-box">
          <div className="contact-text">
            <span className="section-tag">Contact Us</span>
            <h2>Book an Appointment</h2>
            <p>
              Fill your details. Our team will connect with you to confirm timings and the right therapy plan.
            </p>

            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              <div
                className="mini-box"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)" }}
              >
                <h3 style={{ color: "#fff", marginBottom: 6, fontSize: 18 }}>Fast Response</h3>
                <p style={{ color: "rgba(255,255,255,0.88)" }}>
                  We usually call back within a short time during working hours.
                </p>
              </div>
              <div
                className="mini-box"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)" }}
              >
                <h3 style={{ color: "#fff", marginBottom: 6, fontSize: 18 }}>Personalised Support</h3>
                <p style={{ color: "rgba(255,255,255,0.88)" }}>
                  Every child is different—our plan is made for your child’s goals.
                </p>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Parent / Guardian Name *"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number *"
              value={formData.phone}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\D/g, "");
                setFormData((prev) => ({ ...prev, phone: onlyDigits }));
              }}
              inputMode="numeric"
              maxLength={15}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address *"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="childName"
              placeholder="Child Name *"
              value={formData.childName}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="childAge"
              placeholder="Child Age *"
              value={formData.childAge}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\D/g, "");
                setFormData((prev) => ({ ...prev, childAge: onlyDigits }));
              }}
              inputMode="numeric"
              maxLength={2}
              required
            />

            <input
              type="date"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
              min={today}
              required
            />

            <input
              type="time"
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleChange}
            />

            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              className="admin-select"
              required
            >
              <option value="">Select Service *</option>
              <option value="Speech Therapy">Speech Therapy</option>
              <option value="Occupational Therapy">Occupational Therapy</option>
              <option value="Behaviour Therapy">Behaviour Therapy</option>
              <option value="Special Education Support">Special Education Support</option>
              <option value="Developmental Assessment">Developmental Assessment</option>
              <option value="Parent Guidance">Parent Guidance</option>
            </select>

            <textarea
              name="message"
              placeholder="Tell us about your child’s needs (optional)"
              value={formData.message}
              onChange={handleChange}
            />

            <button type="submit" className="btn btn-primary full-btn">
              {loading ? "Submitting..." : "Submit"}
            </button>

            {statusMessage && <p className="form-status">{statusMessage}</p>}
          </form>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <h3>MAGIC MINDS</h3>
            <p>Child Development & Rehabilitation Centre</p>
            <p className="footer-line">Empowering Children, Enriching Futures</p>
            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a className="btn btn-secondary" href="#services">
                Services
              </a>
              <a className="btn btn-secondary" href="#team">
                Team
              </a>
              <a className="btn btn-secondary" href="#faq">
                FAQ
              </a>
            </div>
          </div>

          <div>
            <h4>Services</h4>
            <p>Speech Therapy</p>
            <p>Occupational Therapy</p>
            <p>Behaviour Therapy</p>
            <p>Special Education</p>
          </div>

          <div>
            <h4>Contact</h4>
            <p>Phone: +91 XXXXX XXXXX</p>
            <p>Email: info@magicminds.com</p>
            <p>Address: Your Clinic Address Here</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Magic Minds. All rights reserved.</p>
          <p>Developed by{" "}
    <a href="https://www.linkedin.com/in/abhishek-gupta-ak08tn30" target="_blank">
      Abhishek Gupta
       </a>
       </p>
        </div>
        </footer>
    

      <a
        href="https://wa.me/91XXXXXXXXXX"
        target="_blank"
        rel="noreferrer"
        className="btn btn-primary"
        style={{
          position: "fixed",
          right: 18,
          bottom: 18,
          zIndex: 999,
          boxShadow: "0 18px 55px rgba(15, 23, 42, 0.18)",
        }}
      >
        💬 WhatsApp
      </a>
    </>
  );
}

function App() {
  return (
    <div className="website">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App;