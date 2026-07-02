require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { sequelize, User, Program, InternProfile, Project, ProjectMember, Task, Notification, Meeting } = require('../src/models');

const SALT_ROUNDS = 12;
const DEFAULT_PASSWORD = 'Password@123';

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true }); // Drop & recreate for fresh seed

    console.log('🌱 Seeding database...\n');
    const hash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

    // ── Create Users ────────────────────────────────────────────────────────
    const [admin, manager, hr, mentor, teamLead, intern1, intern2, reviewer] = await User.bulkCreate([
      { email: 'admin@portal.com', passwordHash: hash, role: 'super_admin', firstName: 'Alex', lastName: 'Morgan', department: 'Administration', isVerified: true, isActive: true },
      { email: 'manager@portal.com', passwordHash: hash, role: 'program_manager', firstName: 'Sarah', lastName: 'Chen', department: 'Engineering', isVerified: true, isActive: true },
      { email: 'hr@portal.com', passwordHash: hash, role: 'hr_coordinator', firstName: 'Priya', lastName: 'Sharma', department: 'Human Resources', isVerified: true, isActive: true },
      { email: 'mentor@portal.com', passwordHash: hash, role: 'mentor', firstName: 'David', lastName: 'Kim', department: 'Engineering', bio: 'Senior Software Engineer with 8 years experience.', isVerified: true, isActive: true },
      { email: 'teamlead@portal.com', passwordHash: hash, role: 'team_lead', firstName: 'Maria', lastName: 'Torres', department: 'Product', isVerified: true, isActive: true },
      { email: 'intern1@portal.com', passwordHash: hash, role: 'intern', firstName: 'Jordan', lastName: 'Lee', department: 'Engineering', isVerified: true, isActive: true },
      { email: 'intern2@portal.com', passwordHash: hash, role: 'intern', firstName: 'Aisha', lastName: 'Patel', department: 'Design', isVerified: true, isActive: true },
      { email: 'reviewer@portal.com', passwordHash: hash, role: 'reviewer', firstName: 'Chris', lastName: 'Evans', department: 'Quality', isVerified: true, isActive: true },
    ]);

    console.log('✅ Users created');

    // ── Create Programs ─────────────────────────────────────────────────────
    const [summerProg, winterProg] = await Program.bulkCreate([
      { name: 'Summer Tech Internship 2025', description: 'A 12-week intensive tech internship program.', department: 'Engineering', startDate: '2025-06-01', endDate: '2025-08-31', managerId: manager.id, maxInterns: 20, status: 'active', location: 'Hybrid' },
      { name: 'Winter Data Science Program', description: '8-week data science and ML internship.', department: 'Data', startDate: '2025-12-01', endDate: '2026-01-31', managerId: manager.id, maxInterns: 10, status: 'draft', location: 'Remote' },
    ]);

    console.log('✅ Programs created');

    // ── Create Intern Profiles ──────────────────────────────────────────────
    await InternProfile.bulkCreate([
      { userId: intern1.id, programId: summerProg.id, mentorId: mentor.id, teamLeadId: teamLead.id, cohort: 'Summer 2025', startDate: '2025-06-01', endDate: '2025-08-31', progressPct: 45, skills: JSON.stringify(['JavaScript', 'React', 'Node.js']), university: 'State University', degree: 'B.Sc Computer Science', graduationYear: 2026, status: 'active' },
      { userId: intern2.id, programId: summerProg.id, mentorId: mentor.id, teamLeadId: teamLead.id, cohort: 'Summer 2025', startDate: '2025-06-01', endDate: '2025-08-31', progressPct: 62, skills: JSON.stringify(['Figma', 'CSS', 'UX Research']), university: 'Design Institute', degree: 'B.A Design', graduationYear: 2026, status: 'active' },
    ]);

    console.log('✅ Intern profiles created');

    // ── Create Projects ─────────────────────────────────────────────────────
    const [project1, project2] = await Project.bulkCreate([
      { name: 'E-Commerce Platform Revamp', description: 'Modernize the legacy e-commerce platform with React and microservices.', programId: summerProg.id, createdById: teamLead.id, status: 'active', startDate: '2025-06-15', endDate: '2025-08-15', priority: 'high', tags: JSON.stringify(['react', 'nodejs', 'microservices']), progressPct: 35 },
      { name: 'Design System Creation', description: 'Build a comprehensive design system for the company products.', programId: summerProg.id, createdById: teamLead.id, status: 'active', startDate: '2025-06-20', endDate: '2025-08-20', priority: 'medium', tags: JSON.stringify(['design', 'figma', 'components']), progressPct: 55 },
    ]);

    await ProjectMember.bulkCreate([
      { projectId: project1.id, userId: teamLead.id, role: 'lead' },
      { projectId: project1.id, userId: mentor.id, role: 'lead' },
      { projectId: project1.id, userId: intern1.id, role: 'member' },
      { projectId: project2.id, userId: teamLead.id, role: 'lead' },
      { projectId: project2.id, userId: intern2.id, role: 'member' },
    ]);

    console.log('✅ Projects created');

    // ── Create Tasks ────────────────────────────────────────────────────────
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    await Task.bulkCreate([
      { title: 'Set up React project structure', description: 'Initialize the React project with proper folder structure and dependencies.', projectId: project1.id, assigneeId: intern1.id, assignerId: teamLead.id, priority: 'high', status: 'done', dueDate: today, estimatedHours: 4, actualHours: 3.5, completedAt: new Date(), order: 1 },
      { title: 'Implement authentication flow', description: 'Build login, register, and JWT refresh flow.', projectId: project1.id, assigneeId: intern1.id, assignerId: mentor.id, priority: 'high', status: 'in_progress', dueDate: nextWeek, estimatedHours: 8, order: 2 },
      { title: 'Design product listing page', description: 'Create wireframes and final design for product listing.', projectId: project1.id, assigneeId: intern1.id, assignerId: teamLead.id, priority: 'medium', status: 'todo', dueDate: nextMonth, estimatedHours: 6, order: 3 },
      { title: 'Create color palette documentation', description: 'Document the full design system color palette.', projectId: project2.id, assigneeId: intern2.id, assignerId: teamLead.id, priority: 'medium', status: 'done', dueDate: today, estimatedHours: 3, completedAt: new Date(), order: 1 },
      { title: 'Build button component variants', description: 'Implement all button variants in Figma and export specs.', projectId: project2.id, assigneeId: intern2.id, assignerId: teamLead.id, priority: 'high', status: 'review', dueDate: nextWeek, estimatedHours: 5, order: 2 },
      { title: 'Write API integration tests', description: 'Write unit and integration tests for the authentication APIs.', projectId: project1.id, assigneeId: intern1.id, assignerId: mentor.id, priority: 'low', status: 'todo', dueDate: nextMonth, estimatedHours: 6, order: 4 },
    ]);

    console.log('✅ Tasks created');

    // ── Create Notifications ────────────────────────────────────────────────
    await Notification.bulkCreate([
      { userId: intern1.id, type: 'task_assigned', title: 'New Task Assigned', body: 'You have been assigned: "Implement authentication flow"', isRead: false, actionUrl: '/tasks' },
      { userId: intern1.id, type: 'meeting_scheduled', title: 'Weekly 1:1 Scheduled', body: 'David Kim has scheduled a meeting for tomorrow at 10 AM.', isRead: false, actionUrl: '/meetings' },
      { userId: intern1.id, type: 'announcement', title: 'Welcome to Summer Internship!', body: 'Welcome to the Summer Tech Internship 2025. Check your dashboard for your assignments.', isRead: true, actionUrl: '/dashboard' },
      { userId: intern2.id, type: 'task_assigned', title: 'Task Under Review', body: 'Your task "Build button component variants" is now under review.', isRead: false, actionUrl: '/tasks' },
      { userId: mentor.id, type: 'report_submitted', title: 'Weekly Report Submitted', body: 'Jordan Lee has submitted their weekly report. Please review.', isRead: false, actionUrl: '/progress' },
    ]);

    console.log('✅ Notifications created');

    // ── Create Meetings ─────────────────────────────────────────────────────
    const tomorrow = new Date(Date.now() + 86400000);
    tomorrow.setHours(10, 0, 0, 0);

    await Meeting.bulkCreate([
      { title: 'Weekly 1:1 with Jordan', description: 'Regular check-in meeting', organizerId: mentor.id, attendees: JSON.stringify([intern1.id]), scheduledAt: tomorrow, durationMins: 30, meetingUrl: 'https://meet.example.com/jordan-1on1', type: 'one_on_one', status: 'scheduled' },
      { title: 'Sprint Planning — Sprint 2', description: 'Plan tasks for Sprint 2 of the e-commerce project.', organizerId: teamLead.id, attendees: JSON.stringify([mentor.id, intern1.id, intern2.id]), scheduledAt: new Date(Date.now() + 2 * 86400000), durationMins: 60, type: 'team', status: 'scheduled' },
    ]);

    console.log('✅ Meetings created');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Login credentials (password: Password@123)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Super Admin     : admin@portal.com');
    console.log('  Program Manager : manager@portal.com');
    console.log('  HR Coordinator  : hr@portal.com');
    console.log('  Mentor          : mentor@portal.com');
    console.log('  Team Lead       : teamlead@portal.com');
    console.log('  Intern 1        : intern1@portal.com');
    console.log('  Intern 2        : intern2@portal.com');
    console.log('  Reviewer        : reviewer@portal.com');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
