# Workplace Leave Culture Survey

A comprehensive typeform-style survey to understand workplace leave culture and emotional barriers to taking time off. Features a modern dark theme interface with one question per page and progress tracking.

## ✨ Features

- **Typeform-style Interface**: One question per page with smooth transitions
- **Dark Theme**: Modern, professional appearance
- **Progress Tracking**: Visual progress bar with percentage and section indicators
- **Keyboard Navigation**: Navigate with Enter key and number keys
- **Email Notifications**: Automatic email alerts when responses are submitted
- **Supabase Database**: Reliable data storage with real-time capabilities
- **Responsive Design**: Works on all devices
- **Multi-select Questions**: Support for checkbox selections with limits
- **Response Summary**: Complete overview of submitted answers

## 🗂️ Survey Structure

**17 Steps Total** (1 Welcome + 16 Questions + 1 Summary)

### Section 1: Employment Details (Questions 1-4)
- Employment type (Full-time, Part-time, Contract, etc.)
- Years of experience
- Job role level
- Vacation days taken in past year

### Section 2: Emotional Blocks (Questions 5-7)
- Reasons for postponing leave
- Emotions associated with taking leave
- Experience with faking illness for leave

### Section 3: Workplace Culture (Questions 8-10)
- Manager's leave behavior
- Team attitude towards vacation leave
- Feeling judged when taking time off

### Section 4: Behavioral Biases (Questions 11-12)
- Top 3 reasons for avoiding leave
- Expectations during approved leave

### Section 5: Personal Insights (Questions 13-16)
- Response to reminder nudges
- Factors for guilt-free breaks
- Impact of leave on performance
- Useful manager app features

## 🚀 Quick Setup

### Prerequisites
- A Supabase account (free)
- An EmailJS account (free)

### 1. Clone/Download
```bash
git clone <your-repo-url>
cd Survey-form
```

### 2. Set up Supabase
Follow the detailed guide in `supabase-setup.md`:
1. Create a Supabase project
2. Set up the database table
3. Get your credentials

### 3. Configure the Application
Edit `script.js` and update these values:

```javascript
// Supabase Configuration
initializeSupabase() {
    this.supabaseUrl = 'https://YOUR_PROJECT_ID.supabase.co';
    this.supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
    this.tableName = 'survey_responses';
}

// EmailJS Configuration  
initializeEmailJS() {
    emailjs.init("YOUR_EMAILJS_PUBLIC_KEY");
    this.emailServiceId = "YOUR_SERVICE_ID";
    this.emailTemplateId = "YOUR_TEMPLATE_ID";
}
```

### 4. Deploy
Upload the files to any web server or hosting platform:
- **Netlify**: Drag and drop the folder
- **Vercel**: Connect your GitHub repo
- **GitHub Pages**: Enable Pages in repo settings
- **Traditional hosting**: Upload via FTP

## 📧 Email Setup (EmailJS)

