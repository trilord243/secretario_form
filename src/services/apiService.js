// Obtener la URL del API desde variables de entorno
// En desarrollo: http://localhost:3000/api
// En producción: https://tu-app-heroku.herokuapp.com/api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Log para debugging (solo en desarrollo)
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', API_BASE_URL);
}

export class ApiService {
  static async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/test`);
      return await response.json();
    } catch (error) {
      console.error('Error testing connection:', error);
      throw error;
    }
  }

  static async submitTestResults(studentData, testResults) {
    try {
      const payload = {
        studentName: studentData.name,
        studentEmail: studentData.email,
        studentId: studentData.id,
        results: {
          kuderScores: testResults.kuderScores,
          topInterests: testResults.topInterests,
          careerRecommendations: testResults.careerRecommendations,
          minorRecommendations: testResults.minorRecommendations,
          userAnswers: testResults.userAnswers
        },
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/sheets/submit-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting test results:', error);
      throw error;
    }
  }

  static async getStudentResults(studentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/sheets/results/${studentId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting student results:', error);
      throw error;
    }
  }

  static async getAllSheetData(range = 'A1:Z1000') {
    try {
      const response = await fetch(`${API_BASE_URL}/sheets/data?range=${encodeURIComponent(range)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting sheet data:', error);
      throw error;
    }
  }
}