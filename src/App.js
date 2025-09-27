import React from "react";
import './App.css';
import AppBar from './components/AppBar';
import HeroSection from './components/HeroSection';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <AppBar />
      <HeroSection />
      <Footer />
    </div>
  );
}

export default App;
