import { kuderQuestions, unimetCareers, unimetMinors } from '../data/kuderData.js';

export class TestLogic {
  constructor() {
    this.currentQuestionIndex = 0;
    this.studentName = '';
    this.studentId = '';
    this.userAnswers = new Array(kuderQuestions.length).fill(null).map(() => []);
    this.kuderScores = {};
    this.initializeKuderScores();
  }

  initializeKuderScores() {
    this.kuderScores = {
      Cálculo: 0,
      Científica: 0,
      Diseño: 0,
      Tecnológica: 0,
      Sanitaria: 0,
      Asistencial: 0,
      Jurídica: 0,
      Económica: 0,
      Comunicacional: 0,
      Literaria: 0,
      Musical: 0,
      Oficina: 0,
      Exterior: 0,
    };
  }

  setStudentInfo(name, id) {
    this.studentName = name.trim();
    this.studentId = id.trim();
  }

  validateStudentInfo() {
    return this.studentName && this.studentId;
  }

  getCurrentQuestion() {
    return kuderQuestions[this.currentQuestionIndex];
  }

  getTotalQuestions() {
    return kuderQuestions.length;
  }

  setAnswerForCurrentQuestion(selectedOptions) {
    this.userAnswers[this.currentQuestionIndex] = [...selectedOptions];
  }

  getAnswerForCurrentQuestion() {
    return this.userAnswers[this.currentQuestionIndex] || [];
  }

  goToNextQuestion() {
    if (this.currentQuestionIndex < kuderQuestions.length - 1) {
      this.currentQuestionIndex++;
      return true;
    }
    return false;
  }

  goToPreviousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      return true;
    }
    return false;
  }

  isLastQuestion() {
    return this.currentQuestionIndex === kuderQuestions.length - 1;
  }

  isFirstQuestion() {
    return this.currentQuestionIndex === 0;
  }

  calculateKuderScores() {
    this.initializeKuderScores();
    
    this.userAnswers.forEach((optionIndexes, questionIndex) => {
      optionIndexes.forEach((optionIndex) => {
        const area = kuderQuestions[questionIndex].options[optionIndex].kuder_area;
        if (area && this.kuderScores.hasOwnProperty(area)) {
          this.kuderScores[area]++;
        }
      });
    });
  }

  getTopKuderInterests(num = 3) {
    return Object.entries(this.kuderScores)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .slice(0, num)
      .filter(([, score]) => score > 0);
  }

  getCareerRecommendations() {
    const topInterests = this.getTopKuderInterests(5);
    const careerAffinities = [];
    
    // Análisis especial para combinaciones de áreas
    const hasLiteraria = topInterests.some(([area]) => area === "Literaria");
    const hasComunicacional = topInterests.some(([area]) => area === "Comunicacional");

    unimetCareers.forEach((career) => {
      let affinityScore = 0;
      
      topInterests.forEach(([area, userScore]) => {
        const relevance = career.kuder_areas_relevance[area] || 0;
        affinityScore += userScore * relevance;
      });

      // Bonificación especial para combinaciones específicas
      if (hasLiteraria && hasComunicacional) {
        if (
          career.name === "Estudios Internacionales" ||
          career.name === "Estudios Liberales" ||
          career.name === "Derecho"
        ) {
          affinityScore += 20;
        }
      }

      if (affinityScore > 0) {
        careerAffinities.push({ ...career, affinityScore });
      }
    });

    return careerAffinities
      .sort((a, b) => b.affinityScore - a.affinityScore)
      .slice(0, 3);
  }

  getMinorRecommendations() {
    const topInterests = this.getTopKuderInterests(5);
    const minorAffinities = [];

    unimetMinors.forEach((minor) => {
      let affinityScore = 0;
      
      topInterests.forEach(([area, userScore]) => {
        const relevance = minor.kuder_areas_relevance[area] || 0;
        affinityScore += userScore * relevance;
      });
      
      if (affinityScore > 0) {
        minorAffinities.push({ ...minor, affinityScore });
      }
    });

    return minorAffinities
      .sort((a, b) => b.affinityScore - a.affinityScore)
      .slice(0, 3);
  }

  exportResults() {
    const topInterests = this.getTopKuderInterests(5)
      .map(([area, score]) => `${area} (${score} puntos)`)
      .join(', ');
    
    const careersText = this.getCareerRecommendations()
      .map((c) => `- ${c.name}: ${c.description}`)
      .join('\n');
    
    const minorsText = this.getMinorRecommendations()
      .map((m) => {
        const subjects = m.subjects && m.subjects.length > 0
          ? `\n    Materias: ${m.subjects.join(', ')}`
          : '';
        const skills = m.job_skills && m.job_skills.length > 0
          ? `\n    Capacidades Laborales: ${m.job_skills.join(', ')}`
          : '';
        return `- ${m.name}: ${m.description}${subjects}${skills}`;
      })
      .join('\n\n');

    const finalPhrase = `Este estudio te permite acercarte a tu decisión vocacional y construir tu plan de carrera en la Unimet. Si quieres profundizar más, escríbenos a la DDBE@UNIMET.EDU.VE para que participes en nuestro programa vocacional sin ningún costo.`;

    return `
Resultados del Test de Intereses Vocacionales UNIMET

Nombre del Alumno: ${this.studentName}
Cédula de Identidad: ${this.studentId}

--- Perfil de Intereses Kuder ---
Tus intereses principales son: ${topInterests || 'No se pudieron determinar intereses claros.'}

--- Sugerencias de Carreras en la UNIMET ---
${careersText || 'No se encontraron sugerencias de carreras.'}

--- Sugerencias de Minors en la UNIMET ---
${minorsText || 'No se encontraron sugerencias de minors.'}

---
${finalPhrase}
    `.trim();
  }

  downloadResults() {
    const resultsContent = this.exportResults();
    const blob = new Blob([resultsContent], {
      type: 'text/plain;charset=utf-8',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Resultados_Vocacionales_${this.studentName.replace(/\s/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}