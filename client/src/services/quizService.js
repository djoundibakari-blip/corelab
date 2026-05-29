import axios from 'axios';

const API_URL = 'http://localhost:4242/api';

export const quizService = {
  // Get all quizzes
  getQuizzes: async () => {
    const response = await axios.get(`${API_URL}/quizzes`);
    return response.data;
  },

  // Get single quiz
  getQuizById: async (id) => {
    const response = await axios.get(`${API_URL}/quizzes/${id}`);
    return response.data;
  },

  // Submit quiz attempt
  submitQuizAttempt: async (quizId, userId, answers) => {
    const response = await axios.post(`${API_URL}/quiz-attempts`, {
      quizId,
      userId,
      answers
    });
    return response.data;
  },

  // Get user's quiz attempts
  getUserAttempts: async (userId) => {
    const response = await axios.get(`${API_URL}/quiz-attempts/user/${userId}`);
    return response.data;
  },

  // Import quiz (Admin)
  importQuiz: async (quizData) => {
    const response = await axios.post(`${API_URL}/quizzes/import`, quizData);
    return response.data;
  }
};
