import React, { useState } from 'react';
import { api } from '../services/api';
import { Lock, CheckCircle, Loader2 } from 'lucide-react';

interface ResetPasswordPageProps {
  token: string;
  onSuccess: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ token, onSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.resetPassword(token, newPassword);
      setCompleted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-50 font-sans">
      <div className="w-full max-w-lg p-8 sm:p-10 space-y-6 bg-white border border-slate-200 rounded-3xl shadow-xl relative z-10">
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-wide">Create New Password</h1>
          <p className="text-xs font-medium text-slate-500 leading-relaxed">Enter a new secure password for your KEYSTONE account.</p>
        </div>

        {completed ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 text-center">
            <CheckCircle className="mx-auto text-emerald-600" size={40} />
            <h3 className="font-bold text-sm text-emerald-800 uppercase tracking-wider">Password Reset Successful!</h3>
            <p className="text-xs text-slate-600 leading-relaxed">Your password has been updated. You can now sign in with your new credentials.</p>
            <button
              onClick={onSuccess}
              className="ks-btn-primary mt-3 text-xs uppercase tracking-wider"
            >
              Proceed to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-center font-medium animate-shake shadow-xs">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="ks-label">New Password</label>
              <div className="ks-input-group">
                <span className="ks-input-icon">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="ks-input"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="ks-label">Confirm New Password</label>
              <div className="ks-input-group">
                <span className="ks-input-icon">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
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
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Save New Password</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
