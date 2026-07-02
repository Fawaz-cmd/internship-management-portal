import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Mail, Lock, User, Phone, Briefcase, Loader } from 'lucide-react';
import { register as registerApi } from '../../api/auth';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    role: 'intern',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await registerApi(formData);
      if (res.success) {
        // Automatically login or direct to login page
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0c0817] via-[#140e28] to-[#1e133c] p-6">
      <div className="w-full max-w-lg p-8 rounded-2xl border border-[#2e254f] bg-[#18132b]/80 backdrop-blur-md shadow-glass">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-teal-400">
            Create Account
          </h1>
          <p className="text-sm text-brand-muted mt-2">Join the Internship Management Portal</p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-muted uppercase mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Jordan"
                className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-muted uppercase mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Lee"
                className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-muted uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-brand-muted" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="jordan.lee@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-muted uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-brand-muted" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-muted uppercase mb-1">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-brand-muted" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="1234567890"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-muted uppercase mb-1">Department</label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-brand-muted" />
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Engineering"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-muted uppercase mb-1">Select Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-all"
            >
              <option value="intern">Intern</option>
              <option value="mentor">Mentor</option>
              <option value="team_lead">Team Lead</option>
              <option value="hr_coordinator">HR Coordinator</option>
              <option value="reviewer">Reviewer/Evaluator</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-brand-purple to-brand-indigo hover:from-brand-purple hover:to-brand-purple text-sm font-semibold rounded-xl text-white shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-brand-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-teal hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
