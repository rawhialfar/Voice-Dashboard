// In your frontend code
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/index'  // Netlify function path
  : 'http://localhost:8888/.netlify/functions/index'; // Local dev

// Example API call
fetch(`${API_URL}/api/health`)
  .then(res => res.json())
  .then(data => console.log(data));