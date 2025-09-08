import { apiService } from '../apiservice/api';

class AuthService {
  constructor() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  // Process failed requests queue after token refresh
  processQueue(error, token = null) {
    this.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  // Set tokens in storage and memory
  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  // Clear all tokens
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.accessToken;
  }

  // Get current access token
  getAccessToken() {
    return this.accessToken;
  }

  // Login user
  async login(email, password) {
    try {
      const response = await apiService.loginUser({ email, password });
      
      if (response.accessToken && response.refreshToken) {
        this.setTokens(response.accessToken, response.refreshToken);
        return {
          success: true,
          user: response.user,
          message: response.message
        };
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed'
      };
    }
  }

  // Logout user
  async logout() {
    try {
      // Call logout endpoint if token exists
      if (this.accessToken) {
        await apiService.logoutUser();
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API fails
    } finally {
      this.clearTokens();
    }
  }

  // Refresh access token
  async refreshAccessToken() {
    if (this.isRefreshing) {
      // If already refreshing, wait for it to complete
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    this.isRefreshing = true;

    try {
      const response = await apiService.refreshToken({ refreshToken: this.refreshToken });
      
      if (response.accessToken && response.refreshToken) {
        this.setTokens(response.accessToken, response.refreshToken);
        this.processQueue(null, response.accessToken);
        return response.accessToken;
      }
      
      throw new Error('Invalid refresh response');
    } catch (error) {
      this.processQueue(error, null);
      this.clearTokens();
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Update password
  async updatePassword(email, oldPassword, newPassword) {
    try {
      const response = await apiService.updateUserPassword({
        email,
        oldPassword,
        newPassword
      });
      
      return {
        success: true,
        message: response.message,
        user: response.user
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Password update failed'
      };
    }
  }

  // Get user info from token (decode JWT)
  getUserInfo() {
    if (!this.accessToken) return null;
    
    try {
      const payload = JSON.parse(atob(this.accessToken.split('.')[1]));
      return {
        id: payload.id,
        email: payload.email,
        userName: payload.userName,
        role: payload.role,
        employeeName: payload.employeeName,
        employeeNumber: payload.employeeNumber
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Check if token is expired
  isTokenExpired() {
    if (!this.accessToken) return true;
    
    try {
      const payload = JSON.parse(atob(this.accessToken.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  // Get authorization header
  getAuthHeader() {
    return this.accessToken ? `Bearer ${this.accessToken}` : null;
  }

  // Auto-refresh token if needed
  async ensureValidToken() {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    if (this.isTokenExpired()) {
      if (!this.refreshToken) {
        throw new Error('Token expired and no refresh token available');
      }
      
      try {
        await this.refreshAccessToken();
      } catch (error) {
        this.clearTokens();
        throw new Error('Token refresh failed');
      }
    }

    return this.accessToken;
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
