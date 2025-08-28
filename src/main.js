import './style.css'
import { TestLogic } from './modules/testLogic.js'
import { UI } from './modules/ui.js'

class VocationalTestApp {
  constructor() {
    this.testLogic = new TestLogic();
    this.ui = new UI();
    this.setupEventListeners();
    this.init();
  }

  init() {
    // Mostrar la sección de introducción
    this.ui.showSection('intro');
    
    // Limpiar inputs al cargar
    this.ui.clearInputs();
  }

  setupEventListeners() {
    this.ui.onStartTest(() => this.startTest());
    this.ui.onNextQuestion(() => this.nextQuestion());
    this.ui.onPreviousQuestion(() => this.previousQuestion());
    this.ui.onSubmitTest(() => this.submitTest());
    this.ui.onExportResults(() => this.exportResults());
  }

  startTest() {
    const studentInfo = this.ui.getStudentInfo();
    
    if (!studentInfo.name || !studentInfo.id) {
      this.ui.showMessage('Por favor, ingresa tu nombre y cédula para comenzar.');
      return;
    }

    this.testLogic.setStudentInfo(studentInfo.name, studentInfo.id);
    this.ui.showSection('test');
    this.displayCurrentQuestion();
  }

  displayCurrentQuestion() {
    const question = this.testLogic.getCurrentQuestion();
    const selectedAnswers = this.testLogic.getAnswerForCurrentQuestion();
    
    this.ui.displayQuestion(
      question, 
      this.testLogic.currentQuestionIndex, 
      this.testLogic.getTotalQuestions(),
      selectedAnswers
    );
    
    this.ui.updateNavigationButtons(
      this.testLogic.isFirstQuestion(), 
      this.testLogic.isLastQuestion()
    );
  }

  nextQuestion() {
    if (!this.validateCurrentAnswers()) {
      return;
    }

    this.saveCurrentAnswers();
    
    if (this.testLogic.goToNextQuestion()) {
      this.displayCurrentQuestion();
    } else {
      this.submitTest();
    }
  }

  previousQuestion() {
    this.saveCurrentAnswers();
    
    if (this.testLogic.goToPreviousQuestion()) {
      this.displayCurrentQuestion();
    }
  }

  submitTest() {
    if (!this.validateCurrentAnswers()) {
      return;
    }

    this.saveCurrentAnswers();
    
    // Calcular resultados
    this.testLogic.calculateKuderScores();
    
    // Mostrar resultados
    this.displayResults();
  }

  validateCurrentAnswers() {
    const question = this.testLogic.getCurrentQuestion();
    const selectedOptions = this.ui.getSelectedOptions(question.id);
    
    if (selectedOptions.length === 0) {
      const message = this.testLogic.isLastQuestion() 
        ? 'Por favor, selecciona al menos una opción para la última pregunta antes de finalizar.'
        : 'Por favor, selecciona al menos una opción antes de continuar.';
      
      this.ui.showMessage(message);
      return false;
    }
    
    return true;
  }

  saveCurrentAnswers() {
    const question = this.testLogic.getCurrentQuestion();
    const selectedOptions = this.ui.getSelectedOptions(question.id);
    this.testLogic.setAnswerForCurrentQuestion(selectedOptions);
  }

  displayResults() {
    this.ui.showSection('results');
    
    const topInterests = this.testLogic.getTopKuderInterests(5);
    const careerRecommendations = this.testLogic.getCareerRecommendations();
    const minorRecommendations = this.testLogic.getMinorRecommendations();
    
    this.ui.displayResults(
      this.testLogic.studentName,
      topInterests,
      careerRecommendations,
      minorRecommendations
    );
  }

  async exportResults() {
    try {
      // Show loading message
      this.ui.showMessage('Guardando resultados en Google Sheets...', 'info');
      
      // Submit to Google Sheets
      await this.testLogic.submitResultsToGoogleSheets();
      
      // Download local copy
      this.testLogic.downloadResults();
      
      this.ui.showMessage('Resultados guardados en Google Sheets y descargados exitosamente.', 'success');
    } catch (error) {
      console.error('Error in exportResults:', error);
      
      // If Google Sheets submission fails, still allow local download
      try {
        this.testLogic.downloadResults();
        this.ui.showMessage(`Error al guardar en Google Sheets: ${error.message}. Sin embargo, se descargó una copia local.`, 'warning');
      } catch (downloadError) {
        this.ui.showMessage(`Error al exportar los resultados: ${error.message}`, 'error');
      }
    }
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new VocationalTestApp();
});
