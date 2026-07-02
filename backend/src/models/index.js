const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const AuditLog = require('./AuditLog');
const Program = require('./Program');
const InternProfile = require('./InternProfile');
const Project = require('./Project');
const ProjectMember = require('./ProjectMember');
const Sprint = require('./Sprint');
const Deliverable = require('./Deliverable');
const Milestone = require('./Milestone');
const Task = require('./Task');
const TaskAttachment = require('./TaskAttachment');
const TaskComment = require('./TaskComment');
const DailyUpdate = require('./DailyUpdate');
const WeeklyReport = require('./WeeklyReport');
const SkillAssessment = require('./SkillAssessment');
const Attendance = require('./Attendance');
const Notification = require('./Notification');
const Meeting = require('./Meeting');
const Feedback = require('./Feedback');

// ── User Associations ─────────────────────────────────────────────────────────
User.hasOne(InternProfile, { foreignKey: 'userId', as: 'internProfile' });
InternProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });
InternProfile.belongsTo(User, { foreignKey: 'mentorId', as: 'mentor' });
InternProfile.belongsTo(User, { foreignKey: 'teamLeadId', as: 'teamLead' });
InternProfile.belongsTo(Program, { foreignKey: 'programId', as: 'program' });

User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ── Program Associations ──────────────────────────────────────────────────────
Program.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });
Program.hasMany(InternProfile, { foreignKey: 'programId', as: 'interns' });
Program.hasMany(Project, { foreignKey: 'programId', as: 'projects' });

// ── Project Associations ──────────────────────────────────────────────────────
Project.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });
Project.belongsTo(Program, { foreignKey: 'programId', as: 'program' });
Project.hasMany(ProjectMember, { foreignKey: 'projectId', as: 'members' });
Project.hasMany(Sprint, { foreignKey: 'projectId', as: 'sprints' });
Project.hasMany(Milestone, { foreignKey: 'projectId', as: 'milestones' });
Project.hasMany(Deliverable, { foreignKey: 'projectId', as: 'deliverables' });
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });

ProjectMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ProjectMember.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

Sprint.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Sprint.hasMany(Task, { foreignKey: 'sprintId', as: 'tasks' });
Sprint.hasMany(Deliverable, { foreignKey: 'sprintId', as: 'deliverables' });

Deliverable.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Deliverable.belongsTo(Sprint, { foreignKey: 'sprintId', as: 'sprint' });
Deliverable.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });

Milestone.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// ── Task Associations ─────────────────────────────────────────────────────────
Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });
Task.belongsTo(User, { foreignKey: 'assignerId', as: 'assigner' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Task.belongsTo(Sprint, { foreignKey: 'sprintId', as: 'sprint' });
Task.belongsTo(Milestone, { foreignKey: 'milestoneId', as: 'milestone' });
Task.belongsTo(Task, { foreignKey: 'parentTaskId', as: 'parentTask' });
Task.hasMany(Task, { foreignKey: 'parentTaskId', as: 'subtasks' });
Task.hasMany(TaskAttachment, { foreignKey: 'taskId', as: 'attachments' });
Task.hasMany(TaskComment, { foreignKey: 'taskId', as: 'comments' });

TaskAttachment.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
TaskAttachment.belongsTo(User, { foreignKey: 'uploadedById', as: 'uploadedBy' });

TaskComment.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
TaskComment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ── Progress Associations ─────────────────────────────────────────────────────
DailyUpdate.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(DailyUpdate, { foreignKey: 'userId', as: 'dailyUpdates' });

WeeklyReport.belongsTo(User, { foreignKey: 'userId', as: 'user' });
WeeklyReport.belongsTo(User, { foreignKey: 'reviewerId', as: 'reviewer' });
User.hasMany(WeeklyReport, { foreignKey: 'userId', as: 'weeklyReports' });

SkillAssessment.belongsTo(User, { foreignKey: 'internId', as: 'intern' });
SkillAssessment.belongsTo(User, { foreignKey: 'assessorId', as: 'assessor' });

Attendance.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Attendance, { foreignKey: 'userId', as: 'attendanceRecords' });

// ── Notification Associations ─────────────────────────────────────────────────
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

// ── Meeting Associations ──────────────────────────────────────────────────────
Meeting.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });
User.hasMany(Meeting, { foreignKey: 'organizerId', as: 'organizedMeetings' });

// ── Feedback Associations ─────────────────────────────────────────────────────
Feedback.belongsTo(User, { foreignKey: 'internId', as: 'intern' });
Feedback.belongsTo(User, { foreignKey: 'reviewerId', as: 'reviewer' });
User.hasMany(Feedback, { foreignKey: 'internId', as: 'feedbackReceived' });

module.exports = {
  sequelize,
  User,
  AuditLog,
  Program,
  InternProfile,
  Project,
  ProjectMember,
  Sprint,
  Deliverable,
  Milestone,
  Task,
  TaskAttachment,
  TaskComment,
  DailyUpdate,
  WeeklyReport,
  SkillAssessment,
  Attendance,
  Notification,
  Meeting,
  Feedback,
};
