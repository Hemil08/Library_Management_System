import axios from 'axios';

export const getBooksByQuery = async (query) => {
  // Placeholder API URL, replace with actual AI backend
  const response = await axios.post('/api/ai/recommend', { query });
  return response;
};
