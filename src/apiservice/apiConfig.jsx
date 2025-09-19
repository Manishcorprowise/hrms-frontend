export const apiUrl = {
  apiEndPoint: 'http://localhost:3000/api',
  // apiEndPoint: 'https://b06877240d48.ngrok-free.app/api',
  // apiEndPoint: "https://5b6e90335985.ngrok-free.app",
  //  apiEndPoint: 'https://api.kadconnect.ca/api',
    // apiEndPoint: "https://api.test.kadconnect.ca/api",

};

export const hrmsConfig = {
  hrmsKey: import.meta.env.VITE_HRMS_KEY || 
           (typeof __VITE_HRMS_KEY__ !== 'undefined' ? __VITE_HRMS_KEY__ : null)
};

