const { Op } = require('sequelize');
const { Project, ProjectMember, Sprint, Deliverable, Milestone, Task, User, Program } = require('../models');
const { createError } = require('../middleware/errorHandler');

// GET /api/projects
const listProjects = async (req, res, next) => {
  try {
    const { status, programId, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (programId) where.programId = programId;
    if (search) where.name = { [Op.like]: `%${search}%` };

    // Interns/mentors see only their projects
    let memberFilter = null;
    if (['intern', 'mentor', 'team_lead'].includes(req.user.role)) {
      const memberships = await ProjectMember.findAll({ where: { userId: req.user.id }, attributes: ['projectId'] });
      where.id = { [Op.in]: memberships.map(m => m.projectId) };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Project.findAndCountAll({
      where,
      include: [
        { model: User, as: 'createdBy', attributes: ['id', 'firstName', 'lastName'] },
        { model: Program, as: 'program', attributes: ['id', 'name'] },
        { model: ProjectMember, as: 'members', include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'avatar'] }] },
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });
    return res.json({ success: true, data: { projects: rows, total: count } });
  } catch (err) { next(err); }
};

// POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const { name, description, programId, status, startDate, endDate, priority, tags } = req.body;
    const project = await Project.create({ name, description, programId, status, startDate, endDate, priority, tags, createdById: req.user.id });
    // Add creator as lead member
    await ProjectMember.create({ projectId: project.id, userId: req.user.id, role: 'lead' });
    return res.status(201).json({ success: true, message: 'Project created.', data: project });
  } catch (err) { next(err); }
};

// GET /api/projects/:id
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: 'createdBy', attributes: ['id', 'firstName', 'lastName'] },
        { model: Program, as: 'program', attributes: ['id', 'name'] },
        { model: ProjectMember, as: 'members', include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'avatar', 'role'] }] },
        { model: Sprint, as: 'sprints', order: [['order', 'ASC']] },
        { model: Milestone, as: 'milestones' },
        { model: Deliverable, as: 'deliverables' },
      ],
    });
    if (!project) return next(createError(404, 'Project not found.'));
    return res.json({ success: true, data: project });
  } catch (err) { next(err); }
};

// PUT /api/projects/:id
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return next(createError(404, 'Project not found.'));
    await project.update(req.body);
    return res.json({ success: true, message: 'Project updated.', data: project });
  } catch (err) { next(err); }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return next(createError(404, 'Project not found.'));
    await project.destroy();
    return res.json({ success: true, message: 'Project deleted.' });
  } catch (err) { next(err); }
};

// POST /api/projects/:id/members
const addMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const existing = await ProjectMember.findOne({ where: { projectId: req.params.id, userId } });
    if (existing) return next(createError(409, 'User is already a member.'));
    const member = await ProjectMember.create({ projectId: req.params.id, userId, role: role || 'member' });
    return res.status(201).json({ success: true, data: member });
  } catch (err) { next(err); }
};

// DELETE /api/projects/:id/members/:userId
const removeMember = async (req, res, next) => {
  try {
    const member = await ProjectMember.findOne({ where: { projectId: req.params.id, userId: req.params.userId } });
    if (!member) return next(createError(404, 'Member not found.'));
    await member.destroy();
    return res.json({ success: true, message: 'Member removed.' });
  } catch (err) { next(err); }
};

// Sprint CRUD
const createSprint = async (req, res, next) => {
  try {
    const { name, goal, startDate, endDate, order } = req.body;
    const sprint = await Sprint.create({ projectId: req.params.id, name, goal, startDate, endDate, order });
    return res.status(201).json({ success: true, data: sprint });
  } catch (err) { next(err); }
};

const updateSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findByPk(req.params.sprintId);
    if (!sprint) return next(createError(404, 'Sprint not found.'));
    await sprint.update(req.body);
    return res.json({ success: true, data: sprint });
  } catch (err) { next(err); }
};

// Deliverable CRUD
const createDeliverable = async (req, res, next) => {
  try {
    const deliverable = await Deliverable.create({ projectId: req.params.id, ...req.body });
    return res.status(201).json({ success: true, data: deliverable });
  } catch (err) { next(err); }
};

const updateDeliverable = async (req, res, next) => {
  try {
    const deliverable = await Deliverable.findByPk(req.params.deliverableId);
    if (!deliverable) return next(createError(404, 'Deliverable not found.'));
    await deliverable.update(req.body);
    return res.json({ success: true, data: deliverable });
  } catch (err) { next(err); }
};

module.exports = { listProjects, createProject, getProject, updateProject, deleteProject, addMember, removeMember, createSprint, updateSprint, createDeliverable, updateDeliverable };
