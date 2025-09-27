
import React from "react";

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-bg-effect"></div>
      <div className="hero-content">
        <h1 className="hero-title">Haluk Kılınçer<br /><span className="highlight">Yazılım Geliştirici</span></h1>
        <p className="hero-desc">Modern, ölçeklenebilir ve güvenilir yazılım çözümleri sunuyorum. Dijital projelerinizi birlikte hayata geçirelim.</p>
        <div className="hero-buttons">
          <a href="#iletisim" className="hero-btn primary">İletişime Geç</a>
          <a href="#portfoy" className="hero-btn secondary">Portföyü Gör</a>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
