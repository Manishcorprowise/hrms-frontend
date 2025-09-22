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
          "X-File-Base-Url": apiUrl.apiEndPoint.replace('/api', '/api/files'),
          "X-Frontend-Base-Url": apiUrl.frontendBaseUrl,
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
      return await this.hitApi("POST", endpoint, passwordData, "application/json", false);
    } catch (error) {
      console.error("Password update failed:", error);
      throw error;
    }
  },

  // Personal Details APIs
  async getPersonalDetails(employeeId) {
    try {
      const endpoint = `/personal-details/${employeeId}`;
      return await this.hitApi("GET", endpoint);
    } catch (error) {
      console.error("Error fetching personal details:", error.response?.data || error.message);
      throw error;
    }
  },

  async updatePersonalDetails(employeeId, data) {
    try {
      const endpoint = `/personal-details/update/${employeeId}`;
      return await this.hitApi("POST", endpoint, data);
    } catch (error) {
      console.error("Error updating personal details:", error.response?.data || error.message);
      throw error;
    }
  },

  async createPersonalDetails(employeeId, data) {
    try {
      const endpoint = `/personal-details/${employeeId}`;
      return await this.hitApi("POST", endpoint, data);
    } catch (error) {
      console.error("Error creating personal details:", error.response?.data || error.message);
      throw error;
    }
  },

  // Employee management APIs
  async createEmployee(payload) {
    try {
      const endpoint = "/employee/create";
      return await this.hitApi("POST", endpoint, payload);
    } catch (error) {
      console.error("Error creating employee:", error.response?.data || error.message);
      throw error;
    }
  },

  async updateEmployee(employeeId, payload) {
    try {
      const endpoint = `/employee/update-user/${employeeId}`;
      return await this.hitApi("POST", endpoint, payload);
    } catch (error) {
      console.error("Error updating employee:", error.response?.data || error.message);
      throw error;
    }
  },

  // Profile/File management APIs
  async getUserFiles(employeeId) {
    try {
      const endpoint = `/document/get-files?employeeId=${employeeId}`;
      return await this.hitApi("GET", endpoint);
    } catch (error) {
      console.error("Error fetching user files:", error.response?.data || error.message);
      throw error;
    }
  },

  async uploadFile(fileData) {
    try {
      const endpoint = `/document/upload`;
      return await this.hitApi("POST", endpoint, fileData, "application/json");
    } catch (error) {
      console.error("Error uploading file:", error.response?.data || error.message);
      throw error;
    }
  },

  // async deleteFile(fileId) {
  //   try {
  //     const endpoint = `/document/file/${fileId}`;
  //     return await this.hitApi("DELETE", endpoint);
  //   } catch (error) {
  //     console.error("Error deleting file:", error.response?.data || error.message);
  //     throw error;
  //   }
  // },

  async getAllEmployees() {
    try {
      const endpoint = "/employee/all-users";
      return await this.hitApi("GET", endpoint);
    } catch (error) {
      console.error("Error fetching all employees:", error.response?.data || error.message);
      throw error;
    }
  },

  async getEmployeeById(employeeId) {
    try {
      const endpoint = `/employee/get-user/${employeeId}`;
      return await this.hitApi("GET", endpoint);
    } catch (error) {
      console.error("Error fetching employee by ID:", error.response?.data || error.message);
      throw error;
    }
  },
  async getRoleCodes(payload) {
    const endpoint = `/role/hrms?isParent=${payload?.isParent || ""}`;
    return await this.hitApi("GET", endpoint);
  },

  async getPositions(payload) {
    const {
      role_code = "",
      page = "",
      pagesize = "",
      search_string = "",
    } = payload;
    const endpoint = `/position/hrms?role_code=${role_code}&page=${page}&pagesize=${pagesize}&search_string=${search_string}`;
    return await this.hitApi("GET", endpoint);
  },

  async createUser(payload) {
    try {
      const endpoint = "/user/hrms";
      return await this.hitApi("POST", endpoint, payload);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },
 
  
};
