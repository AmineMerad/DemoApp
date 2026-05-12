import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string | null;
}

interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

class AuthService {
  private accessToken: string | null = null;

  constructor() {
    this.loadToken();
  }

  private async loadToken() {
    this.accessToken = await AsyncStorage.getItem("access_token");
  }

  async register(email: string, password: string, name: string): Promise<User> {
    const response = await axios.post<AuthResponse>(`${API_URL}/auth/register/`, {
      email,
      password,
      name,
    });

    await this.setTokens(response.data.access, response.data.refresh);
    await this.setStoredUser(response.data.user);
    return response.data.user;
  }

  async login(email: string, password: string): Promise<User> {
    const response = await axios.post<AuthResponse>(`${API_URL}/auth/login/`, {
      email,
      password,
    });

    await this.setTokens(response.data.access, response.data.refresh);
    await this.setStoredUser(response.data.user);
    return response.data.user;
  }

  async logout(): Promise<void> {
    const refresh = await AsyncStorage.getItem("refresh_token");
    const access = await this.getAccessToken();
    if (refresh) {
      try {
        await axios.post(`${API_URL}/auth/logout/`, { refresh }, {
          headers: { Authorization: `Bearer ${access}` }
        });
      } catch {
        // Ignore errors on logout
      }
    }

    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("refresh_token");
    await AsyncStorage.removeItem("user");
    this.accessToken = null;
  }

  async getUser(): Promise<User> {
    const token = await this.getAccessToken();
    if (!token) throw new Error("Not authenticated");

    const response = await axios.get<User>(`${API_URL}/auth/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    await this.setStoredUser(response.data);
    return response.data;
  }

  async updateProfile(data: { name?: string; avatar?: string }): Promise<User> {
    const token = await this.getAccessToken();
    if (!token) throw new Error("Not authenticated");

    const formData = new FormData();
    if (data.name) {
      formData.append("name", data.name);
    }
    if (data.avatar) {
      const filename = data.avatar.split("/").pop() || "avatar.jpg";
      const ext = filename.split(".").pop() || "jpg";
      formData.append("avatar", {
        uri: data.avatar,
        type: `image/${ext === "png" ? "png" : "jpeg"}`,
        name: filename,
      } as any);
    }

    const response = await axios.patch<User>(
      `${API_URL}/auth/profile/`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const user = response.data;
    await AsyncStorage.setItem("user", JSON.stringify(user));
    return user;
  }

  async getAccessToken(): Promise<string | null> {
    if (!this.accessToken) {
      await this.loadToken();
    }
    return this.accessToken;
  }

  async refreshToken(): Promise<string | null> {
    const refresh = await AsyncStorage.getItem("refresh_token");
    if (!refresh) return null;

    try {
      const response = await axios.post<{ access: string }>(`${API_URL}/token/refresh/`, {
        refresh,
      });

      await this.setTokens(response.data.access, refresh);
      return response.data.access;
    } catch {
      await this.logout();
      return null;
    }
  }

  private async setTokens(access: string, refresh: string): Promise<void> {
    this.accessToken = access;
    await AsyncStorage.setItem("access_token", access);
    await AsyncStorage.setItem("refresh_token", refresh);
  }

  private async setStoredUser(user: User): Promise<void> {
    await AsyncStorage.setItem("user", JSON.stringify(user));
  }
}

export const authService = new AuthService();
