/**
 * SurveyApp
 * Handles the core logic of the survey including navigation,
 * data collection, validation, and submission.
 */
class SurveyApp {
    constructor() {
        // Core Elements
        this.slides = Array.from(document.querySelectorAll('.question-slide'));
        this.progressBar = document.getElementById('progressBar');
        this.questionCounter = document.getElementById('questionCounter');
        this.sectionIndicator = document.getElementById('sectionIndicator');

        // State
        this.currentQuestionIndex = 0;
        this.responses = {};
        this.history = []; // For back button functionality

        // Configuration
        const supabaseUrl = 'https://klvbfnjsklnkgmikudhv.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsdmJmbmpza2xua2dtaWt1ZGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMTM4MjksImV4cCI6MjA2MzY4OTgyOX0.w7jC5eqHIHVEgxZJtRglQxpu4urTwujWxKovCk6l-9s';
        this.supabase = supabaseUrl && supabaseKey ? supabase.createClient(supabaseUrl, supabaseKey) : null;
        
        this.emailServiceId = 'YOUR_SERVICE_ID';
        this.emailTemplateId = 'YOUR_TEMPLATE_ID';
        this.emailPublicKey = 'YOUR_PUBLIC_KEY';

        this.sectionMap = {
            'q1': 'Section 1: Preliminary Information', 'q2': 'Section 1: Preliminary Information', 'q3': 'Section 1: Preliminary Information',
            'q4': 'Section 2: Cognitive & Emotional Blocks', 'q5a': 'Section 2: Cognitive & Emotional Blocks', 'q5c': 'Section 2: Cognitive & Emotional Blocks', 'q5b': 'Section 2: Cognitive & Emotional Blocks', 'q6': 'Section 2: Cognitive & Emotional Blocks', 'q7': 'Section 2: Cognitive & Emotional Blocks',
            'q8': 'Section 3: Workplace Culture', 'q9': 'Section 3: Workplace Culture', 'q10': 'Section 3: Workplace Culture',
            'q11': 'Section 4: Behavioural Biases', 'q12': 'Section 4: Behavioural Biases',
            'q14': 'Section 5: Personal Insights', 'q15': 'Section 5: Personal Insights', 'q16': 'Section 5: Personal Insights',
        };

        // Initial setup
        this.initializeEventListeners();
        this.updateUI();
        if (this.emailPublicKey && this.emailPublicKey !== 'YOUR_PUBLIC_KEY') {
            emailjs.init(this.emailPublicKey);
        }
    }

