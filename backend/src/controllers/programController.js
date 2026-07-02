const { Op } = require('sequelize');
const { Program, User, InternProfile } = require('../models');
const { createError } = require('../middleware/errorHandler');

const listPrograms = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) where.name = { [Op.like]: `%${search}%` };

    const programs = await Program.findAll({
      where,
      include: [{ model: User, as: 'manager', attributes: ['id', 'firstName', 'lastName'] }],
      order: [['createdAt', 'DESC']],
    });
    return res.json({ success: true, data: programs });
  } catch (err) { next(err); }
};

const createProgram = async (req, res, next) => {
  try {
    const { name, description, department, startDate, endDate, managerId, maxInterns, location } = req.body;
    const program = await Program.create({ name, description, department, startDate, endDate, managerId, maxInterns, location, status: 'active' });
    return res.status(201).json({ success: true, message: 'Program created.', data: program });
  } catch (err) { next(err); }
};

const getProgram = async (req, res, next) => {
  try {
    const program = await Program.findByPk(req.params.id, {
      include: [
        { model: User, as: 'manager', attributes: ['id', 'firstName', 'lastName'] },
        { model: InternProfile, as: 'interns', include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] }] },
      ],
    });
    if (!program) return next(createError(404, 'Program not found.'));
    return res.json({ success: true, data: program });
  } catch (err) { next(err); }
};

const updateProgram = async (req, res, next) => {
  try {
    const program = await Program.findByPk(req.params.id);
    if (!program) return next(createError(404, 'Program not found.'));
    await program.update(req.body);
    return res.json({ success: true, message: 'Program updated.', data: program });
  } catch (err) { next(err); }
};

const deleteProgram = async (req, res, next) => {
  try {
    const program = await Program.findByPk(req.params.id);
    if (!program) return next(createError(404, 'Program not found.'));
    await program.destroy();
    return res.json({ success: true, message: 'Program deleted.' });
  } catch (err) { next(err); }
};

module.exports = { listPrograms, createProgram, getProgram, updateProgram, deleteProgram };
