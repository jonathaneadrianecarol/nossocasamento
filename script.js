/* styles.css */
:root {
  --primary-color: #D4AF37; /* Gold */
  --secondary-color: #fdfbf7; /* Cream */
  --text-color: #4a4a4a;
  --heading-color: #2c2c2c;
  --white: #ffffff;
  --transition: all 0.3s ease;
  --font-heading: "Playfair Display", serif;
  --font-body: "Lato", sans-serif;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  font-family: var(--font-body);
  color: var(--text-color);
  line-height: 1.6;
  background-color: var(--secondary-color);
}

/* Typography */
h1,h2,h3,h4,h5,h6 {
  font-family: var(--font-heading);
  color: var(--heading-color);
  margin-bottom: 1rem;
}

a { text-decoration: none; color: inherit; transition: var(--transition); }
ul { list-style: none; }

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Buttons */
.btn {
  display: inline-block;
  padding: 1rem 2.5rem;
  border: 1px solid transparent;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 1rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: var(--transition);
  background: transparent;
}

.btn-primary {
  background-color: var(--primary-color);
  color: var(--white);
  border-color: var(--primary-color);
}

.btn-primary:hover {
  background-color: transparent;
  color: var(--primary-color);
}

.btn-block { display: block; width: 100%; }

/* Navbar */
.navbar {
  position: fixed;
  top: 0; left: 0;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 1.5rem 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  transition: var(--transition);
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.logo {
  font-family: var(--font-heading);
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--heading-color);
  letter-spacing: 2px;
}

.nav-links { display: flex; gap: 2rem; }

.nav-links a {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 400;
}

.nav-links a:hover { color: var(--primary-color); }

.hamburger {
  display: none;
  cursor: pointer;
  border: 0;
  background: transparent;
  padding: 0.25rem;
}

/* Hero Section (video background) */
.hero {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  color: var(--white);
  overflow: hidden;
}

.hero-video{
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.01); /* evita borda branca em alguns devices */
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
}

.hero-content {
  position: relative;
  z-index: 1;
  padding: 2rem;
  animation: fadeInUp 1.5s ease-out;
}

.pre-title {
  font-size: 1.2rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 1rem;
  font-weight: 300;
}

.main-title {
  font-size: 5rem;
  margin-bottom: 1rem;
  font-weight: 400;
  line-height: 1.1;
}

.date {
  font-size: 1.5rem;
  margin-bottom: 2.5rem;
  font-weight: 300;
  font-family: var(--font-heading);
  font-style: italic;
}

/* Sections General */
.section { padding: 6rem 0; }

.section-title {
  text-align: center;
  font-size: 3rem;
  margin-bottom: 3rem;
  position: relative;
  padding-bottom: 1rem;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: 0; left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 2px;
  background-color: var(--primary-color);
}

/* Story Section */
.story { background-color: var(--white); text-align: center; }

.story-text {
  max-width: 800px;
  margin: 0 auto;
  font-size: 1.1rem;
  color: #666;
}

.story-text p { margin-bottom: 1.5rem; }

/* Details Section */
.details { background-color: var(--secondary-color); }

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  text-align: center;
}

.detail-card {
  background: var(--white);
  padding: 3rem 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  transition: var(--transition);
}

.detail-card:hover { transform: translateY(-10px); }

.detail-icon {
  color: var(--primary-color);
  width: 48px;
  height: 48px;
  margin-bottom: 1.5rem;
}

.detail-card h3 { font-size: 1.5rem; margin-bottom: 1rem; }
.detail-card p { color: #666; margin-bottom: 0.5rem; }

/* Quote Section */
.quote-section {
  background-color: var(--primary-color);
  color: var(--white);
  text-align: center;
  padding: 4rem 0;
}

blockquote {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-style: italic;
  max-width: 900px;
  margin: 0 auto;
}

blockquote footer {
  font-family: var(--font-body);
  font-size: 1rem;
  margin-top: 1.5rem;
  font-style: normal;
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* RSVP Section */
.rsvp { background-color: var(--white); text-align: center; }

.rsvp-text { margin-bottom: 3rem; font-size: 1.2rem; }

.rsvp-form {
  max-width: 600px;
  margin: 0 auto;
  text-align: left;
}

.form-group { margin-bottom: 1.5rem; }

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #ddd;
  font-family: var(--font-body);
  font-size: 1rem;
  transition: var(--transition);
  background-color: #fcfcfc;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  background-color: var(--white);
}

/* Footer */
.footer {
  background-color: #222;
  color: #aaa;
  text-align: center;
  padding: 3rem 0;
  font-size: 0.9rem;
}

.footer p { margin-bottom: 0.5rem; }

/* Animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 768px) {
  .main-title { font-size: 3.5rem; }
  .nav-links { display: none; }
  .hamburger { display: block; }
  .section { padding: 4rem 0; }
}
