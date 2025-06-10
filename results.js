/**
 * ResultsApp
 * Handles fetching, displaying, and downloading survey results.
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const supabaseUrl = 'https://klvbfnjsklnkgmikudhv.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsdmJmbmpza2xua2dtaWt1ZGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMTM4MjksImV4cCI6MjA2MzY4OTgyOX0.w7jC5eqHIHVEgxZJtRglQxpu4urTwujWxKovCk6l-9s';
    const tableName = 'survey_responses';

    // --- DOM ELEMENTS ---
    const tableContainer = document.getElementById('table-container');
    const loader = document.getElementById('loader');
    const downloadBtn = document.getElementById('download-csv');
    const errorDisplay = document.getElementById('error-message');

    // --- STATE ---
    let surveyData = [];

    // --- INITIALIZATION ---
    if (!supabaseUrl || !supabaseKey) {
        return showError('Supabase credentials are not configured.');
    }
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    fetchData();

    // --- FUNCTIONS ---

    /**
     * Fetches data from the Supabase table.
     */
    async function fetchData() {
        showLoader(true);
        try {
            const { data, error } = await supabaseClient
                .from(tableName)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            surveyData = data;
            if (surveyData.length === 0) {
                showError('No survey responses yet. Be the first!');
            } else {
                renderTable(surveyData);
            }
        } catch (e) {
            console.error('Error fetching data:', e);
            showError('Failed to load survey data. Please ensure RLS policies are set up correctly. See the README for instructions.');
        } finally {
            showLoader(false);
        }
    }

    /**
     * Renders the fetched data into an HTML table.
     * @param {Array<Object>} data - The array of survey responses.
     */
    function renderTable(data) {
        if (!data || data.length === 0) return;
        
        // Exclude these columns from the public view
        const excludedColumns = ['id', 'raw_responses'];
        const headers = Object.keys(data[0]).filter(h => !excludedColumns.includes(h));

        const table = document.createElement('table');
        
        // Create table header
        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        for (const header of headers) {
            const th = document.createElement('th');
            th.textContent = header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Format header text
            headerRow.appendChild(th);
        }

        // Create table body
        const tbody = table.createTBody();
        for (const row of data) {
            const tr = tbody.insertRow();
            for (const header of headers) {
                const td = tr.insertCell();
                let value = row[header];
                // Handle JSONB fields
                if (typeof value === 'object' && value !== null) {
                    value = JSON.stringify(value);
                }
                td.textContent = value;
            }
        }
        
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);
        downloadBtn.disabled = false;
    }

    /**
     * Converts an array of objects to a CSV string and triggers a download.
     */
    function downloadCSV() {
        if (surveyData.length === 0) return;

        const excludedColumns = ['id', 'raw_responses'];
        const headers = Object.keys(surveyData[0]).filter(h => !excludedColumns.includes(h));
        const csvRows = [];
        
        // Add header row
        csvRows.push(headers.join(','));

        // Add data rows
        for (const row of surveyData) {
            const values = headers.map(header => {
                let value = row[header];
                if (value === null || value === undefined) {
                    return '';
                }
                // Handle JSON objects
                if (typeof value === 'object') {
                    value = JSON.stringify(value);
                }
                // Escape commas and quotes
                const stringValue = String(value);
                if (stringValue.includes(',')) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            });
            csvRows.push(values.join(','));
        }

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'survey_responses.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Shows or hides the loading indicator.
     * @param {boolean} visible - Whether to show the loader.
     */
    function showLoader(visible) {
        if (loader) loader.style.display = visible ? 'block' : 'none';
        if(tableContainer) tableContainer.style.display = visible ? 'none' : 'block';
        if(downloadBtn) downloadBtn.disabled = visible;
    }

    /**
     * Displays an error message to the user.
     * @param {string} message - The error message to show.
     */
    function showError(message) {
        if (tableContainer) tableContainer.innerHTML = '';
        if (errorDisplay) {
            errorDisplay.textContent = message;
            errorDisplay.style.display = 'block';
        }
        if (loader) loader.style.display = 'none';
    }

    // --- EVENT LISTENERS ---
    downloadBtn.addEventListener('click', downloadCSV);
}); 