// Survey Application JavaScript
class SurveyApp {
    constructor() {
        this.currentSlide = 0;
        this.responses = {};
        this.totalQuestions = 17; // Welcome + 16 questions
        this.isSubmitting = false;
        
        // Initialize Supabase
        this.initializeSupabase();
        
        // Initialize EmailJS
        this.initializeEmailJS();
        
        // Bind event handlers
        this.bindEvents();
        
        // Initialize progress
        this.updateProgress();
        
        // Handle keyboard navigation
        this.handleKeyboardNavigation();
        
        console.log('Survey application initialized');
    }
    
    initializeSupabase() {
        // Supabase configuration - replace with your actual Supabase details
        this.supabaseUrl = 'https://klvbfnjsklnkgmikudhv.supabase.co'; // Your Supabase project URL
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsdmJmbmpza2xua2dtaWt1ZGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMTM4MjksImV4cCI6MjA2MzY4OTgyOX0.w7jC5eqHIHVEgxZJtRglQxpu4urTwujWxKovCk6l-9s'; // Your Supabase anon key
        this.tableName = 'survey_responses'; // The table name in your Supabase database
        
        // Check if Supabase is configured
        if (this.supabaseUrl === 'YOUR_SUPABASE_URL' || this.supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
            console.warn('Supabase not configured. Please update the credentials in script.js');
        }
    }
    
    initializeEmailJS() {
        // Initialize EmailJS v4+ - updated initialization method
        if (typeof emailjs !== 'undefined') {
            emailjs.init({
                publicKey: "uDnQ03H3ia-crL5L3", // Replace with your EmailJS public key
            });
        }
        this.emailServiceId = "service_7b051ao"; // Replace with your service ID
        this.emailTemplateId = "template_ycl6mnw"; // Replace with your template ID
    }
    
    bindEvents() {
        // Bind option clicks for single select questions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.option')) {
                this.handleSingleSelect(e.target.closest('.option'));
            }
            
