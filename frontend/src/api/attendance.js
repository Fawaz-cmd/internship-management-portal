import client from './client';

export const checkIn = async () => {
  const response = await client.post('/attendance/check-in');
  return response.data;
};

export const checkOut = async () => {
  const response = await client.post('/attendance/check-out');
  return response.data;
};

export const getAttendance = async (params = {}) => {
  const response = await client.get('/attendance', { params });
  return response.data;
};
