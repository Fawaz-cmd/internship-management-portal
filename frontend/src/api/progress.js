import client from './client';

export const submitDailyUpdate = async (updateData) => {
  const response = await client.post('/progress/daily', updateData);
  return response.data;
};

export const getDailyUpdates = async (params = {}) => {
  const response = await client.get('/progress/daily', { params });
  return response.data;
};

export const submitWeeklyReport = async (reportData) => {
  const response = await client.post('/progress/weekly', reportData);
  return response.data;
};

export const getWeeklyReports = async (params = {}) => {
  const response = await client.get('/progress/weekly', { params });
  return response.data;
};

export const reviewWeeklyReport = async (id, reviewData) => {
  const response = await client.put(`/progress/weekly/${id}/review`, reviewData);
  return response.data;
};

export const getSkills = async (params = {}) => {
  const response = await client.get('/progress/skills', { params });
  return response.data;
};

export const addSkill = async (skillData) => {
  const response = await client.post('/progress/skills', skillData);
  return response.data;
};

export const getAnalytics = async (params = {}) => {
  const response = await client.get('/progress/analytics', { params });
  return response.data;
};