            if (e.target.closest('.rating-option')) {
                this.handleRatingSelect(e.target.closest('.rating-option'));
            }
        });
        
        // Bind checkbox events for multi-select questions
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                this.handleCheckboxChange(e.target);
            }
        });
        
        // Bind text input events
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('text-input')) {
                this.handleTextInput(e.target);
            }
            
            if (e.target.classList.contains('other-input')) {
                this.handleOtherInput(e.target);
            }
        });
    }
    
    handleKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            const activeSlide = document.querySelector('.question-slide.active');
            const nextBtn = activeSlide.querySelector('.next-btn');
            
            // Enter key for next question (if next button is enabled)
            if (e.key === 'Enter' && nextBtn && !nextBtn.disabled) {
                e.preventDefault();
                this.nextQuestion();
            }
            
            // Number keys for single select options
            if (e.key >= '1' && e.key <= '9') {
                const options = activeSlide.querySelectorAll('.option, .rating-option');
                const index = parseInt(e.key) - 1;
                if (options[index]) {
                    options[index].click();
                }
            }
        });
    }
    
    handleSingleSelect(option) {
        const slide = option.closest('.question-slide');
        const allOptions = slide.querySelectorAll('.option');
        
        // Remove selected class from all options
        allOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selected class to clicked option
        option.classList.add('selected');
        
        // Store response
        const questionId = slide.id;
        const value = option.dataset.value;
        this.responses[questionId] = value;
        
        // Enable next button
        this.enableNextButton(slide);
        
        // Auto-advance after a short delay for better UX
        setTimeout(() => {
            if (slide.classList.contains('active')) {
                this.nextQuestion();
            }
        }, 600);
    }
    
    handleRatingSelect(option) {
        const slide = option.closest('.question-slide');
        const allOptions = slide.querySelectorAll('.rating-option');
        
        // Remove selected class from all options
        allOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selected class to clicked option
        option.classList.add('selected');
        
        // Store response
        const questionId = slide.id;
        const value = option.dataset.value;
        this.responses[questionId] = value;
        
        // Enable next button
        this.enableNextButton(slide);
        
        // Auto-advance after a short delay
        setTimeout(() => {
            if (slide.classList.contains('active')) {
                this.nextQuestion();
            }
        }, 600);
    }
    
    handleCheckboxChange(checkbox) {
        const slide = checkbox.closest('.question-slide');
        const questionId = slide.id;
        
        // Handle "Other" option
        if (checkbox.id.includes('_other')) {
            const otherInput = slide.querySelector('.other-input');
            if (checkbox.checked) {
                otherInput.disabled = false;
                otherInput.focus();
            } else {
                otherInput.disabled = true;
                otherInput.value = '';
            }
        }
        
        // Handle "None of the above" exclusivity for q12
        if (questionId === 'q12' && checkbox.id === 'expect4' && checkbox.checked) {
            const otherCheckboxes = slide.querySelectorAll('input[type="checkbox"]:not(#expect4)');
            otherCheckboxes.forEach(cb => {
                cb.checked = false;
                cb.closest('.checkbox-option').classList.remove('selected');
            });
        } else if (questionId === 'q12' && checkbox.id !== 'expect4' && checkbox.checked) {
            const noneCheckbox = slide.querySelector('#expect4');
            if (noneCheckbox.checked) {
                noneCheckbox.checked = false;
                noneCheckbox.closest('.checkbox-option').classList.remove('selected');
            }
        }
        
        // Handle selection limit for q11 (top 3)
        if (questionId === 'q11') {
            this.handleTop3Selection(slide);
        }
        
        // Update visual state
        const checkboxOption = checkbox.closest('.checkbox-option');
        if (checkbox.checked) {
            checkboxOption.classList.add('selected');
        } else {
            checkboxOption.classList.remove('selected');
        }
        
        // Store responses
        this.storeCheckboxResponses(slide);
        
        // Validate and enable/disable next button
        this.validateCheckboxQuestion(slide);
    }
    
    handleTop3Selection(slide) {
        const checkboxes = slide.querySelectorAll('input[type="checkbox"]:not(#bias_other)');
        const checkedBoxes = Array.from(checkboxes).filter(cb => cb.checked);
        const selectionCount = document.getElementById('selectionCount');
        
        // Update counter
        selectionCount.textContent = checkedBoxes.length;
        
        // Disable other checkboxes if 3 are selected
        if (checkedBoxes.length >= 3) {
            checkboxes.forEach(cb => {
                if (!cb.checked) {
                    cb.disabled = true;
                    cb.closest('.checkbox-option').style.opacity = '0.5';
                }
            });
        } else {
            checkboxes.forEach(cb => {
                cb.disabled = false;
                cb.closest('.checkbox-option').style.opacity = '1';
            });
        }
    }
    
    handleTextInput(input) {
        const slide = input.closest('.question-slide');
        const questionId = slide.id;
        this.responses[questionId] = input.value.trim();
        
        // Text inputs are optional, so always enable next button
        this.enableNextButton(slide);
    }
    
    handleOtherInput(input) {
        const slide = input.closest('.question-slide');
        const checkbox = slide.querySelector('input[type="checkbox"][id$="_other"]');
        
        if (input.value.trim()) {
            checkbox.dataset.otherValue = input.value.trim();
        } else {
            delete checkbox.dataset.otherValue;
        }
        
        this.storeCheckboxResponses(slide);
    }
    
    storeCheckboxResponses(slide) {
        const questionId = slide.id;
        const checkboxes = slide.querySelectorAll('input[type="checkbox"]:checked');
        const responses = [];
        
        checkboxes.forEach(checkbox => {
            const option = checkbox.closest('.checkbox-option');
            let value = option.dataset.value;
            
            // Handle "Other" option
            if (checkbox.id.includes('_other') && checkbox.dataset.otherValue) {
                value = `Other: ${checkbox.dataset.otherValue}`;
            }
            
            responses.push(value);
        });
        
        this.responses[questionId] = responses;
    }
    
    validateCheckboxQuestion(slide) {
        const questionId = slide.id;
        const checkboxes = slide.querySelectorAll('input[type="checkbox"]:checked');
        
        if (checkboxes.length > 0) {
            this.enableNextButton(slide);
        } else {
            this.disableNextButton(slide);
        }
    }
    
    enableNextButton(slide) {
        const nextBtn = slide.querySelector('.next-btn');
        if (nextBtn) {
            nextBtn.disabled = false;
        }
    }
    
    disableNextButton(slide) {
        const nextBtn = slide.querySelector('.next-btn');
        if (nextBtn) {
            nextBtn.disabled = true;
        }
    }
    
    nextQuestion() {
        if (this.isSubmitting) return;
        
        const currentSlideElement = document.querySelector('.question-slide.active');
        const questionId = currentSlideElement.id;
        
        // Validate current question before proceeding
        if (!this.validateCurrentQuestion(currentSlideElement)) {
            return;
        }
        
        // Special handling for last question
        if (this.currentSlide >= this.totalQuestions - 1) {
            this.submitSurvey();
            return;
        }
        
        // Move to next slide
        this.currentSlide++;
        this.showSlide(this.currentSlide);
        this.updateProgress();
    }
    
    previousQuestion() {
        if (this.currentSlide > 0) {
            this.currentSlide--;
            this.showSlide(this.currentSlide);
            this.updateProgress();
        }
    }
    
    validateCurrentQuestion(slide) {
        const questionId = slide.id;
        
        // Skip validation for welcome and summary screens
        if (questionId === 'welcome' || questionId === 'summary') {
            return true;
        }
        
        // Skip validation for optional text questions
        if (questionId === 'q14' || questionId === 'q15' || questionId === 'q16') {
            return true;
        }
        
        // Validate single select questions
        if (slide.querySelector('.option')) {
            return slide.querySelector('.option.selected') !== null;
        }
        
        // Validate rating questions
        if (slide.querySelector('.rating-option')) {
            return slide.querySelector('.rating-option.selected') !== null;
        }
        
        // Validate checkbox questions
        if (slide.querySelector('input[type="checkbox"]')) {
            return slide.querySelector('input[type="checkbox"]:checked') !== null;
        }
        
        return true;
    }
    
    showSlide(index) {
        // Hide all slides
        document.querySelectorAll('.question-slide').forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Show current slide
        const slides = document.querySelectorAll('.question-slide');
        if (slides[index]) {
            slides[index].classList.add('active');
            
            // Focus management for accessibility
            const firstFocusable = slides[index].querySelector('button, input, textarea, .option, .rating-option');
            if (firstFocusable) {
                setTimeout(() => firstFocusable.focus(), 100);
            }
        }
    }
    
    updateProgress() {
        const progressBar = document.getElementById('progressBar');
        const questionCounter = document.getElementById('questionCounter');
        const sectionIndicator = document.getElementById('sectionIndicator');
        
        // Update progress bar
        const progressPercent = (this.currentSlide / (this.totalQuestions - 1)) * 100;
        progressBar.style.width = `${Math.min(progressPercent, 100)}%`;
        
        // Update question counter
        const displayQuestion = Math.min(this.currentSlide + 1, this.totalQuestions);
        questionCounter.textContent = `Question ${displayQuestion} of ${this.totalQuestions}`;
        
        // Update section indicator
        const sectionInfo = this.getSectionInfo(this.currentSlide);
        sectionIndicator.textContent = sectionInfo;
    }
    
    getSectionInfo(slideIndex) {
        if (slideIndex === 0) return "Welcome";
        if (slideIndex >= 1 && slideIndex <= 3) return "Section 1: Preliminary Information";
        if (slideIndex >= 4 && slideIndex <= 7) return "Section 2: Cognitive and Emotional Blocks";
        if (slideIndex >= 8 && slideIndex <= 10) return "Section 3: Workplace Culture";
        if (slideIndex >= 11 && slideIndex <= 13) return "Section 4: Behavioural Biases";
        if (slideIndex >= 14 && slideIndex <= 16) return "Section 5: Personal Insights";
        return "Survey Complete";
    }
    
    async submitSurvey() {
        if (this.isSubmitting) return;
        
        this.isSubmitting = true;
        console.log('🚀 Starting survey submission...');
        
        try {
            // Show loading state
            this.showLoadingState();
            console.log('📝 Loading state shown');
            
            // Prepare data for submission
            const submissionData = this.prepareSubmissionData();
            console.log('📊 Submission data prepared:', submissionData);
            
            // Submit to Supabase
            console.log('💾 Attempting Supabase submission...');
            const supabaseResult = await this.submitToSupabase(submissionData);
            console.log('💾 Supabase result:', supabaseResult);
            
            // Email notifications now handled automatically by Supabase webhooks
            // No need for client-side email sending
            console.log('📧 Email notifications handled by Supabase webhooks');
            
            // Show summary page
            console.log('📋 Showing summary page...');
            this.showSummaryPage();
            
        } catch (error) {
            console.error('❌ Submission error:', error);
            alert('There was an error submitting your survey. Please try again.');
        } finally {
            this.isSubmitting = false;
            console.log('✅ Survey submission process completed');
        }
    }
    
    prepareSubmissionData() {
        const timestamp = new Date().toISOString();
        const responseId = this.generateResponseId();
        
        // Get browser and system info
        const browserInfo = this.getBrowserInfo();
        
        // Map responses to question texts
        const questionMap = {
            'q1': 'What is your employment type?',
            'q2': 'How many years of experience do you have?',
            'q3': 'What is your job role type?',
            'q4': 'In the past 1 year, how many vacation leave days have you taken (excluding sick leave)?',
            'q5': 'Have you ever postponed or cancelled a planned leave due to:',
            'q6': 'When you think about taking leave, what emotions do you associate with it?',
            'q7': 'Have you ever faked illness or made an excuse to justify personal leave?',
            'q8': 'Does your manager regularly take visible time off?',
            'q9': 'How would you rate your team\'s attitude towards vacation leave?',
            'q10': 'Do you feel judged or less committed when you take time off?',
            'q11': 'Which of these reasons most reflect why you avoid taking leave? (Top 3)',
            'q12': 'If your leave application is approved, are you still expected to:',
            'q13': 'Would a reminder like this change your perception?',
            'q14': 'What would make it easier for you to take a guilt-free break at work?',
            'q15': 'Do you think taking planned leave improves your performance when you return? Why or why not?',
            'q16': 'What features in a leave-focused wellness app would you find most useful if you were a manager?'
        };
        
        return {
            responseId,
            timestamp,
            ...browserInfo,
            responses: this.responses,
            questionMap
        };
    }
    
    generateResponseId() {
        return 'RESP_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        
        // Get IP address (this is approximate and may not work in all environments)
        let ipAddress = 'Not available';
        
        return {
            userAgent,
            ipAddress,
            language: navigator.language,
            platform: navigator.platform,
            screen: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }
    
    async submitToSupabase(data) {
        // Check if Supabase is configured
        if (this.supabaseUrl === 'YOUR_SUPABASE_URL' || this.supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
            console.warn('Supabase not configured. Skipping Supabase submission.');
            console.log('Data that would be submitted:', data);
            return { success: true, message: 'Skipped - Supabase not configured' };
        }
        
        try {
            console.log('Attempting to submit to Supabase:', this.supabaseUrl);
            console.log('Data being sent:', data);
            
            // Prepare data for Supabase table
            const supabaseData = {
                response_id: data.responseId,
                timestamp: data.timestamp,
                ip_address: data.ipAddress || null,
                user_agent: data.userAgent || null,
                language: data.language || null,
                platform: data.platform || null,
                screen: data.screen || null,
                timezone: data.timezone || null,
                
                // Employment details
                employment_type: data.responses.q1 || null,
                years_experience: data.responses.q2 || null,
                job_role_type: data.responses.q3 || null,
                vacation_days_taken: data.responses.q4 || null,
                
                // Emotional blocks
                postpone_reasons: Array.isArray(data.responses.q5) ? data.responses.q5 : [data.responses.q5],
                leave_emotions: data.responses.q6 || null,
                faked_illness: data.responses.q7 || null,
                
                // Workplace culture
                manager_takes_leave: data.responses.q8 || null,
                team_attitude_rating: data.responses.q9 || null,
                feel_judged: data.responses.q10 || null,
                
                // Behavioral biases
                avoid_leave_reasons: Array.isArray(data.responses.q11) ? data.responses.q11 : [data.responses.q11],
                leave_expectations: Array.isArray(data.responses.q12) ? data.responses.q12 : [data.responses.q12],
                
                // Personal insights
                nudge_response: data.responses.q13 || null,
                guilt_free_factors: data.responses.q14 || null,
                performance_impact: data.responses.q15 || null,
                manager_app_features: data.responses.q16 || null,
                
                // All responses as JSON for backup
                raw_responses: data.responses
            };
            
            // Make the Supabase REST API call
            const response = await fetch(`${this.supabaseUrl}/rest/v1/${this.tableName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(supabaseData)
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Supabase error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            
            const result = await response.json();
            console.log('Supabase response:', result);
            
            console.log('Successfully submitted to Supabase:', result);
            return { 
                success: true, 
                message: 'Survey response saved successfully',
                data: result
            };
            
        } catch (error) {
            console.error('Supabase submission error:', error);
            
            // For fallback, log the data locally
            console.log('Fallback - Data that would be submitted:', data);
            
            // Don't throw error to allow survey completion
            return { 
                success: false, 
                error: error.message,
                fallback: true 
            };
        }
    }
    
    showLoadingState() {
        const activeSlide = document.querySelector('.question-slide.active');
        activeSlide.classList.add('loading');
        
        // Add loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.innerHTML = '<p>Submitting your responses...</p>';
        loadingDiv.style.position = 'fixed';
        loadingDiv.style.top = '50%';
        loadingDiv.style.left = '50%';
        loadingDiv.style.transform = 'translate(-50%, -50%)';
        loadingDiv.style.background = 'var(--bg-card)';
        loadingDiv.style.padding = '2rem';
        loadingDiv.style.borderRadius = '1rem';
        loadingDiv.style.zIndex = '1000';
        loadingDiv.id = 'loadingIndicator';
        
        document.body.appendChild(loadingDiv);
    }
    
    showSummaryPage() {
        // Remove loading indicator
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
        
        // Show summary slide
        this.currentSlide = this.totalQuestions;
        this.showSlide(this.totalQuestions);
        this.updateProgress();
        
        // Populate response summary
        this.populateResponseSummary();
    }
    
    populateResponseSummary() {
        const summaryContainer = document.getElementById('responseSummary');
        const questionMap = {
            'q1': 'Employment Type',
            'q2': 'Years of Experience',
            'q3': 'Job Role Type',
            'q4': 'Vacation Days Taken',
            'q5': 'Reasons for Postponing Leave',
            'q6': 'Emotions Associated with Leave',
            'q7': 'Ever Faked Illness for Leave',
            'q8': 'Manager\'s Leave Behavior',
            'q9': 'Team\'s Attitude Rating',
            'q10': 'Feel Judged When Taking Leave',
            'q11': 'Top Reasons for Avoiding Leave',
            'q12': 'Expectations During Approved Leave',
            'q13': 'Nudge Reminder Response',
            'q14': 'What Would Make Leave Easier',
            'q15': 'Leave Impact on Performance',
            'q16': 'Useful Manager App Features'
        };
        
        let summaryHTML = '';
        
        Object.keys(this.responses).forEach(questionId => {
            const questionText = questionMap[questionId];
            const answer = this.responses[questionId];
            let formattedAnswer;
            
            if (Array.isArray(answer)) {
                formattedAnswer = answer.length > 0 ? answer.join(', ') : 'No response';
            } else {
                formattedAnswer = answer || 'No response';
            }
            
            // Truncate long text responses
            if (typeof formattedAnswer === 'string' && formattedAnswer.length > 100) {
                formattedAnswer = formattedAnswer.substring(0, 97) + '...';
            }
            
            summaryHTML += `
                <div class="summary-item">
                    <div class="summary-question">${questionText}</div>
                    <div class="summary-answer">${formattedAnswer}</div>
                </div>
            `;
        });
        
        summaryContainer.innerHTML = summaryHTML;
    }
}

// Initialize the survey when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.surveyApp = new SurveyApp();
});

// Global functions for HTML onclick handlers
function nextQuestion() {
    window.surveyApp.nextQuestion();
}

function previousQuestion() {
    window.surveyApp.previousQuestion();
} 