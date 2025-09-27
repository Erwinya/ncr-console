import React from "react";

function AppBar() {
  return (
    <nav className="app-bar">
      <div className="app-bar-logo">
        {/* Logo ve başlık buraya eklenebilir */}
      </div>
      <div className="app-bar-buttons">
        <button className="app-bar-btn">Anasayfa</button>
        <button className="app-bar-btn">Portföy</button>
        <button className="app-bar-btn">Teknolojiler</button>
        <button className="app-bar-btn">İletişim</button>
        <button className="app-bar-btn">Hakkımda</button>
      </div>
    </nav>
  );
}

export default AppBar;
