import React, { useState } from 'react';

export default function AuthGateway({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form State Vectors
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [county, setCounty] = useState('machakos');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isRegistering) {
      // Mock successful registration by bouncing the user back to login view
      alert("Account created successfully! Please sign in with your credentials.");
      setIsRegistering(false);
    } else {
      // Create a mock authenticated user profile payload to pass to the core app layout
      const mockUserProfile = {
        full_name: fullName || "Farmer",
        phone_number: phone || "0700000000",
        email: email || "farmer@mkulimasmart.co.ke",
        county: county,
        current_active_crop: "Maize"
      };
      onLoginSuccess(mockUserProfile);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans pt-24">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        
        {/* INTERFACE SWITCH TABS */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-emerald-400">
            {isRegistering ? "Create Farmer Profile" : "Access Smart Dashboard"}
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            {isRegistering ? "Register to access regional forecasting metrics" : "Enter your security credentials to access the workspace"}
          </p>
        </div>

        {/* RECURSIVE AUTH FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {isRegistering && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Full Name</label>
                <input 
                  type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., John Kamau"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Phone Number</label>
                <input 
                  type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., 0712345678"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Select County Location</label>
                <select 
                  value={county} onChange={(e) => setCounty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors font-medium"
                >
                  <option value="machakos">Machakos County</option>
                  <option value="kitui">Kitui County</option>
                  <option value="makueni">Makueni County</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@domain.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password Security Pin</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition-colors mt-6 shadow-lg shadow-emerald-500/10"
          >
            {isRegistering ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* FOOTER SWITCH META NAVIGATION */}
        <div className="text-center mt-6 pt-6 border-t border-slate-800/60 text-xs">
          {isRegistering ? (
            <p className="text-slate-400">
              Already have an account?{" "}
              <button onClick={() => setIsRegistering(false)} className="text-emerald-400 font-bold hover:underline">
                Sign In Here
              </button>
            </p>
          ) : (
            <p className="text-slate-400">
              New to Mkulima Smart?{" "}
              <button onClick={() => setIsRegistering(true)} className="text-emerald-400 font-bold hover:underline">
                Register Here
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}