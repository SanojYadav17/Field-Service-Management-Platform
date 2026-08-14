import React, { useState } from 'react';
import { api } from '../services/api';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

interface ForgotPasswordPageProps {
  onBack: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to process request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-50 font-sans">
      <div className="w-full max-w-lg p-8 sm:p-10 space-y-6 bg-white border border-slate-200 rounded-3xl shadow-xl relative z-10">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Sign In
        </button>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-wide">Reset Your Password</h1>
          <p className="text-xs font-medium text-slate-500 leading-relaxed">
            Enter your registered email address and we will dispatch a secure reset link to your inbox.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 text-center">
            <CheckCircle className="mx-auto text-emerald-600" size={36} />
            <h3 className="font-bold text-sm text-emerald-800 uppercase tracking-wider">Email Dispatched!</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an account registered to <strong className="text-slate-900 font-mono">{email}</strong> exists, a password reset link has been sent.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-center font-medium animate-shake shadow-xs">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="ks-label">Registered Email Address</label>
              <div className="ks-input-group">
                <span className="ks-input-icon">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  placeholder="admin@meridian.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="ks-input"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="ks-btn-primary w-full mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Dispatching Mail...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
