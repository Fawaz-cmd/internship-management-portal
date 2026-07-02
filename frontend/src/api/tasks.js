import client from './client';

export const listTasks = async (params = {}) => {
  const response = await client.get('/tasks', { params });
  return response.data;
};

export const getKanban = async (params = {}) => {
  const response = await client.get('/tasks/kanban', { params });
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await client.post('/tasks', taskData);
  return response.data;
};

export const getTask = async (id) => {
  const response = await client.get(`/tasks/${id}`);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await client.put(`/tasks/${id}`, taskData);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await client.delete(`/tasks/${id}`);
  return response.data;
};

export const addComment = async (id, content) => {
  const response = await client.post(`/tasks/${id}/comments`, { content });
  return response.data;
};

export const addAttachment = async (id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await client.post(`/tasks/${id}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
