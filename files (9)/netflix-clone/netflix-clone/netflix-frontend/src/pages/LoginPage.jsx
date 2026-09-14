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
  const [successMessage, setSuccessMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Helper: get locally registered users from localStorage
  const getLocalUsers = () => {
    try {
      return JSON.parse(localStorage.getItem('netflix_local_users') || '[]');
    } catch { return []; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (mode === 'login' ? !validateLogin() : !validateRegister()) return;
    setLoading(true);

    // Simulate a small delay for UX
    await new Promise(r => setTimeout(r, 600));

    // Always use relative /api path — Vite proxy forwards to localhost:5000
    const BASE_URL = import.meta.env.VITE_API_URL || '';

    try {
      if (mode === 'register') {
        const cleanEmail = email.trim().toLowerCase();
        const localUsers = getLocalUsers();
        const existingIndex = localUsers.findIndex(
          (u) => u.email.toLowerCase() === cleanEmail
        );

        let userObj;

        // Always try backend first for register
        try {
          const response = await fetch(`${BASE_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), password, name: name.trim() }),
          });
          const data = await response.json().catch(() => ({}));
          if (response.ok && data.success) {
            userObj = data.user || {
              id: Date.now(),
              email: email.trim(),
              name: name.trim() || email.split('@')[0],
            };
          }
        } catch (_) { /* backend offline – fall through to localStorage */ }

        // Always save to localStorage (login fallback needs this,
        // since Vercel serverless functions don't share memory)
        const localUsers2 = getLocalUsers();
        const existingIdx2 = localUsers2.findIndex(u => u.email.toLowerCase() === (userObj?.email || email.trim()).toLowerCase());
        const localSaveObj = { id: userObj?.id || Date.now(), email: email.trim(), name: (userObj?.name || name.trim() || email.split('@')[0]), password };
        if (existingIdx2 >= 0) {
          localUsers2[existingIdx2] = { ...localUsers2[existingIdx2], ...localSaveObj };
        } else {
          localUsers2.push(localSaveObj);
        }
        localStorage.setItem('netflix_local_users', JSON.stringify(localUsers2));
        if (!userObj) userObj = localSaveObj;

        // ✅ Account created — redirect to Sign In (NOT dashboard)
        // Pre-fill email so user can sign in easily
        setEmail(userObj.email);
        setPassword('');
        setConfirmPassword('');
        setName('');
        setMode('login');
        setSuccessMessage(`Account created! Welcome, ${userObj.name}. Please sign in to continue.`);
        return;
      }

      // LOGIN MODE
      const cleanEmail = email.trim().toLowerCase();

      // 1. Always try backend first — request will always appear in Network tab
      try {
        const response = await fetch(`${BASE_URL}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password }),
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.success) {
          if (rememberMe) {
            localStorage.setItem('netflix_remembered_email', cleanEmail);
            localStorage.setItem('netflix_remember_me', 'true');
          } else {
            localStorage.removeItem('netflix_remembered_email');
            localStorage.setItem('netflix_remember_me', 'false');
          }
          onLoginSuccess(data.user || { email: cleanEmail, name: cleanEmail.split('@')[0] }, rememberMe);
          return;
        } else if (data && data.message) {
          // Only stop here for 'wrong password' — user exists but pw is wrong
          // For 'user not found' (401), fall through to localStorage check below
          const isWrongPassword =
            response.status === 401 &&
            data.message.toLowerCase().includes('incorrect');
          if (isWrongPassword) {
            setServerError(data.message);
            return;
          }
          // else: user not found in backend → check localStorage next
        }
      } catch (_) { /* backend not reachable – fallback to localStorage */ }

      // 2. Fallback check locally registered users in localStorage
      const localUsers = getLocalUsers();
      const localUser = localUsers.find(
        (u) => u.email.toLowerCase() === cleanEmail
      );

      if (!localUser) {
        setServerError('New user, please sign up first');
        return;
      }

      if (localUser.password !== password) {
        setServerError('Login failed: Incorrect password.');
        return;
      }

      if (rememberMe) {
        localStorage.setItem('netflix_remembered_email', localUser.email);
        localStorage.setItem('netflix_remember_me', 'true');
      } else {
        localStorage.removeItem('netflix_remembered_email');
        localStorage.setItem('netflix_remember_me', 'false');
      }
      onLoginSuccess({ id: localUser.id, email: localUser.email, name: localUser.name }, rememberMe);
      return;
    } catch (error) {
      console.error('Auth error:', error);
      setServerError('Login failed: Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setErrors({});
    setServerError('');
    setSuccessMessage('');
    setShowPassword(false);
    setShowConfirmPassword(false);
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
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (errors.password) setFieldError('password', ''); }}
                className={`${inputBase} pr-11 ${errors.password ? inputError : ''}`}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 text-white/60 hover:text-white transition-colors cursor-pointer p-1 focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span className="text-[#ff7e7e] text-xs">{errors.password}</span>}
          </div>

          {/* Confirm Password (register only) */}
          {mode === 'register' && (
            <div className="flex flex-col gap-1.5">
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setFieldError('confirmPassword', ''); }}
                  className={`${inputBase} pr-11 ${errors.confirmPassword ? inputError : ''}`}
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3.5 text-white/60 hover:text-white transition-colors cursor-pointer p-1 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-[#ff7e7e] text-xs">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          {/* ✅ Success message (shown after register → redirected to sign in) */}
          {successMessage && (
            <div className="flex items-start gap-2 bg-green-500/15 border border-green-400/50 rounded px-3 py-2.5 text-sm text-[#86efac]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="shrink-0 mt-0.5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* Server error */}
          {serverError && (
            <div className="flex flex-col gap-1.5 bg-red-500/15 border border-red-400/50 rounded px-3 py-2.5 text-sm">
              <div className="flex items-center gap-2 text-[#ff9a9a]">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="shrink-0">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{serverError}</span>
              </div>
              {mode === 'login' && serverError.toLowerCase().includes('sign up') && (
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-xs text-white/90 underline hover:text-white text-left pl-7 cursor-pointer"
                >
                  Click here to Sign Up first →
                </button>
              )}
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
