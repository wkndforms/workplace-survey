# Workplace Leave Culture Survey

This project is a standalone web application for conducting a detailed, anonymous survey on workplace leave culture. It features a modern, one-question-per-page interface, progress tracking, and a secure backend powered by Supabase.

A live, public-facing results page displays all submitted responses in real-time and allows for data download as a CSV file.

## Features

-   **Typeform-Style Interface:** Clean, focused, one-question-at-a-time user experience.
-   **Dark Theme:** Modern and easy on the eyes.
-   **Progress Indicators:** A progress bar and question counter keep users informed.
-   **Conditional Logic:** The survey flow changes based on user answers (e.g., asking for reasons only if a user has postponed leave).
-   **Secure Data Storage:** Uses [Supabase](https://supabase.io/) for reliable and secure data collection.
-   **Public Results Dashboard:** A dedicated `results.html` page to view and download all anonymized responses.
-   **Keyboard Navigation:** Users can navigate using arrow keys.
-   **Optional Email Notifications:** Can be configured to send email summaries using [EmailJS](https://www.emailjs.com/).

## Project Structure

```
.
├── index.html              # The main survey page
├── results.html            # The public page for viewing results
├── styles.css              # All styling for the application
├── script.js               # Core logic for the survey page
├── results.js              # Logic for the results page (fetching and rendering)
└── supabase-rls-setup.md   # REQUIRED: SQL script and instructions for setting up Supabase
```

## Setup Instructions

To run this project and collect your own data, follow these steps:

### 1. Supabase Project Setup

You need a free Supabase account to store the survey data.

1.  Go to [Supabase.io](https://supabase.io/) and create a new project.
2.  Once your project is ready, navigate to the **SQL Editor**.
3.  Open the `supabase-rls-setup.md` file in this repository.
4.  Copy the entire content of the SQL script from `supabase-rls-setup.md` and run it in the Supabase SQL Editor. This will create the `survey_responses` table.
5.  Follow the instructions in `supabase-rls-setup.md` to **enable Row Level Security (RLS)** and then run the two `CREATE POLICY` queries. This is a critical step to secure your data.

### 2. Configure Client-Side Credentials

You need to add your Supabase project's API credentials to the JavaScript files so the application can connect to your database.

1.  In your Supabase project, go to **Project Settings** > **API**.
2.  You will find your **Project URL** and your `anon` **public key**.
3.  Open `script.js` and `results.js` and replace the placeholder credentials with your own:

    ```javascript
    // In both script.js and results.js
    const supabaseUrl = 'https://klvbfnjsklnkgmikudhv.supabase.co'; // Replace with your URL
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Replace with your anon key
    ```

### 3. (Optional) Configure EmailJS

If you want to receive an email for each submission:

1.  Sign up at [EmailJS.com](https://www.emailjs.com/).
2.  Find your **Service ID**, **Template ID**, and **Public Key**.
3.  Open `script.js` and add your credentials:

    ```javascript
    // In script.js
    this.emailServiceId = 'YOUR_SERVICE_ID';
    this.emailTemplateId = 'YOUR_TEMPLATE_ID';
    this.emailPublicKey = 'YOUR_PUBLIC_KEY';
    ```

### 4. Run the Survey

Simply open the `index.html` file in your web browser to start the survey. Open `results.html` to see the submitted data. 