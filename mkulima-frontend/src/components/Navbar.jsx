import React from 'react';

export default function Navbar({ onNavigate, currentPage }) {
  // Smooth scroll handler for landing page anchors
  const handleScroll = (elementId) => {
    if (currentPage !== 'landing') {
      onNavigate('landing');
      // Timeout allows the DOM to render the landing page before scrolling
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(elementId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-900 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* BRAND LOGO */}
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onNavigate('landing')}
        >
          <span className="text-xl font-black tracking-wider text-emerald-400">MKULIMA<span className="text-slate-100">SMART</span></span>
        </div>

        {/* MARKETING NAVIGATION LINKS */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <button onClick={() => handleScroll('features')} className="hover:text-emerald-400 transition-colors">Features</button>
          <button onClick={() => handleScroll('how-it-works')} className="hover:text-emerald-400 transition-colors">How It Works</button>
          <button onClick={() => handleScroll('team')} className="hover:text-emerald-400 transition-colors">Our Team</button>
          <button onClick={() => handleScroll('partners')} className="hover:text-emerald-400 transition-colors">Partners</button>
        </div>

        {/* APP ACTION BUTTON */}
        <div>
          {currentPage === 'dashboard' ? (
            <button 
              onClick={() => onNavigate('landing')}
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            >
              Sign Out
            </button>
          ) : (
            <button 
              onClick={() => onNavigate('auth')}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all"
            >
              Go to App
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}