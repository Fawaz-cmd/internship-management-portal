import React, { useState, useEffect } from 'react';
import { getWeeklyReports, reviewWeeklyReport } from '../../api/progress';
import { listUsers } from '../../api/users';
import { Users, FileText, CheckCircle2, Star, MessageSquare } from 'lucide-react';

export default function MentorDashboard() {
  const [interns, setInterns] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingReport, setReviewingReport] = useState(null);
  const [reviewNote, setReviewNote] = useState('');

  const loadData = async () => {
    try {
      const [usersRes, reportsRes] = await Promise.all([
        listUsers({ role: 'intern' }),
        getWeeklyReports({ status: 'submitted' })
      ]);
      setInterns(usersRes.data?.users || []);
      setReports(reportsRes.data?.reports || []);
    } catch (err) {
      console.error('Failed to load mentor dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewingReport || !reviewNote) return;
    try {
      await reviewWeeklyReport(reviewingReport.id, { reviewNote });
      setReviewingReport(null);
      setReviewNote('');
      loadData(); // reload
    } catch (err) {
      console.error('Review submit error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-brand-muted">
        Loading mentor dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Mentor Workspace</h1>
        <p className="text-sm text-brand-muted mt-1">Monitor assigned interns and review weekly submissions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interns Directory */}
        <div className="p-6 rounded-2xl glass-panel space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-teal" />
            <h3 className="text-base font-semibold">My Assigned Interns</h3>
          </div>

          <div className="space-y-3">
            {interns.length === 0 ? (
              <p className="text-xs text-brand-muted py-4">No interns assigned.</p>
            ) : (
              interns.map(intern => (
                <div key={intern.id} className="p-4 bg-[#0f0a1c] border border-[#2e254f] rounded-xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-purple flex items-center justify-center font-bold text-xs text-white">
                    {intern.firstName[0]}{intern.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{intern.firstName} {intern.lastName}</p>
                    <p className="text-xs text-brand-muted mt-0.5">{intern.department || 'General'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Weekly Submissions Checklist */}
        <div className="p-6 rounded-2xl glass-panel space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-purple" />
            <h3 className="text-base font-semibold">Weekly Reports Awaiting Review</h3>
          </div>

          <div className="space-y-3">
            {reports.length === 0 ? (
              <p className="text-xs text-brand-muted py-8 text-center">No reports awaiting review.</p>
            ) : (
              reports.map(report => (
                <div key={report.id} className="p-4 bg-[#0f0a1c] border border-[#2e254f] hover:border-brand-purple rounded-xl flex flex-col md:flex-row justify-between gap-4 transition-all">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">
                      {report.user ? `${report.user.firstName} ${report.user.lastName}` : 'Intern'}
                    </p>
                    <p className="text-xs text-brand-muted">Week starting: {report.weekStart}</p>
                    <p className="text-xs text-brand-text/80 line-clamp-2 mt-2">{report.accomplishments}</p>
                  </div>
                  <div className="flex flex-col md:items-end justify-between">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-yellow-400" />
                      <span className="text-xs font-semibold">{report.selfRating}/5 self rating</span>
                    </div>
                    <button
                      onClick={() => setReviewingReport(report)}
                      className="mt-2 text-xs font-semibold px-4 py-2 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-lg transition-all"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewingReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg bg-[#18132b] border border-[#2e254f] rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-[#2e254f]">
              <h3 className="text-lg font-semibold text-white">Review Weekly Report</h3>
              <button 
                onClick={() => setReviewingReport(null)}
                className="text-brand-muted hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-semibold text-brand-teal uppercase">Report Details</p>
              <div className="p-3 bg-[#0f0a1c] border border-[#2e254f] rounded-xl space-y-2 text-brand-text/90">
                <p><strong>Accomplishments:</strong> {reviewingReport.accomplishments}</p>
                <p><strong>Goals for Next Week:</strong> {reviewingReport.goals}</p>
                <p><strong>Challenges:</strong> {reviewingReport.challenges}</p>
              </div>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase mb-2">
                  Mentor Review Feedback
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Enter constructive feedback, approvals, and guidance notes here..."
                  className="w-full p-3 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingReport(null)}
                  className="px-4 py-2 border border-[#2e254f] text-brand-muted hover:text-white rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-teal text-brand-dark hover:bg-brand-teal/80 rounded-xl text-xs font-semibold transition-all"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