    /**
     * Centralized event listener initialization.
     */
    initializeEventListeners() {
        document.getElementById('startBtn')?.addEventListener('click', () => this.showNextQuestion());
        
        this.slides.forEach(slide => {
            slide.querySelector('.next-btn:not(#startBtn)')?.addEventListener('click', () => this.showNextQuestion());
            slide.querySelector('.prev-btn')?.addEventListener('click', () => this.showPrevQuestion());

            // For single-choice questions (.option, .rating-option)
            slide.querySelectorAll('.option, .rating-option').forEach(option => {
                option.addEventListener('click', () => this.handleSingleSelect(option));
            });
            
            // For multi-choice questions
            slide.querySelectorAll('.checkbox-option input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', () => this.handleMultiSelect(checkbox));
            });

            // For text inputs
            slide.querySelectorAll('textarea.text-input').forEach(textarea => {
                textarea.addEventListener('input', () => this.handleTextInput(textarea));
            });
        });
    }

    handleSingleSelect(selectedOption) {
        const slide = selectedOption.closest('.question-slide');
        const questionId = slide.id;
        const value = selectedOption.dataset.value;
        this.responses[questionId] = value;

        // Update selection visual
        slide.querySelectorAll('.option.selected, .rating-option.selected').forEach(el => el.classList.remove('selected'));
        selectedOption.classList.add('selected');

        // The 'Next' button is now always enabled, so no logic is needed here.
    }
    
    handleMultiSelect(checkbox) {
        const slide = checkbox.closest('.question-slide');
        const questionId = slide.id;
        
        const selectedValues = Array.from(slide.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => cb.closest('.checkbox-option').dataset.value);
            
        this.responses[questionId] = selectedValues;
        
        // The 'Next' button is now always enabled, so no logic is needed here.
    }
    
    handleTextInput(textarea) {
        const slide = textarea.closest('.question-slide');
        this.responses[slide.id] = textarea.value.trim();
    }

    goToQuestionById(id) {
        const targetIndex = this.slides.findIndex(slide => slide.id === id);
        if (targetIndex !== -1) {
            this.history.push(this.currentQuestionIndex);
            this.currentQuestionIndex = targetIndex;
            this.updateUI();
        }
    }

    /**
     * Moves to the next question slide.
     */
    showNextQuestion() {
        const currentSlide = this.slides[this.currentQuestionIndex];
        const currentId = currentSlide.id;

        // Branching logic for the postpone/cancel flow
        if (currentId === 'q5a') {
            this.goToQuestionById('q5c'); // Always go to 'cancelled' question next
            return;
        }

        if (currentId === 'q5c') {
            const postponed = this.responses.q5a === 'Yes';
            const cancelled = this.responses.q5c === 'Yes';
            // If user answered 'Yes' to either, show the reasons question
            if (postponed || cancelled) {
                this.goToQuestionById('q5b');
            } else {
                // Otherwise, skip reasons and go to the next section
                this.goToQuestionById('q6');
            }
            return;
        }
        
        // After giving reasons (or if skipped), continue to the next section
        if (currentId === 'q5b') { 
            this.goToQuestionById('q6'); 
            return; 
        }

        if (this.currentQuestionIndex < this.slides.length - 1) {
            this.history.push(this.currentQuestionIndex);
            this.currentQuestionIndex++;
            this.updateUI();
        }
    }

    /**
     * Moves to the previous question slide.
     */
    showPrevQuestion() {
        if (this.history.length > 0) {
            this.currentQuestionIndex = this.history.pop();
            this.updateUI();
        }
    }

    /**
     * Updates all UI elements based on the current state.
     * - Shows the correct slide.
     * - Updates the progress bar and counter.
     * - Manages navigation button visibility.
     */
    updateUI() {
        this.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentQuestionIndex);
        });
        this.updateProgress();
    }

    /**
     * Updates the progress bar and question counter text.
     */
    updateProgress() {
        const visibleSlides = this.slides.filter(s => s.id !== 'welcome' && s.id !== 'summary' && s.id !== 'q5b');
        const totalQuestions = visibleSlides.length;
        let currentQ = this.history.length;
        
        const currentSlide = this.slides[this.currentQuestionIndex];
        const currentId = currentSlide.id;
        const isWelcome = currentId === 'welcome';
        const isSummary = currentId === 'summary';

        if (isWelcome) {
            this.progressBar.style.width = '0%';
            this.questionCounter.textContent = ' ';
            this.sectionIndicator.textContent = 'Welcome';
        } else if (isSummary) {
            this.progressBar.style.width = '100%';
            this.questionCounter.textContent = 'Completed';
            this.sectionIndicator.textContent = 'Finished';
            this.populateSummary();
            this.submitData();
        } else {
            const progress = (currentQ / totalQuestions) * 100;
            this.progressBar.style.width = `${progress}%`;
            this.questionCounter.textContent = `Question ${currentQ} of ${totalQuestions}`;
            this.sectionIndicator.textContent = this.sectionMap[currentId] || '';
        }
    }

    populateSummary() {
        const summaryContainer = document.getElementById('responseSummary');
        let html = '';
        const questionOrder = this.history.slice(1); // Get the path taken, remove welcome screen
        questionOrder.push(this.currentQuestionIndex); 
        const uniqueQuestions = [...new Set(questionOrder)];

        uniqueQuestions.forEach(index => {
            const slide = this.slides[index];
            const key = slide.id;
            const value = this.responses[key];
            const questionEl = document.getElementById(key);
            if (value && value.length > 0) {
                 const questionText = questionEl ? questionEl.querySelector('h2').textContent : key;
                 const answer = Array.isArray(value) ? value.join(', ') : value;
                 html += `<div class="summary-item"><p class="summary-question">${questionText}</p><p class="summary-answer">${answer}</p></div>`;
            }
        });
        summaryContainer.innerHTML = html;
    }
    
    async submitData() {
        // Format data for Supabase
        const dataToSubmit = {
            // Q1-Q4
            employment_type: this.responses.q1,
            years_experience: this.responses.q2,
            job_role_type: this.responses.q3,
            vacation_days_taken: this.responses.q4,
            // Q5
            postponed_leave: this.responses.q5a,
            cancelled_leave: this.responses.q5c,
            postpone_cancel_reasons: this.responses.q5b,
            // Q6-Q10
            leave_emotions: this.responses.q6,
            faked_illness: this.responses.q7,
            manager_takes_leave: this.responses.q8,
            team_attitude_rating: this.responses.q9,
            feel_judged: this.responses.q10,
            // Q11-Q12
            avoid_leave_reasons: this.responses.q11,
            leave_expectations: this.responses.q12,
            // Q14-Q16
            guilt_free_factors: this.responses.q14,
            performance_impact: this.responses.q15,
            manager_app_features: this.responses.q16,
            // And a raw backup
            raw_responses: this.responses
        };
        
        // Submit to Supabase
        if (this.supabase) {
            try {
                const { error } = await this.supabase
                    .from('survey_responses')
                    .insert([dataToSubmit]);
                if (error) throw error;
            } catch (e) {
                console.error("Error submitting to Supabase:", e);
            }
        }

        // To EmailJS (optional)
        if (this.emailServiceId !== 'YOUR_SERVICE_ID') {
            const templateParams = { ...this.responses, responses: JSON.stringify(this.responses, null, 2) };
            try {
                await emailjs.send(this.emailServiceId, this.emailTemplateId, templateParams);
            } catch (e) {
                console.error("Error sending email:", e);
            }
        }
    }
}

// Initialize the survey when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.surveyApp = new SurveyApp();
}); 