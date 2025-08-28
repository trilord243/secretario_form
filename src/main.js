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
  }

  startTest() {
    const studentInfo = this.ui.getStudentInfo();
    const validation = this.ui.validateStudentInfo(studentInfo);
    
    if (!validation.isValid) {
      this.ui.showMessage(validation.errors.join(' '), 'error');
      return;
    }

    this.testLogic.setStudentInfo(studentInfo.name, studentInfo.email, studentInfo.id);
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

  async submitTest() {
    if (!this.validateCurrentAnswers()) {
      return;
    }

    this.saveCurrentAnswers();
    
    // Calcular resultados
    this.testLogic.calculateKuderScores();
    
    // Mostrar mensaje de que se están guardando los datos
    this.ui.showMessage('Procesando resultados y guardando en Google Sheets...', 'info');
    
    // Enviar datos a Google Sheets automáticamente
    try {
      await this.testLogic.submitResultsToGoogleSheets();
      this.ui.showMessage('¡Test completado exitosamente! Resultados guardados en Google Sheets.', 'success');
    } catch (error) {
      console.error('Error submitting results:', error);
      this.ui.showMessage('Test completado. Nota: Error al guardar automáticamente en Google Sheets, pero puedes usar el botón "Exportar Resultados".', 'warning');
    }
    
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

  exportResults() {
    try {
      // Solo descargar copia local (los datos ya se guardaron automáticamente al finalizar el test)
      this.testLogic.downloadResults();
      this.ui.showMessage('Archivo descargado exitosamente.', 'success');
    } catch (error) {
      console.error('Error downloading results:', error);
      this.ui.showMessage('Error al descargar el archivo de resultados.', 'error');
    }
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new VocationalTestApp();
});
