import axios from "axios";
import { apiUrl } from "./apiConfig";
import authService from "../services/authService";


export const apiService = {
  async hitApi(method, endpoint, body = {}, contentType = "", requireAuth = true) {
    try {
      const url = `${apiUrl.apiEndPoint}${endpoint}`;
      
      // Get authorization header if authentication is required
      let authHeader = null;
      if (requireAuth) {
        try {
          await authService.ensureValidToken();
          authHeader = authService.getAuthHeader();
        } catch (error) {
          // If token refresh fails, redirect to login
          authService.clearTokens();
          window.location.href = "/login";
          throw error;
        }
      }

      const options = {
        method: method,
        url: url,
        data: body,
        headers: {
          "Content-Type": contentType ? contentType : "application/json",
          ...(authHeader && { Authorization: authHeader }),
        },
      };

      const response = await axios(options);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Token is invalid, try to refresh
        if (requireAuth) {
          try {
            await authService.refreshAccessToken();
            // Retry the request with new token
            const retryOptions = {
              ...options,
              headers: {
                ...options.headers,
                Authorization: authService.getAuthHeader()
              }
            };
            const retryResponse = await axios(retryOptions);
            return retryResponse.data;
          } catch (refreshError) {
            // Refresh failed, redirect to login
            authService.clearTokens();
            window.location.href = "/login";
            throw refreshError;
          }
        } else {
          const message = error.response.data.message || "Unauthorized access.";
          alert(message);
          window.location.href = "/login";
        }
      } else {
        console.error("API call error:", error);
        throw error;
      }
    }
  },
  // Health check
  async healthCheck() {
    try {
      const endpoint = "/employee/health";
      return await this.hitApi("GET", endpoint);
    } catch (error) {
      console.error("Health check failed:", error);
      throw error;
    }
  },

  // Authentication endpoints
  async loginUser(credentials) {
    try {
      const endpoint = "/employee/login";
      return await this.hitApi("POST", endpoint, credentials, "application/json", false);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  async logoutUser() {
    try {
      const endpoint = "/employee/logout";
      return await this.hitApi("POST", endpoint, {}, "application/json", true);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  },

  async refreshToken(refreshData) {
    try {
      const endpoint = "/employee/refresh-token";
      return await this.hitApi("POST", endpoint, refreshData, "application/json", false);
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw error;
    }
  },

  async updateUserPassword(passwordData) {
    try {
      const endpoint = "/employee/update-password";
      return await this.hitApi("PUT", endpoint, passwordData, "application/json", false);
    } catch (error) {
      console.error("Password update failed:", error);
      throw error;
    }
  },

  // user login and creation apis
  // create client instance

  async createEmployee(payload) {
    try {
      const endpoint = "/employee/create";
      return await this.hitApi("POST", endpoint, payload);
    } catch (error) {
      console.error("Error creating client:", error.data);
      throw error;
    }
  },
  async getEmployees(payload) {
    try {
      const endpoint = `/client/clientInfo?page=${
        payload.page || ""
      }&pagesize=${payload.pagesize || ""}&search_string=${
        payload.search_string || ""
      }`;
      return await this.hitApi("GET", endpoint);
    } catch (error) {
      console.error(
        "Error fetching clients:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
 
  
};
