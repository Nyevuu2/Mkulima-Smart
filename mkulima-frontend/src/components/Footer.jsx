import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-8 px-6 text-center text-sm text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© {new Date().getFullYear()} Mkulima Smart. Optimized for smallholder frameworks.</p>
        <p className="text-xs text-slate-600">Serving agricultural intelligence in Machakos, Kitui, and Makueni Counties.</p>
      </div>
    </footer>
  );
}