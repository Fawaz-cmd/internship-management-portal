import client from './client';

export const listProjects = async (params = {}) => {
  const response = await client.get('/projects', { params });
  return response.data;
};

export const getProject = async (id) => {
  const response = await client.get(`/projects/${id}`);
  return response.data;
};

export const createProject = async (projectData) => {
  const response = await client.post('/projects', projectData);
  return response.data;
};

export const addProjectMember = async (id, memberData) => {
  const response = await client.post(`/projects/${id}/members`, memberData);
  return response.data;
};
