css = """
/* === HERO ANIMATIONS === */
@keyframes heroVisualBob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.hero-visual svg { animation: heroVisualBob 6s ease-in-out infinite; }

@keyframes waveDrift {
  0%, 100% { transform: translateX(0) scaleX(1); }
  50% { transform: translateX(-15px) scaleX(1.02); }
}
@keyframes waveDriftReverse {
  0%, 100% { transform: translateX(0) scaleX(1); }
  50% { transform: translateX(15px) scaleX(1.03); }
}
.hero-wave-1 { animation: waveDrift 8s ease-in-out infinite; transform-origin: center; }
.hero-wave-2 { animation: waveDriftReverse 10s ease-in-out infinite; animation-delay: -2s; }
.hero-wave-3 { animation: waveDrift 12s ease-in-out infinite; animation-delay: -4s; }
.hero-wave-4 { animation: waveDriftReverse 14s ease-in-out infinite; animation-delay: -6s; }

@keyframes seagullFloat {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(12px, -8px) rotate(2deg); }
  66% { transform: translate(-5px, 5px) rotate(-1deg); }
}
.seagull-float-1 { animation: seagullFloat 6s ease-in-out infinite; transform-origin: center; }
.seagull-float-2 { animation: seagullFloat 8s ease-in-out infinite; animation-delay: -2s; }

@keyframes sunPulse {
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50% { opacity: 0.25; transform: scale(1.05); }
}
.sun-pulse { animation: sunPulse 6s ease-in-out infinite; transform-origin: center; }


/* === SIGNATURE BUTTERFLY SHRIMP === */
.menu-featured {
  background: linear-gradient(135deg, var(--ink) 0%, var(--ink-soft) 100%);
  color: var(--cream);
  padding: 60px;
  margin: 70px 0;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(176, 135, 68, 0.4);
}
.menu-featured::before {
  content: '';
  position: absolute;
  top: -80px; right: -80px;
  width: 260px; height: 260px;
  background: radial-gradient(circle, rgba(212, 165, 90, 0.25) 0%, transparent 70%);
  pointer-events: none;
  animation: radialShift 14s ease-in-out infinite;
}
.menu-featured::after {
  content: '';
  position: absolute;
  bottom: -100px; left: -80px;
  width: 220px; height: 220px;
  background: radial-gradient(circle, rgba(196, 90, 58, 0.15) 0%, transparent 70%);
  pointer-events: none;
  animation: radialShift 18s ease-in-out infinite reverse;
}
.menu-featured-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 2;
}
.featured-tag {
  font-size: 10px;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--brass-light);
  font-weight: 700;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.featured-tag::before {
  content: ''; width: 30px; height: 1px; background: var(--brass-light);
}
.menu-featured h3 {
  font-family: var(--f-display);
  font-size: clamp(40px, 5.5vw, 72px);
  line-height: 0.98;
  margin-bottom: 20px;
  font-weight: 400;
  letter-spacing: -0.02em;
  font-variation-settings: 'SOFT' 40, 'opsz' 72;
}
.menu-featured h3 em { font-style: italic; color: var(--brass-light); }
.menu-featured p {
  font-size: 16px;
  color: rgba(244, 236, 224, 0.8);
  line-height: 1.8;
  max-width: 500px;
}
.menu-featured-visual {
  aspect-ratio: 1;
  max-width: 320px;
  margin: 0 auto;
}
.menu-featured-visual svg { width: 100%; height: 100%; }

@keyframes radialShift {
  0%, 100% { transform: scale(1) translate(0, 0); }
  33% { transform: scale(1.1) translate(20px, -15px); }
  66% { transform: scale(0.95) translate(-15px, 20px); }
}

@media (max-width: 992px) {
  .menu-featured-grid { grid-template-columns: 1fr; gap: 32px; }
  .menu-featured { padding: 40px 28px; }
}
"""

with open('styles.css', 'a', encoding='utf-8') as f:
    f.write(css)

print('Cleanly appended manual CSS.')
