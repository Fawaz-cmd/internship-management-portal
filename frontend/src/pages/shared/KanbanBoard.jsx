import React, { useState, useEffect } from 'react';
import { getKanban, updateTask, createTask, getTask } from '../../api/tasks';
import { listProjects } from '../../api/projects';
import { useAuthStore } from '../../store/useAuthStore';
import { ArrowLeft, ArrowRight, Plus, Calendar, AlertCircle } from 'lucide-react';

export default function KanbanBoard() {
  const { user } = useAuthStore();
  const [columns, setColumns] = useState({
    todo: [],
    in_progress: [],
    review: [],
    done: [],
    blocked: []
  });
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    projectId: '',
    priority: 'medium',
    dueDate: ''
  });

  const loadBoard = async () => {
    try {
      const params = {};
      if (selectedProject) params.projectId = selectedProject;
      const res = await getKanban(params);
      if (res.success) {
        setColumns(res.data);
      }
    } catch (err) {
      console.error('Failed to load Kanban board:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await listProjects();
        setProjects(res.data || []);
        if (res.data?.length > 0) {
          setSelectedProject(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    loadBoard();
  }, [selectedProject]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      loadBoard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.projectId) return;
    try {
      await createTask(newTask);
      setShowAddForm(false);
      setNewTask({
        title: '',
        description: '',
        projectId: selectedProject,
        priority: 'medium',
        dueDate: ''
      });
      loadBoard();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const cols = [
    { id: 'todo', title: 'To Do', color: 'border-t-brand-muted bg-brand-muted/5' },
    { id: 'in_progress', title: 'In Progress', color: 'border-t-brand-indigo bg-brand-indigo/5' },
    { id: 'review', title: 'Under Review', color: 'border-t-yellow-500 bg-yellow-500/5' },
    { id: 'done', title: 'Completed', color: 'border-t-brand-emerald bg-brand-emerald/5' },
    { id: 'blocked', title: 'Blocked', color: 'border-t-red-500 bg-red-500/5' },
  ];

  if (loading) {
    return <div className="text-center py-12 text-brand-muted">Loading workspace board...</div>;
  }

  const isManagement = ['super_admin', 'program_manager', 'team_lead', 'mentor'].includes(user.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Kanban Workspace</h1>
          <p className="text-sm text-brand-muted mt-1">Manage project tasks and track status logs.</p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-4 py-2.5 bg-[#18132b] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-all"
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {isManagement && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-xl text-sm font-semibold transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          )}
        </div>
      </div>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {cols.map(col => {
          const tasksList = columns[col.id] || [];
          return (
            <div key={col.id} className={`flex flex-col rounded-2xl border-t-4 border border-[#2e254f] p-4 min-h-[500px] ${col.color}`}>
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-sm text-white">{col.title}</span>
                <span className="text-xs bg-[#2e254f] text-brand-muted px-2 py-0.5 rounded-full font-bold">
                  {tasksList.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                {tasksList.map(task => (
                  <div key={task.id} className="p-4 bg-[#18132b] border border-[#2e254f] hover:border-brand-purple rounded-xl space-y-3 transition-all relative group">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white group-hover:text-brand-teal transition-colors">
                        {task.title}
                      </p>
                      <p className="text-xs text-brand-muted line-clamp-2">{task.description}</p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-[#2e254f] text-[10px] text-brand-muted">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{task.dueDate || 'No due date'}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-bold capitalize ${
                        task.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                        task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-brand-teal/10 text-brand-teal'
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Simple controls to transition task status */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        disabled={col.id === 'todo'}
                        onClick={() => {
                          const statusOrder = ['todo', 'in_progress', 'review', 'done', 'blocked'];
                          const idx = statusOrder.indexOf(col.id);
                          if (idx > 0) handleStatusChange(task.id, statusOrder[idx - 1]);
                        }}
                        className="p-1 hover:bg-white/5 rounded text-brand-muted hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      
                      <button
                        onClick={() => handleStatusChange(task.id, 'blocked')}
                        className="text-[10px] text-red-400/80 hover:text-red-400 hover:underline"
                      >
                        Block
                      </button>

                      <button
                        disabled={col.id === 'done'}
                        onClick={() => {
                          const statusOrder = ['todo', 'in_progress', 'review', 'done'];
                          const idx = statusOrder.indexOf(col.id);
                          if (idx !== -1 && idx < statusOrder.length - 1) {
                            handleStatusChange(task.id, statusOrder[idx + 1]);
                          }
                        }}
                        className="p-1 hover:bg-white/5 rounded text-brand-muted hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

                {tasksList.length === 0 && (
                  <div className="text-center py-8 text-xs text-brand-muted">Column empty</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-[#18132b] border border-[#2e254f] rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-[#2e254f]">
              <h3 className="text-lg font-semibold text-white">Create New Task</h3>
              <button onClick={() => setShowAddForm(false)} className="text-brand-muted hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Design color palette..."
                  className="w-full px-4 py-2 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Details of the task assignment..."
                  className="w-full px-4 py-2 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase mb-1">Assign to Project</label>
                <select
                  required
                  value={newTask.projectId}
                  onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-all"
                >
                  <option value="">Select Project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0f0a1c] border border-[#2e254f] focus:border-brand-purple rounded-xl text-sm focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-[#2e254f] text-brand-muted hover:text-white rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-xl text-xs font-semibold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
