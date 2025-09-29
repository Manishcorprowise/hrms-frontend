export const apiUrl = {
  // API Endpoint - Main API base URL
  apiEndPoint: 'http://localhost:3000/api',
  frontendBaseUrl: "http://localhost:5173",
  // apiEndPoint: "https://api.test.kadconnect.ca/api",
  // frontendBaseUrl: "https://test.kadconnect.ca",

  // Frontend Base URL - For email templates and redirects
};

export const hrmsConfig = {
  hrmsKey: import.meta.env.VITE_HRMS_KEY || 
           (typeof __VITE_HRMS_KEY__ !== 'undefined' ? __VITE_HRMS_KEY__ : null)
};

