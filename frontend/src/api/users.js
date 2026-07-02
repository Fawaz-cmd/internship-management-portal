import client from './client';

export const listUsers = async (params = {}) => {
  const response = await client.get('/users', { params });
  return response.data;
};

export const getUser = async (id) => {
  const response = await client.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await client.put(`/users/${id}`, userData);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await client.post('/users', userData);
  return response.data;
};

export const deactivateUser = async (id) => {
  const response = await client.delete(`/users/${id}`);
  return response.data;
};

export const getStats = async () => {
  const response = await client.get('/users/stats');
  return response.data;
};

export const getAuditLogs = async (params = {}) => {
  const response = await client.get('/users/audit-logs', { params });
  return response.data;
};
