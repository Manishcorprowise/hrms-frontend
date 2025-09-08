import axios from "axios";
import { apiUrl } from "./apiConfig";


export const apiService = {
  async hitApi(method, endpoint, body = {}, contentType = "") {
    try {
      const url = `${apiUrl.apiEndPoint}${endpoint}`;
      const options = {
        method: method,
        url: url,
        data: body,
        headers: {
          "Content-Type": contentType ? contentType : "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      };
      const response = await axios(options);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        const message = error.response.data.message || "Unauthorized access.";
        sessionStorage.clear();
        alert(message);
        window.location.href = "/login";
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
