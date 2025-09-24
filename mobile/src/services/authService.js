import { apiService } from './apiService';

class AuthService {
  setTokens(tokens) {
    apiService.setTokens(tokens);
  }

  clearTokens() {
    apiService.clearTokens();
  }

  async login(email, password) {
    const response = await apiService.post('/auth/login', {
      email,
      password,
    });
    
    return response;
  }

  async register(userData) {
    const response = await apiService.post('/auth/register', userData);
    
    return response;
  }

  async logout(refreshToken) {
    await apiService.post('/auth/logout', {
      refreshToken,
    });
  }

  async logoutAll() {
    await apiService.post('/auth/logout-all');
  }

  async refreshToken(refreshToken) {
    const response = await apiService.post('/auth/refresh', {
      refreshToken,
    });
    
    return response;
  }

  async getProfile() {
    const response = await apiService.get('/auth/profile');
    
    return response;
  }

  async updateProfile(userData) {
    const response = await apiService.put('/auth/profile', userData);
    
    return response;
  }

  async changePassword(currentPassword, newPassword) {
    await apiService.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }
}

export const authService = new AuthService();
