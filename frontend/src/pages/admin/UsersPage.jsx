import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Edit2, 
  UserX, 
  UserCheck,
  X,
  Loader,
  Mail,
  User as UserIcon,
  Shield,
  Briefcase,
  Bookmark,
  Calendar,
  GraduationCap
} from 'lucide-react';
import { listUsers, createUser, updateUser, deactivateUser } from '../../api/users';
import client from '../../api/client';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'intern',
    phone: '',
    department: '',
    bio: '',
    // Intern profile fields
    programId: '',
    mentorId: '',
    teamLeadId: '',
    cohort: '',
    startDate: '',
    endDate: '',
    university: '',
    degree: '',
    graduationYear: ''
  });

  // Reference data for dropdowns
  const [programs, setPrograms] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [teamLeads, setTeamLeads] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsersList = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await listUsers(params);
      if (res.success) {
        setUsers(res.data.users);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      // Fetch programs
      const progRes = await client.get('/programs');
      if (progRes.data?.success) setPrograms(progRes.data.data);

      // Fetch mentors
      const mentorRes = await listUsers({ role: 'mentor', limit: 100 });
      if (mentorRes.success) setMentors(mentorRes.data.users);

      // Fetch team leads
      const leadRes = await listUsers({ role: 'team_lead', limit: 100 });
      if (leadRes.success) setTeamLeads(leadRes.data.users);
    } catch (err) {
      console.error('Error fetching dropdown references:', err);
    }
  };

  useEffect(() => {
    fetchUsersList();
  }, [page, roleFilter]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsersList();
  };

  const handleCreateOpen = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'intern',
      phone: '',
      department: '',
      bio: '',
      programId: '',
      mentorId: '',
      teamLeadId: '',
      cohort: '',
      startDate: '',
      endDate: '',
      university: '',
      degree: '',
      graduationYear: ''
    });
    setErrorMsg('');
    setSuccessMsg('');
    setShowCreateModal(true);
  };

  const handleEditOpen = (user) => {
    setSelectedUser(user);
    const profile = user.internProfile || {};
    setFormData({
      email: user.email,
      password: '', // Leave blank unless changing
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone || '',
      department: user.department || '',
      bio: user.bio || '',
      programId: profile.programId || '',
      mentorId: profile.mentorId || '',
      teamLeadId: profile.teamLeadId || '',
      cohort: profile.cohort || '',
      startDate: profile.startDate || '',
      endDate: profile.endDate || '',
      university: profile.university || '',
      degree: profile.degree || '',
      graduationYear: profile.graduationYear || ''
    });
    setErrorMsg('');
    setSuccessMsg('');
    setShowEditModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await createUser(formData);
      if (res.success) {
        setSuccessMsg('User created successfully!');
        setTimeout(() => {
          setShowCreateModal(false);
          fetchUsersList();
        }, 1500);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create user. Verify parameters.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      // Remove password if empty
      const payload = { ...formData };
      if (!payload.password) delete payload.password;

      const res = await updateUser(selectedUser.id, payload);
      if (res.success) {
        setSuccessMsg('User updated successfully!');
        setTimeout(() => {
          setShowEditModal(false);
          fetchUsersList();
        }, 1500);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (user) => {
    if (!window.confirm(`Are you sure you want to deactivate ${user.firstName} ${user.lastName}?`)) return;
    try {
      const res = await deactivateUser(user.id);
      if (res.success) {
        fetchUsersList();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Deactivation failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-brand-purple" />
            User Directory
          </h1>
          <p className="text-sm text-brand-muted mt-1">Manage and assign roles for admins, mentors, and interns.</p>
        </div>
        <button
          onClick={handleCreateOpen}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-purple to-brand-indigo hover:opacity-90 rounded-xl text-sm font-semibold shadow-lg transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl border border-[#2e254f] bg-[#140e28]/50 backdrop-blur-sm">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-brand-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email..."
              className="w-full pl-11 pr-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-brand-purple/20 hover:bg-brand-purple/30 border border-brand-purple/40 text-brand-purple hover:text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-3 w-4 h-4 text-brand-muted" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors appearance-none cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="program_manager">Program Manager</option>
              <option value="hr_coordinator">HR Coordinator</option>
              <option value="mentor">Mentor</option>
              <option value="team_lead">Team Lead</option>
              <option value="intern">Intern</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-8 h-8 animate-spin text-brand-purple" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#2e254f] rounded-2xl">
          <p className="text-brand-muted text-sm">No users found matching requirements.</p>
        </div>
      ) : (
        <div className="border border-[#2e254f] rounded-2xl overflow-hidden bg-[#140e28]/30 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2e254f] bg-[#0f0a1c]/60 text-xs font-semibold text-brand-muted uppercase tracking-wider">
                  <th className="p-4">Name</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Intern Assignment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2e254f]/50">
                {users.map((u) => {
                  const hasProfile = u.role === 'intern' && u.internProfile;
                  return (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors text-sm text-slate-300">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-purple to-brand-indigo flex items-center justify-center font-bold text-white uppercase">
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{u.firstName} {u.lastName}</p>
                            <p className="text-xs text-brand-muted">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          u.role === 'super_admin' ? 'bg-red-500/20 text-red-400' :
                          u.role === 'program_manager' ? 'bg-orange-500/20 text-orange-400' :
                          u.role === 'mentor' ? 'bg-teal-500/20 text-teal-400' :
                          u.role === 'intern' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-brand-muted">
                        {u.department || 'N/A'}
                      </td>
                      <td className="p-4">
                        {hasProfile ? (
                          <div className="space-y-1 text-xs">
                            <p className="text-white">
                              Mentor: <span className="text-brand-teal">
                                {u.internProfile.mentor ? `${u.internProfile.mentor.firstName} ${u.internProfile.mentor.lastName}` : 'Unassigned'}
                              </span>
                            </p>
                            {u.internProfile.program && (
                              <p className="text-brand-muted">
                                Program: <span className="text-indigo-400">{u.internProfile.program.name}</span>
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-brand-muted">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${u.isActive ? 'text-green-400' : 'text-red-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditOpen(u)}
                            title="Edit User"
                            className="p-1.5 hover:bg-white/5 text-brand-muted hover:text-white rounded-lg transition-colors border border-transparent hover:border-[#2e254f]"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {u.isActive && (
                            <button
                              onClick={() => handleToggleActive(u)}
                              title="Deactivate User"
                              className="p-1.5 hover:bg-red-500/10 text-brand-muted hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex justify-between items-center p-4 bg-[#0f0a1c]/40 border-t border-[#2e254f]/50">
            <span className="text-xs text-brand-muted">Total: {total} users</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 bg-white/5 border border-[#2e254f] hover:bg-white/10 rounded-lg text-xs disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                disabled={users.length < 10}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-white/5 border border-[#2e254f] hover:bg-white/10 rounded-lg text-xs disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#140e28] border border-[#2e254f] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-[#2e254f] flex justify-between items-center bg-[#0f0a1c]/60">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-purple" />
                Add New User Profile
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-brand-muted hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded-lg">
                  {successMsg}
                </div>
              )}

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Defaults to Password@123"
                    className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="program_manager">Program Manager</option>
                    <option value="hr_coordinator">HR Coordinator</option>
                    <option value="mentor">Mentor</option>
                    <option value="team_lead">Team Lead</option>
                    <option value="intern">Intern</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Engineering, QA, Design..."
                    className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Bio & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Bio / Notes</label>
                  <input
                    type="text"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Intern Specific Fields */}
              {formData.role === 'intern' && (
                <div className="border-t border-[#2e254f] pt-6 space-y-6">
                  <h3 className="text-sm font-bold text-brand-purple flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Internship Profile & Mentorship Assignment
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Program Batch</label>
                      <select
                        value={formData.programId}
                        onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="">Unassigned</option>
                        {programs.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Assigned Mentor</label>
                      <select
                        value={formData.mentorId}
                        onChange={(e) => setFormData({ ...formData, mentorId: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="">Unassigned</option>
                        {mentors.map(m => (
                          <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Team Lead</label>
                      <select
                        value={formData.teamLeadId}
                        onChange={(e) => setFormData({ ...formData, teamLeadId: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="">Unassigned</option>
                        {teamLeads.map(t => (
                          <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Cohort</label>
                      <input
                        type="text"
                        value={formData.cohort}
                        onChange={(e) => setFormData({ ...formData, cohort: e.target.value })}
                        placeholder="Summer 2025"
                        className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Start Date</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">End Date</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">University</label>
                      <input
                        type="text"
                        value={formData.university}
                        onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                        placeholder="Harvard University"
                        className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Degree</label>
                      <input
                        type="text"
                        value={formData.degree}
                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        placeholder="Bachelor in CS"
                        className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Graduation Year</label>
                      <input
                        type="number"
                        value={formData.graduationYear}
                        onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                        placeholder="2026"
                        className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-[#2e254f] flex justify-end gap-3 bg-[#0f0a1c]/40 -mx-6 -mb-6 p-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-[#2e254f] hover:bg-white/5 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-gradient-to-r from-brand-purple to-brand-indigo hover:opacity-90 rounded-xl text-sm font-semibold flex items-center gap-2 transition-opacity"
                >
                  {formLoading && <Loader className="w-4 h-4 animate-spin" />}
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#140e28] border border-[#2e254f] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-[#2e254f] flex justify-between items-center bg-[#0f0a1c]/60">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-brand-purple" />
                Edit User Profile & Assignments
              </h2>
              <button onClick={() => setShowEditModal(false)} className="text-brand-muted hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded-lg">
                  {successMsg}
                </div>
              )}

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full px-4 py-2.5 bg-[#0f0a1c]/60 border border-[#2e254f] rounded-xl text-sm text-brand-muted cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">New Password (optional)</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Leave empty to keep current password"
                    className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="program_manager">Program Manager</option>
                    <option value="hr_coordinator">HR Coordinator</option>
                    <option value="mentor">Mentor</option>
                    <option value="team_lead">Team Lead</option>
                    <option value="intern">Intern</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Bio & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Bio / Notes</label>
                  <input
                    type="text"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Intern Specific Fields */}
              {formData.role === 'intern' && (
                <div className="border-t border-[#2e254f] pt-6 space-y-6">
                  <h3 className="text-sm font-bold text-brand-purple flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Internship Profile & Mentorship Assignment
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Program Batch</label>
                      <select
                        value={formData.programId}
                        onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="">Unassigned</option>
                        {programs.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Assigned Mentor</label>
                      <select
                        value={formData.mentorId}
                        onChange={(e) => setFormData({ ...formData, mentorId: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="">Unassigned</option>
                        {mentors.map(m => (
                          <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Team Lead</label>
                      <select
                        value={formData.teamLeadId}
                        onChange={(e) => setFormData({ ...formData, teamLeadId: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="">Unassigned</option>
                        {teamLeads.map(t => (
                          <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Cohort</label>
                      <input
                        type="text"
                        value={formData.cohort}
                        onChange={(e) => setFormData({ ...formData, cohort: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Start Date</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">End Date</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">University</label>
                      <input
                        type="text"
                        value={formData.university}
                        onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Degree</label>
                      <input
                        type="text"
                        value={formData.degree}
                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Graduation Year</label>
                      <input
                        type="number"
                        value={formData.graduationYear}
                        onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-[#2e254f] flex justify-end gap-3 bg-[#0f0a1c]/40 -mx-6 -mb-6 p-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-[#2e254f] hover:bg-white/5 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-gradient-to-r from-brand-purple to-brand-indigo hover:opacity-90 rounded-xl text-sm font-semibold flex items-center gap-2 transition-opacity"
                >
                  {formLoading && <Loader className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
