import axios from 'axios';

// 1. Create a central, configured instance of Axios.
// We'll use this for all our API calls instead of the default axios object.
const apiClient = axios.create({
  // Use an environment variable for the base URL. This makes it easy to switch
  // between your local, staging, and production backends.
  baseURL: import.meta.env.VITE_API_URL || 'https://vectorscan-api.herokuapp.com',
});

// 2. This is the "interceptor" - a powerful feature of Axios.
// It acts as a gatekeeper for all responses coming back from the server.
apiClient.interceptors.response.use(
  // If the response is successful (e.g., status 200), just pass it along.
  (response) => response,

  // If the response is an error...
  (error) => {
    // Check if the error is a 401 Unauthorized response.
    if (error.response && error.response.status === 401) {
      console.log("Session expired or token is invalid. Logging out.");
      
      // The token is invalid, so remove it from storage.
      localStorage.removeItem('token');
      
      // Force a hard redirect to the login page. This clears all application
      // state and ensures the user has to re-authenticate.
      window.location.href = '/login';
    }

    // For all other errors, just pass them along to be handled by the component.
    return Promise.reject(error);
  }
);

export default apiClient;
