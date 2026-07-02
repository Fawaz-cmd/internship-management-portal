import client from './client';

export const listMeetings = async (params = {}) => {
  const response = await client.get('/meetings', { params });
  return response.data;
};

export const createMeeting = async (meetingData) => {
  const response = await client.post('/meetings', meetingData);
  return response.data;
};
