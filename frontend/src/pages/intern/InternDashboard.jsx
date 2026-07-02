import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../../api/progress';
import { getAttendance, checkIn, checkOut } from '../../api/attendance';
import { listTasks } from '../../api/tasks';
import { useAuthStore } from '../../store/useAuthStore';
import { CheckCircle2, Clock, AlertCircle, Check, TrendingUp, Calendar, Target } from 'lucide-react';

export default function InternDashboard() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkedIn, setCheckedIn] = useState(false);
  const [clockedOutToday, setClockedOutToday] = useState(false);
  const [clockLoading, setClockLoading] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [analyticRes, attendanceRes, tasksRes] = await Promise.all([
        getAnalytics().catch(() => ({ data: null })),
        getAttendance().catch(() => ({ data: { records: [] } })),
        listTasks({ limit: 6 }).catch(() => ({ data: { tasks: [] } })),
      ]);

      setAnalytics(analyticRes.data);

      // getAttendance returns { records: [], total: N }
      const records = attendanceRes.data?.records || attendanceRes.data || [];
      setAttendance(Array.isArray(records) ? records : []);

      setTasks(tasksRes.data?.tasks || []);

      // Check if intern is currently clocked in today or has already clocked out
      const todayStr = new Date().toISOString().split('T')[0];
      const todayRecord = (Array.isArray(records) ? records : []).find(r => r.date === todayStr);
      setCheckedIn(!!(todayRecord && todayRecord.checkIn && !todayRecord.checkOut));
      setClockedOutToday(!!(todayRecord && todayRecord.checkIn && todayRecord.checkOut));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleClockToggle = async () => {
    setClockLoading(true);
    try {
      if (checkedIn) {
        await checkOut();
        setCheckedIn(false);
        setClockedOutToday(true);
      } else {
        await checkIn();
        setCheckedIn(true);
        setClockedOutToday(false);
      }
      const attendanceRes = await getAttendance();
      const records = attendanceRes.data?.records || attendanceRes.data || [];
      setAttendance(Array.isArray(records) ? records : []);
    } catch (err) {
      alert(err.response?.data?.message || 'Clock action failed');
    } finally {
      setClockLoading(false);
    }
  };

  const statusColors = {
    done: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    in_progress: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    review: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    blocked: 'bg-red-500/10 text-red-400 border-red-500/20',
    todo: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  const priorityColors = {
    high: 'text-red-400',
    medium: 'text-yellow-400',
    low: 'text-emerald-400',
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-brand-muted">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {/* Clock In / Out Button */}
        <button
          onClick={handleClockToggle}
          disabled={clockLoading || clockedOutToday}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 ${
            clockedOutToday
              ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30 cursor-not-allowed'
              : checkedIn
              ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
              : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30'
          }`}
        >
          <Clock className="w-4 h-4" />
          {clockLoading ? 'Processing...' : clockedOutToday ? 'Clocked Out' : checkedIn ? 'Clock Out' : 'Clock In'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-[#2e254f]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Completion Rate</p>
            <div className="p-2 bg-violet-500/10 rounded-lg">
              <Target className="w-4 h-4 text-violet-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{analytics?.completionRate ?? 0}%</p>
          <div className="mt-2 h-1.5 bg-[#2e254f] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all"
              style={{ width: `${analytics?.completionRate ?? 0}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-[#2e254f]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Total Tasks</p>
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{analytics?.totalTasks ?? 0}</p>
          <p className="text-xs text-brand-muted mt-1">{analytics?.doneTasks ?? 0} completed</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-[#2e254f]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Overdue</p>
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{analytics?.overdueTasks ?? 0}</p>
          <p className="text-xs text-brand-muted mt-1">tasks past deadline</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-[#2e254f]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Attendance</p>
            <div className={`p-2 rounded-lg ${checkedIn ? 'bg-emerald-500/10' : clockedOutToday ? 'bg-indigo-500/10' : 'bg-slate-500/10'}`}>
              <Calendar className={`w-4 h-4 ${checkedIn ? 'text-emerald-400' : clockedOutToday ? 'text-indigo-400' : 'text-slate-400'}`} />
            </div>
          </div>
          <p className={`text-lg font-bold ${checkedIn ? 'text-emerald-400' : clockedOutToday ? 'text-indigo-400' : 'text-slate-400'}`}>
            {checkedIn ? '✓ Clocked In' : clockedOutToday ? '✓ Clocked Out' : '✗ Not Clocked In'}
          </p>
          <p className="text-xs text-brand-muted mt-1">{attendance.length} logs this period</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-[#2e254f] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Your Assigned Tasks</h3>
            <span className="text-xs text-brand-muted">{tasks.length} tasks</span>
          </div>
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-10 h-10 text-brand-muted mx-auto mb-2 opacity-40" />
                <p className="text-sm text-brand-muted">No tasks assigned to you yet.</p>
              </div>
            ) : (
              tasks.map(t => (
                <div key={t.id} className="p-4 bg-[#0f0a1c] border border-[#2e254f] hover:border-violet-500/30 rounded-xl flex items-center justify-between transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{t.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs font-semibold ${priorityColors[t.priority] || 'text-slate-400'}`}>
                        ● {t.priority}
                      </span>
                      {t.dueDate && (
                        <span className="text-xs text-brand-muted flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {t.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`ml-3 text-xs font-semibold px-2.5 py-1 rounded-full border capitalize whitespace-nowrap ${statusColors[t.status] || statusColors.todo}`}>
                    {t.status.replace(/_/g, ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Attendance Logs */}
        <div className="p-6 rounded-2xl glass-panel border border-[#2e254f] space-y-4">
          <h3 className="text-base font-semibold text-white">Recent Attendance</h3>
          <div className="space-y-2">
            {attendance.slice(0, 6).map(log => (
              <div key={log.id} className="p-3 bg-[#0f0a1c] border border-[#2e254f] rounded-xl text-xs">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-white">{log.date}</p>
                  <span className={`px-2 py-0.5 rounded-full font-bold capitalize ${
                    log.status === 'present' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                  }`}>
                    {log.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-brand-muted">
                  <span>In: <span className="text-slate-300">{log.checkIn || '—'}</span></span>
                  <span>Out: <span className="text-slate-300">{log.checkOut || '—'}</span></span>
                  {log.hoursWorked != null && (
                    <span className="text-violet-400 font-semibold">{log.hoursWorked}h</span>
                  )}
                </div>
              </div>
            ))}
            {attendance.length === 0 && (
              <div className="text-center py-6">
                <p className="text-xs text-brand-muted">No attendance records yet.<br />Use Clock In to start tracking.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
