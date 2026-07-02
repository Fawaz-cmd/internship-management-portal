import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import {
  LayoutDashboard,
  CheckSquare,
  BarChart2,
  Users,
  Calendar,
  Folder,
  Settings,
  Clock,
  Shield,
  MessageSquare
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuthStore();
  if (!user) return null;

  const role = user.role;

  const getNavItems = () => {
    const items = [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['*'] },
      { to: '/kanban', label: 'Kanban Board', icon: CheckSquare, roles: ['intern', 'team_lead', 'mentor', 'program_manager'] },
      { to: '/projects', label: 'Projects', icon: Folder, roles: ['intern', 'team_lead', 'mentor', 'program_manager'] },
      { to: '/meetings', label: 'Meetings', icon: Calendar, roles: ['intern', 'mentor', 'team_lead', 'program_manager'] },
    ];

    if (role === 'intern') {
      items.push(
        { to: '/progress', label: 'Daily Activity', icon: BarChart2, roles: ['intern'] },
        { to: '/attendance', label: 'Attendance', icon: Clock, roles: ['intern'] }
      );
    }

    if (['super_admin', 'hr_coordinator', 'program_manager'].includes(role)) {
      items.push(
        { to: '/users', label: 'User Directory', icon: Users, roles: ['*'] }
      );
    }

    if (['super_admin', 'hr_coordinator'].includes(role)) {
      items.push(
        { to: '/audit-logs', label: 'System Logs', icon: Shield, roles: ['*'] }
      );
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-[#140e28] border-r border-[#2e254f] flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-[#2e254f]">
        <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-teal-400">
          InternPortal
        </h1>
        <p className="text-xs text-brand-muted capitalize mt-1">{role.replace('_', ' ')} Space</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
              ${isActive
                ? 'bg-gradient-to-r from-[#6d28d9]/30 to-[#4f46e5]/10 text-white border-l-4 border-brand-purple'
                : 'text-brand-muted hover:text-white hover:bg-white/5'}
            `}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[#2e254f] bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-purple to-brand-teal flex items-center justify-center font-semibold text-sm text-white">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-brand-muted truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
