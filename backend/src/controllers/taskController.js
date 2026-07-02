const { Op } = require('sequelize');
const { Task, User, Project, Sprint, Milestone, TaskAttachment, TaskComment, Notification } = require('../models');
const { createError } = require('../middleware/errorHandler');
const upload = require('../config/multer');
const notificationService = require('../services/notificationService');

// GET /api/tasks
const listTasks = async (req, res, next) => {
  try {
    const { status, priority, assigneeId, projectId, sprintId, page = 1, limit = 50, search } = req.query;
    const where = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (projectId) where.projectId = projectId;
    if (sprintId) where.sprintId = sprintId;
    if (search) where.title = { [Op.like]: `%${search}%` };

    // Role-based filtering
    if (req.user.role === 'intern') {
      where.assigneeId = req.user.id;
    } else if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Task.findAndCountAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName', 'avatar'] },
        { model: User, as: 'assigner', attributes: ['id', 'firstName', 'lastName'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: Sprint, as: 'sprint', attributes: ['id', 'name'] },
      ],
      limit: parseInt(limit),
      offset,
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
    });

    return res.json({ success: true, data: { tasks: rows, total: count } });
  } catch (err) { next(err); }
};

// GET /api/tasks/kanban
const getKanban = async (req, res, next) => {
  try {
    const { projectId, sprintId, assigneeId } = req.query;
    const where = {};
    if (projectId) where.projectId = projectId;
    if (sprintId) where.sprintId = sprintId;
    if (req.user.role === 'intern') where.assigneeId = req.user.id;
    else if (assigneeId) where.assigneeId = assigneeId;

    const tasks = await Task.findAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName', 'avatar'] },
        { model: TaskAttachment, as: 'attachments', attributes: ['id', 'fileName'] },
        { model: TaskComment, as: 'comments', attributes: ['id'] },
      ],
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
    });

    const columns = {
      todo: tasks.filter(t => t.status === 'todo'),
      in_progress: tasks.filter(t => t.status === 'in_progress'),
      review: tasks.filter(t => t.status === 'review'),
      done: tasks.filter(t => t.status === 'done'),
      blocked: tasks.filter(t => t.status === 'blocked'),
    };

    return res.json({ success: true, data: columns });
  } catch (err) { next(err); }
};

// POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, sprintId, milestoneId, assigneeId, priority, dueDate, startDate, estimatedHours, tags, parentTaskId } = req.body;

    const task = await Task.create({
      title,
      description,
      projectId,
      sprintId,
      milestoneId,
      assigneeId,
      assignerId: req.user.id,
      priority: priority || 'medium',
      status: 'todo',
      dueDate,
      startDate,
      estimatedHours,
      tags,
      parentTaskId,
    });

    if (assigneeId && assigneeId !== req.user.id) {
      await notificationService.create({
        userId: assigneeId,
        type: 'task_assigned',
        title: 'New Task Assigned',
        body: `You have been assigned: "${title}"`,
        actionUrl: `/tasks/${task.id}`,
      });
    }

    const created = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName', 'avatar'] },
        { model: User, as: 'assigner', attributes: ['id', 'firstName', 'lastName'] },
      ],
    });

    return res.status(201).json({ success: true, message: 'Task created.', data: created });
  } catch (err) { next(err); }
};

// GET /api/tasks/:id
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName', 'avatar'] },
        { model: User, as: 'assigner', attributes: ['id', 'firstName', 'lastName'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: Sprint, as: 'sprint', attributes: ['id', 'name'] },
        { model: TaskAttachment, as: 'attachments', include: [{ model: User, as: 'uploadedBy', attributes: ['id', 'firstName', 'lastName'] }] },
        { model: TaskComment, as: 'comments', include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'avatar'] }], order: [['createdAt', 'ASC']] },
        { model: Task, as: 'subtasks', attributes: ['id', 'title', 'status', 'priority', 'dueDate'] },
      ],
    });
    if (!task) return next(createError(404, 'Task not found.'));
    return res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

// PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return next(createError(404, 'Task not found.'));

    const allowed = ['title', 'description', 'priority', 'status', 'dueDate', 'startDate', 'estimatedHours', 'actualHours', 'assigneeId', 'sprintId', 'milestoneId', 'tags', 'order'];
    const updates = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

    if (updates.status === 'done' && task.status !== 'done') {
      updates.completedAt = new Date();
    }

    await task.update(updates);

    // Notify on reassignment
    if (updates.assigneeId && updates.assigneeId !== task.assigneeId && updates.assigneeId !== req.user.id) {
      await notificationService.create({
        userId: updates.assigneeId,
        type: 'task_assigned',
        title: 'Task Reassigned to You',
        body: `Task "${task.title}" has been assigned to you.`,
        actionUrl: `/tasks/${task.id}`,
      });
    }

    const updated = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName', 'avatar'] },
      ],
    });
    return res.json({ success: true, message: 'Task updated.', data: updated });
  } catch (err) { next(err); }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return next(createError(404, 'Task not found.'));
    await task.destroy();
    return res.json({ success: true, message: 'Task deleted.' });
  } catch (err) { next(err); }
};

// POST /api/tasks/:id/comments
const addComment = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return next(createError(404, 'Task not found.'));
    const comment = await TaskComment.create({ taskId: task.id, userId: req.user.id, content: req.body.content });
    const populated = await TaskComment.findByPk(comment.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'avatar'] }],
    });
    return res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
};

// POST /api/tasks/:id/attachments
const addAttachment = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return next(createError(404, 'Task not found.'));
    if (!req.file) return next(createError(400, 'No file uploaded.'));

    const attachment = await TaskAttachment.create({
      taskId: task.id,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedById: req.user.id,
    });
    return res.status(201).json({ success: true, data: attachment });
  } catch (err) { next(err); }
};

module.exports = { listTasks, getKanban, createTask, getTask, updateTask, deleteTask, addComment, addAttachment };
