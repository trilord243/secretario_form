export class UI {
  constructor() {
    this.elements = this.getElements();
  }

  getElements() {
    return {
      // Secciones principales
      introSection: document.getElementById('intro-section'),
      testSection: document.getElementById('test-section'),
      resultsSection: document.getElementById('results-section'),
      
      // Formulario de entrada
      studentNameInput: document.getElementById('student-name'),
      studentIdInput: document.getElementById('student-id'),
      startTestBtn: document.getElementById('start-test-btn'),
      
      // Navegación del test
      currentQuestionNumberSpan: document.getElementById('current-question-number'),
      totalQuestionsSpan: document.getElementById('total-questions'),
      questionTextH2: document.getElementById('question-text'),
      optionsContainer: document.getElementById('options-container'),
      prevQuestionBtn: document.getElementById('prev-question-btn'),
      nextQuestionBtn: document.getElementById('next-question-btn'),
      submitTestBtn: document.getElementById('submit-test-btn'),
      
      // Resultados
      resultsStudentNameSpan: document.getElementById('results-student-name'),
      topInterestsDisplay: document.getElementById('top-interests-display'),
      careerSuggestions: document.getElementById('career-suggestions'),
      minorSuggestions: document.getElementById('minor-suggestions'),
      
      // Mensajes
      messageBox: document.getElementById('message-box'),
      messageText: document.getElementById('message-text'),
    };
  }

  showSection(sectionName) {
    // Ocultar todas las secciones
    this.elements.introSection.classList.add('hidden');
    this.elements.testSection.classList.add('hidden');
    this.elements.resultsSection.classList.add('hidden');
    
    // Mostrar la sección solicitada
    switch(sectionName) {
      case 'intro':
        this.elements.introSection.classList.remove('hidden');
        break;
      case 'test':
        this.elements.testSection.classList.remove('hidden');
        break;
      case 'results':
        this.elements.resultsSection.classList.remove('hidden');
        break;
    }
  }

  showMessage(text, type = 'error') {
    this.elements.messageText.textContent = text;
    
    // Remover clases existentes
    this.elements.messageBox.classList.remove('error', 'success', 'info', 'warning');
    
    // Agregar clase según el tipo
    this.elements.messageBox.classList.add(type);
    this.elements.messageBox.classList.remove('hidden');
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      this.elements.messageBox.classList.add('hidden');
    }, 5000);
  }

  getStudentInfo() {
    return {
      name: this.elements.studentNameInput.value.trim(),
      id: this.elements.studentIdInput.value.trim()
    };
  }

  displayQuestion(question, questionIndex, totalQuestions, selectedAnswers = []) {
    // Actualizar número de pregunta
    this.elements.currentQuestionNumberSpan.textContent = questionIndex + 1;
    this.elements.totalQuestionsSpan.textContent = totalQuestions;
    
    // Actualizar texto de la pregunta
    this.elements.questionTextH2.textContent = `${questionIndex + 1}. ${question.text}`;
    
    // Limpiar opciones existentes
    this.elements.optionsContainer.innerHTML = '';
    
    // Crear opciones
    question.options.forEach((option, index) => {
      const label = this.createOptionElement(option, index, question.id, selectedAnswers.includes(String(index)));
      this.elements.optionsContainer.appendChild(label);
    });
  }

  createOptionElement(option, index, questionId, isSelected) {
    const label = document.createElement('label');
    label.className = 'checkbox-option';
    
    if (isSelected) {
      label.classList.add('selected');
    }
    
    label.innerHTML = `
      <input type="checkbox" name="question-${questionId}" value="${index}" 
             data-kuder-area="${option.kuder_area}" class="form-checkbox" ${isSelected ? 'checked' : ''}>
      <span>${option.text}</span>
    `;
    
    // Agregar event listener para el cambio
    const checkbox = label.querySelector('input');
    checkbox.addEventListener('change', (e) => {
      this.handleOptionChange(e, label);
    });
    
    return label;
  }

  handleOptionChange(event, label) {
    const selectedCount = this.elements.optionsContainer.querySelectorAll('input:checked').length;
    
    if (selectedCount > 2 && event.target.checked) {
      event.target.checked = false;
      this.showMessage('Solo puedes seleccionar un máximo de 2 opciones por pregunta.');
    } else {
      if (event.target.checked) {
        label.classList.add('selected');
      } else {
        label.classList.remove('selected');
      }
    }
  }

  getSelectedOptions(questionId) {
    const selectedInputs = this.elements.optionsContainer.querySelectorAll(`input[name="question-${questionId}"]:checked`);
    return Array.from(selectedInputs).map(input => input.value);
  }

  updateNavigationButtons(isFirst, isLast) {
    this.elements.prevQuestionBtn.disabled = isFirst;
    
    if (isLast) {
      this.elements.nextQuestionBtn.classList.add('hidden');
      this.elements.submitTestBtn.classList.remove('hidden');
    } else {
      this.elements.nextQuestionBtn.classList.remove('hidden');
      this.elements.submitTestBtn.classList.add('hidden');
    }
  }

  displayResults(studentName, topInterests, careerRecommendations, minorRecommendations) {
    // Nombre del estudiante
    this.elements.resultsStudentNameSpan.textContent = studentName;
    
    // Intereses principales
    this.displayTopInterests(topInterests);
    
    // Recomendaciones de carreras
    this.displayCareerRecommendations(careerRecommendations);
    
    // Recomendaciones de minors
    this.displayMinorRecommendations(minorRecommendations);
  }

  displayTopInterests(topInterests) {
    this.elements.topInterestsDisplay.innerHTML = '';
    
    if (topInterests.length > 0) {
      topInterests.forEach(([area, score]) => {
        const tag = document.createElement('span');
        tag.className = 'kuder-area-tag';
        tag.textContent = `${area} (${score} puntos)`;
        this.elements.topInterestsDisplay.appendChild(tag);
      });
    } else {
      this.elements.topInterestsDisplay.textContent = 
        'No se pudieron determinar intereses claros. Asegúrate de haber respondido todas las preguntas.';
    }
  }

  displayCareerRecommendations(recommendations) {
    this.elements.careerSuggestions.innerHTML = '';
    
    if (recommendations.length > 0) {
      recommendations.forEach((career) => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="font-semibold">${career.name}:</span> ${career.description}`;
        this.elements.careerSuggestions.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.textContent = 'No se encontraron sugerencias de carreras basadas en tus intereses. Considera explorar todas las opciones de la UNIMET.';
      this.elements.careerSuggestions.appendChild(li);
    }
  }

  displayMinorRecommendations(recommendations) {
    this.elements.minorSuggestions.innerHTML = '';
    
    if (recommendations.length > 0) {
      recommendations.forEach((minor) => {
        const minorCard = document.createElement('div');
        minorCard.className = 'minor-card';
        
        let subjectsHtml = '';
        if (minor.subjects && minor.subjects.length > 0) {
          subjectsHtml = 
            `<div class="minor-detail">
              <h5 class="minor-detail-title">📚 Materias</h5>
              <ul class="minor-detail-list">
                ${minor.subjects.map((s) => `<li>${s}</li>`).join('')}
              </ul>
            </div>`;
        }
        
        let skillsHtml = '';
        if (minor.job_skills && minor.job_skills.length > 0) {
          skillsHtml =
            `<div class="minor-detail">
              <h5 class="minor-detail-title">💼 Capacidades Laborales</h5>
              <ul class="minor-detail-list">
                ${minor.job_skills.map((s) => `<li>${s}</li>`).join('')}
              </ul>
            </div>`;
        }
        
        minorCard.innerHTML = `
          <div class="minor-header">
            <h4 class="minor-title">${minor.name}</h4>
            <p class="minor-description">${minor.description}</p>
          </div>
          <div class="minor-content">
            ${subjectsHtml}
            ${skillsHtml}
          </div>
        `;
        
        this.elements.minorSuggestions.appendChild(minorCard);
      });
    } else {
      const noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.innerHTML = `
        <p>No se encontraron sugerencias de minors basadas en tus intereses.</p>
        <p>Considera explorar todas las opciones de la UNIMET.</p>
      `;
      this.elements.minorSuggestions.appendChild(noResults);
    }
  }

  clearInputs() {
    this.elements.studentNameInput.value = '';
    this.elements.studentIdInput.value = '';
  }

  // Event listener helpers
  onStartTest(callback) {
    this.elements.startTestBtn.addEventListener('click', callback);
  }

  onNextQuestion(callback) {
    this.elements.nextQuestionBtn.addEventListener('click', callback);
  }

  onPreviousQuestion(callback) {
    this.elements.prevQuestionBtn.addEventListener('click', callback);
  }

  onSubmitTest(callback) {
    this.elements.submitTestBtn.addEventListener('click', callback);
  }
}