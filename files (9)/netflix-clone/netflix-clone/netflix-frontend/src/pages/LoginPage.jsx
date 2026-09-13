// pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';

const LoginPage = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Load remembered email and preference on initial mount
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('netflix_remembered_email');
      const savedRemember = localStorage.getItem('netflix_remember_me');
      if (savedEmail) {
        setEmail(savedEmail);
      }
      if (savedRemember !== null) {
        setRememberMe(savedRemember === 'true');
      }
    } catch (err) {
      console.error('Error loading rememberMe from localStorage:', err);
    }
  }, []);

  const setFieldError = (field, value) => {
    setErrors((prev) => ({ ...prev, [field]: value }));
  };

  const validateLogin = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (mode === 'login' ? !validateLogin() : !validateRegister()) return;
    setLoading(true);
    try {
      const endpoint = mode === 'login'
        ? 'http://localhost:5000/api/login'
        : 'http://localhost:5000/api/register';
      const payload = mode === 'login'
        ? { email, password }
        : { name, email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setServerError(data.message || 'Authentication failed. Please try again.');
        return;
      }
      if (rememberMe) {
        localStorage.setItem('netflix_remembered_email', email);
        localStorage.setItem('netflix_remember_me', 'true');
      } else {
        localStorage.removeItem('netflix_remembered_email');
        localStorage.setItem('netflix_remember_me', 'false');
      }
      onLoginSuccess(data.user ? data.user : data, rememberMe);
    } catch (error) {
      setServerError('Unable to connect to server. Please try again later.');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setErrors({});
    setServerError('');
  };

  const inputBase =
    'w-full bg-white/8 border border-white/14 rounded text-white text-base px-3.5 py-4 outline-none placeholder:text-white/70 transition-all duration-200 focus:border-white/40 focus:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]';
  const inputError = 'border-red-400/75';

  return (
    /* Full-screen container with background */
    <div className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden bg-black">

      {/* Background overlay + cinematic image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 scale-105"
          style={{
            backgroundImage: "url('/login.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-black/60 bg-gradient-to-t from-black via-black/40 to-black/75" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full border-b border-white/20">
        <div className="max-w-[1200px] px-6 flex items-center justify-between py-5 mx-auto">
          <a href="#" aria-label="Netflix home" className="inline-block w-[148px] h-[40px]">
            <img src="/logo.png" alt="Netflix" className="w-full h-full object-contain" />
          </a>
          <nav className="flex items-center gap-4">
            <button
              type="button"
              className="border border-white/55 bg-black/35 text-white text-sm font-semibold px-4 py-2 rounded cursor-pointer hover:brightness-115 transition"
            >
              English <span className="ml-2 text-xs" aria-hidden="true">▾</span>
            </button>
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="bg-[#e50914] text-white text-sm font-semibold px-4 py-2 rounded cursor-pointer hover:brightness-110 transition"
            >
              Sign In
            </button>
          </nav>
        </div>
      </header>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[420px] mx-4 bg-black/56 rounded-lg px-8 py-7 shadow-[0_10px_30px_rgba(0,0,0,0.4)] my-8 mb-24">
        <h1 className="text-white text-3xl font-bold text-center mb-4">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Name field (register only) */}
          {mode === 'register' && (
            <div className="flex flex-col gap-1.5">
              <input
                type="text"
                name="name"
                placeholder="Full name"
                value={name}
                onChange={(e) => { setName(e.target.value); if (errors.name) setFieldError('name', ''); }}
                className={`${inputBase} ${errors.name ? inputError : ''}`}
              />
              {errors.name && <span className="text-[#ff7e7e] text-xs">{errors.name}</span>}
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <input
              type="email"
              name="email"
              placeholder="Email or phone number"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (errors.email) setFieldError('email', ''); }}
              className={`${inputBase} ${errors.email ? inputError : ''}`}
            />
            {errors.email && <span className="text-[#ff7e7e] text-xs">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (errors.password) setFieldError('password', ''); }}
              className={`${inputBase} ${errors.password ? inputError : ''}`}
            />
            {errors.password && <span className="text-[#ff7e7e] text-xs">{errors.password}</span>}
          </div>

          {/* Confirm Password (register only) */}
          {mode === 'register' && (
            <div className="flex flex-col gap-1.5">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setFieldError('confirmPassword', ''); }}
                className={`${inputBase} ${errors.confirmPassword ? inputError : ''}`}
              />
              {errors.confirmPassword && (
                <span className="text-[#ff7e7e] text-xs">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          {/* Server error */}
          {serverError && (
            <div className="flex items-center gap-2 bg-red-500/12 border border-red-400/50 rounded px-3 py-2.5 text-[#ff9a9a] text-sm">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="shrink-0">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {serverError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-[#e50914] text-white font-bold text-base py-4 rounded cursor-pointer transition hover:brightness-110 hover:-translate-y-px disabled:opacity-70 disabled:cursor-wait"
          >
            {loading
              ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
              : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Remember me / Need help */}
        <div className="flex items-center justify-between mt-3.5 text-sm text-white/80">
          <label htmlFor="remember" className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded bg-white/20 border-white/40 accent-[#e50914] cursor-pointer"
            />
            Remember me
          </label>
          <a href="#" className="text-white/75 hover:underline no-underline">Need help?</a>
        </div>

        {/* Sign up / Sign in toggle */}
        <div className="mt-4 text-center text-white/70 text-[0.95rem]">
          <p>
            {mode === 'login' ? 'New to Netflix?' : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="border-none bg-transparent text-white font-bold cursor-pointer p-0 text-[0.95rem] hover:underline"
            >
              {mode === 'login' ? 'Sign up now' : 'Sign in'}
            </button>
          </p>
          <p className="mt-3 text-[0.72rem] text-white/50">
            This page is protected by Google reCAPTCHA
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full bg-[#181818] mt-auto pt-16 pb-14">
        <div className="max-w-[1018px] mx-auto px-6 text-white/70">
          <p className="text-[0.96rem] mb-6 text-[#b3b3b3]">
            Questions? Call 000-800-919-1743 (Toll-Free)
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              ['FAQ', 'Cookie Preferences'],
              ['Help Centre', 'Corporate Information'],
              ['Terms of Use'],
              ['Privacy'],
            ].map((col, i) => (
              <div key={i} className="flex flex-col gap-4">
                {col.map((link) => (
                  <a key={link} href="#" className="text-[#b3b3b3] text-[0.86rem] hover:underline no-underline">
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-2.5 border border-[#737373] rounded px-3 py-1.5 text-[#e6e6e6] bg-[#181818] text-sm">
            <span className="text-[0.9rem]">文A</span>
            <span>English</span>
            <span className="ml-2 text-xs">▾</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