1. Sign up at [EmailJS.com](https://www.emailjs.com/)
2. Create a new service (Gmail, Outlook, etc.)
3. Create an email template with these variables:
   - `{{to_email}}` - Recipient email
   - `{{response_id}}` - Unique response ID
   - `{{timestamp}}` - Submission time
   - `{{responses}}` - Formatted survey responses

Sample template:
```
Subject: New Survey Response - {{response_id}}

A new workplace leave culture survey response has been submitted.

Response ID: {{response_id}}
Submitted: {{timestamp}}

Responses:
{{responses}}
```

## 🗃️ Database Schema (Supabase)

The survey creates a `survey_responses` table with these fields:

### Metadata
- `response_id` (text) - Unique identifier
- `timestamp` (timestamptz) - Submission time
- `ip_address`, `user_agent`, `language`, etc. - Browser info

### Survey Responses
- `employment_type` - Q1: Employment type
- `years_experience` - Q2: Years of experience
- `job_role_type` - Q3: Job role level
- `vacation_days_taken` - Q4: Days taken
- `postpone_reasons` (json) - Q5: Postponement reasons
- `leave_emotions` - Q6: Associated emotions
- `faked_illness` - Q7: Faked illness experience
- `manager_takes_leave` - Q8: Manager behavior
- `team_attitude_rating` - Q9: Team attitude (1-5)
- `feel_judged` - Q10: Feeling judged
- `avoid_leave_reasons` (json) - Q11: Top 3 avoidance reasons
- `leave_expectations` (json) - Q12: Work expectations
- `nudge_response` - Q13: Nudge effectiveness
- `guilt_free_factors` - Q14: Improvement factors
- `performance_impact` - Q15: Performance thoughts
- `manager_app_features` - Q16: App feature preferences
- `raw_responses` (json) - Complete backup

## 🎨 Customization

### Theme Colors
Edit `styles.css` to change the color scheme:
```css
:root {
    --primary-color: #6366f1;     /* Accent color */
    --bg-primary: #111111;        /* Main background */
    --bg-card: #181818;           /* Card background */
    --text-primary: #ffffff;      /* Primary text */
    --text-secondary: #a1a1aa;    /* Secondary text */
}
```

### Questions
Modify questions in `index.html`. Update the corresponding mapping in `script.js`:
```javascript
populateResponseSummary() {
    const questionMap = {
        'q1': 'Your Custom Question 1',
        'q2': 'Your Custom Question 2',
        // ... add your questions
    };
}
```

## 🔧 Advanced Features

### Keyboard Navigation
- **Enter**: Next question (when answer selected)
- **1-9**: Select options 1-9 on current question
- **Escape**: Previous question (if enabled)

### Data Validation
- Required field checking
- Multi-select limits (e.g., "top 3" selections)
- Email format validation
- Response length limits

### Analytics Integration
Add Google Analytics, Mixpanel, or other analytics:
```javascript
// In submitSurvey() method
analytics.track('Survey Completed', {
    responseId: data.responseId,
    timestamp: data.timestamp
});
```

## 🌐 Deployment Options

### Free Hosting Platforms
1. **Netlify** - `netlify deploy --prod`
2. **Vercel** - `vercel --prod`  
3. **GitHub Pages** - Enable in repository settings
4. **Surge.sh** - `surge ./`

### Custom Domain
1. Purchase domain from registrar
2. Update DNS records to point to hosting platform
3. Enable HTTPS (usually automatic)

## 🔒 Security Considerations

### Supabase Security
1. **Row Level Security**: Enable RLS for production
2. **API Keys**: Use anon key for public access
3. **Rate Limiting**: Built into Supabase
4. **HTTPS**: Always use HTTPS in production

### EmailJS Security
1. **Domain Whitelist**: Restrict to your domain
2. **Rate Limiting**: Monitor usage in dashboard
3. **Template Variables**: Sanitize user input

## 📊 Data Analysis

### Exporting Data
- **Supabase Dashboard**: Built-in export to CSV
- **API Access**: Programmatic data retrieval
- **SQL Queries**: Complex analysis via SQL Editor

### Sample Analysis Queries
```sql
-- Response rate by employment type
SELECT employment_type, COUNT(*) as responses
FROM survey_responses 
GROUP BY employment_type;

-- Average team attitude by manager leave behavior
SELECT manager_takes_leave, AVG(team_attitude_rating::numeric)
FROM survey_responses 
WHERE team_attitude_rating IS NOT NULL
GROUP BY manager_takes_leave;

-- Most common leave avoidance reasons
SELECT jsonb_array_elements_text(avoid_leave_reasons) as reason, COUNT(*)
FROM survey_responses 
WHERE avoid_leave_reasons IS NOT NULL
GROUP BY reason
ORDER BY count DESC;
```

## 🐛 Troubleshooting

### Common Issues

1. **Supabase Connection Errors**
   - Check URL and API key
   - Verify table name is correct
   - Check browser console for details

2. **Email Not Sending**
   - Verify EmailJS configuration
   - Check template variables match
   - Review EmailJS dashboard logs

3. **Form Not Submitting**
   - Open browser developer tools
   - Check for JavaScript errors
   - Verify all required fields completed

### Debug Mode
Enable debug logging by adding to console:
```javascript
window.surveyApp.debugMode = true;
```

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Verify Supabase and EmailJS configurations
4. Check the `supabase-setup.md` guide

## 📄 License

MIT License - feel free to modify and use for your projects.

---

**Built with ❤️ for better workplace culture research** 