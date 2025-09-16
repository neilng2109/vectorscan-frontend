import axios from 'axios';

// Get the API URL from the environment variables
// This will be https://vectorscan-api.herokuapp.com on production (main)
// and https://vectorscan-api-staging.herokuapp.com on staging (develop)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_URL,
});

// This is the "smart" part of our client. It's an interceptor that
// runs before any response is handled by our components.
apiClient.interceptors.response.use(
  // If the response is successful, just return it
  (response) => response,
  // If there's an error...
  (error) => {
    // Check if it's a 401 Unauthorized error (which means our token is expired or invalid)
    if (error.response && error.response.status === 401) {
      console.log("Session expired or invalid. Logging out.");
      // Remove the old token from storage
      localStorage.removeItem('token');
      // Redirect the user to the login page
      // The reload(true) forces a full page refresh
      window.location.href = '/login'; 
    }
    // For any other error, just pass it along
    return Promise.reject(error);
  }
);

export default apiClient;