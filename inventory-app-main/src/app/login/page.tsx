'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  // Live clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setDate(now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-bg-shape shape-1" />
        <div className="login-bg-shape shape-2" />
        <div className="login-bg-shape shape-3" />
      </div>

      {/* Floating inventory items */}
      <div className="login-scene">
        <div className="float-box box-1">📦</div>
        <div className="float-box box-2">🏭</div>
        <div className="float-box box-3">📋</div>
        <div className="float-box box-4">🔧</div>
        <div className="float-box box-5">📊</div>
        <div className="float-box box-6">🚚</div>
      </div>

      <div className="login-container">
        {/* Left side — animated branding */}
        <div className="login-brand-side">
          <div className="login-brand-content">
            <div className="login-brand-logo">
              <span className="login-logo-text">IP</span>
            </div>
            <h1 className="login-brand-title">InventoryPro</h1>
            <p className="login-brand-tagline">
              Your complete inventory command center — manage procurement, sales, and manufacturing from one place.
            </p>

            {/* Live stats ticker */}
            <div className="login-stats-ticker">
              <div className="login-stat-item">
                <span className="login-stat-num">10+</span>
                <span className="login-stat-label">Products</span>
              </div>
              <div className="login-stat-divider" />
              <div className="login-stat-item">
                <span className="login-stat-num">7+</span>
                <span className="login-stat-label">Orders</span>
              </div>
              <div className="login-stat-divider" />
              <div className="login-stat-item">
                <span className="login-stat-num">₹6.3L</span>
                <span className="login-stat-label">Value</span>
              </div>
            </div>

            {/* Live clock */}
            <div className="login-clock">
              <div className="login-clock-time">{time}</div>
              <div className="login-clock-date">{date}</div>
            </div>
          </div>
        </div>

        {/* Right side — login form */}
        <div className="login-form-side">
          <form className="login-form" onSubmit={handleSubmit} suppressHydrationWarning>
            <div className="login-form-header">
              <h2 className="login-form-title">Welcome back</h2>
              <p className="login-form-subtitle">
                Sign in to access your inventory dashboard
              </p>
            </div>

            {error && (
              <div className="login-error" id="login-error">
                <Lock size={14} />
                {error}
              </div>
            )}

            <div className="login-field">
              <label className="login-label" htmlFor="username">
                Username
              </label>
              <div className="login-input-wrapper">
                <User size={16} className="login-input-icon" />
                <input
                  id="username"
                  type="text"
                  className="login-input"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="password">
                Password
              </label>
              <div className="login-input-wrapper">
                <Lock size={16} className="login-input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
              id="btn-login"
            >
              {loading ? (
                <span className="login-spinner" />
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="login-hint">
              <Lock size={12} />
              <span>
                Default credentials: <strong>admin</strong> / <strong>admin123</strong>
              </span>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom credit */}
      <div className="login-footer">
        Built for SME Inventory Management
      </div>
    </div>
  );
}
