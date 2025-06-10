# Workplace Leave Culture Survey

This project is a simple, standalone web survey designed to gather insights into workplace leave culture. The goal is to understand the emotional and professional factors that influence employees' decisions about taking time off.

## Getting Started

To get this project up and running, follow these steps.

### 1. Get the Project Files
First, you need the project files on your computer. You can either download them as a ZIP file or clone the repository if you have Git installed.

### 2. Open the Survey
Navigate to the project folder and open the `index.html` file in a web browser (like Chrome, Firefox, or Safari). This will start the survey.

### 3. Configure Data Collection (Optional)
If you want to save survey responses, you'll need to configure the project to send data to a Google Sheet and send email notifications via EmailJS.

*   **Google Sheets Setup:**
    1.  Open `google-apps-script.js` and follow the instructions inside to create a Google Apps Script.
    2.  Deploy the script as a Web App to get a URL.
    3.  Paste this URL into the `googleScriptURL` variable in `script.js`.

*   **EmailJS Setup:**
    1.  Create a free account at [EmailJS.com](https://www.emailjs.com/).
    2.  Get your **Service ID**, **Template ID**, and **Public Key** from your EmailJS dashboard.
    3.  Add these details to the `initializeEmailJS` section in `script.js`.

Once configured, the survey will be fully operational. 