
// User Signup payload
export interface SignUpPayload {
  username: string;
  nickname: string;
  password: string;
  email: string;
  dateOfBirth: string;
  gender: 'female' | 'male' | 'other' | 'prefer_not_to_say';
  language: string[];
  roles: string[];
}

// User login response
export interface LoginResponse {
  token: string;
}

import { WeatherApiResponse } from '../types/weather';


export type PersonalityTag =
  | 'friendly'
  | 'outgoing'
  | 'playful'
  | 'loyal'
  | 'gentle'
  | 'curious'
  | 'energetic'
  | 'affectionate'
  | 'independent'
  | 'calm';

export interface DogData {
  ID?: number;
  userId?: number;
  name: string;
  breed: string;
  customizedBreed?: string;
  gender: 'male' | 'female' | 'other';
  weight: number;
  healthCondition: string;
  img: string;
  age: 'young' | 'adult' | 'old';
  personality?: PersonalityTag[];
  createdTime?: string;
  longitude?: number | null;
  latitude?: number | null;
  locationUpdatedTime?: string | null;
}

export interface ImageUploadResponse {
  url: string;
}

// Bin interfaces
export interface BinData {
  ID?: number; // Backend uses uppercase ID
  id?: number; // Alternative for compatibility
  latitude: number;
  longitude: number;
  UserId?: number; // Backend field name (uppercase)
  userId?: number; // Alternative for compatibility
  CreatedTime?: string; // Backend field name (uppercase)
  createdTime?: string; // Alternative for compatibility
  createdBy?: string; // Frontend computed field
  isOwned?: boolean; // Frontend computed field, used to distinguish whether it was created by oneself
}

export interface CreateBinPayload {
  latitude: number;
  longitude: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const BASE_URL = 'https://pawtrack.xyz/api';

export class ApiService {
  private static authToken: string | null = null;

  static setToken(token: string | null) {
    this.authToken = token;
  }

static async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Invalid username or password.');
    }

    const data = await response.json();

    if (data.code === 0 && data.data) {

      const tokenString = data.data.accessToken; 
      
      if (!tokenString) {
        throw new Error('Login response data did not include an accessToken field.');
      }
      

      return { token: tokenString };

    } else {
      throw new Error(data.message || "Login failed: Invalid response format.");
    }
  }



  static async createUser(userData: SignUpPayload): Promise<any> {
    const response = await fetch(`${BASE_URL}/auth/createUser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create account.');
    }
    return response.json();
  }

  private static getAuthHeaders(): Record<string, string> {
    // Backend expects the entire JSON string as the token, not the parsed JWT
    return this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {};
  }

  static getCurrentUserId(): number | null {
    if (!this.authToken) {
      console.log('No auth token available');
      return null;
    }

    try {
      // Parse JWT token to get user ID
      const parts = this.authToken.split('.');
      if (parts.length !== 3) {
        console.error('Invalid JWT token format');
        return null;
      }

      const payload = JSON.parse(atob(parts[1]));
      console.log('JWT payload:', payload);
      const userId = payload.userId || payload.sub || payload.id || null;
      console.log('Extracted user ID:', userId);
      return userId;
    } catch (error) {
      console.error('Failed to parse JWT token:', error);
      return null;
    }
  }

  static async createImage(imageUri: string): Promise<ImageUploadResponse> {
    const formData = new FormData();
    
    formData.append('type', 'image');
    
    // Add the file parameter
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);

    const response = await fetch(`${BASE_URL}/common/createImage`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload error:', response.status, errorText);
      throw new Error(`Failed to upload image: ${response.status}`);
    }

    const data = await response.json();
    console.log('Image upload response:', data);
    
    // Handle the API response format: { code: 0, data: "url", message: "ok" }
    if (data.code === 0 && data.data) {
      return { url: data.data };
    } else {
      console.error('Unexpected response format:', data);
      throw new Error('Invalid response format from server');
    }
  }

  static async createDog(dogData: DogData): Promise<ApiResponse<any>> {
    
    const response = await fetch(`${BASE_URL}/dog/createDog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(dogData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error from server: ${response.status}`);
      console.error('Full error response from server:', errorText);

      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || 'Failed to create dog profile.');
      } catch (e) {
        throw new Error(`Failed to create dog profile. Server responded with status ${response.status}.`);
      }
    }

    const data = await response.json();
    return data;
  }

  static async getDogProfile(): Promise<ApiResponse<DogData | null>> {
    try {
      const response = await fetch(`${BASE_URL}/dog/listDog`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
      });

      if (response.status === 404) {
        return { success: true, data: null };
      }

      if (!response.ok) {
        throw new Error('Failed to fetch dog profile');
      }

      const data = await response.json();
      console.log('getDogProfile raw response:', data);
      
      if (data.code === 0) {
        // If response format is { code: 0, data: [...] }
        return { success: true, data: data.data && data.data.length > 0 ? data.data[0] : null };
      } else if (Array.isArray(data)) {
        // If response is directly an array
        return { success: true, data: data.length > 0 ? data[0] : null };
      } else {
        // If response is a single object
        return { success: true, data: data };
      }
    } catch (error) {
      return { success: true, data: null };
    }
  }

  static async listCurrentDog(): Promise<ApiResponse<DogData[]>> {
    try {
      const response = await fetch(`${BASE_URL}/dog/listCurrentDog`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch current dogs');
      }

      const data = await response.json();

      if (data.code === 0) {
        return { success: true, data: data.data || [] };
      } else {
        return { success: false, data: [], message: data.message };
      }
    } catch (error) {
      console.error('List current dogs error:', error);
      return { success: false, data: [], message: 'Failed to fetch dogs' };
    }
  }

  static async getWeather(longitude: number, latitude: number): Promise<WeatherApiResponse> {
    try {
      const url = `${BASE_URL}/common/getWeather?longitude=${longitude}&latitude=${latitude}`;

      const authHeaders = this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      });

      console.log('🌤️ Weather API status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🌤️ Weather API error response:', errorText);
        throw new Error(`Failed to fetch weather data: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Weather fetch error:', error);
      throw error;
    }
  }

  // Bin-related API methods
  static async createBin(binData: CreateBinPayload): Promise<ApiResponse<BinData>> {
    try {
      const response = await fetch(`${BASE_URL}/bin/createBin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(binData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create bin');
      }

      const data = await response.json();
      console.log('Create bin response:', data);
      
      // Handle the backend response format: { code: 0, message: "ok", data: binObject }
      if (data.code === 0 && data.data) {
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || 'Failed to create bin');
      }
    } catch (error) {
      console.error('Create bin error:', error);
      throw error;
    }
  }

  // Note: This method is deprecated. Use listAllBins() or listMyBins() instead.
  // The backend doesn't have a getBins endpoint with location filtering.
  static async getBins(latitude: number, longitude: number, radius: number = 1000): Promise<ApiResponse<BinData[]>> {
    console.warn('getBins method is deprecated. Use listAllBins() or listMyBins() instead.');
    return this.listAllBins();
  }

  static async deleteBin(binId: number): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${BASE_URL}/bin/deleteBin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ id: binId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete bin');
      }

      const data = await response.json();
      console.log('Delete bin response:', data);
      
      // Handle the backend response format: { code: 0, message: "ok", data: ... }
      if (data.code === 0) {
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || 'Failed to delete bin');
      }
    } catch (error) {
      console.error('Delete bin error:', error);
      throw error;
    }
  }

  static async listMyBins(): Promise<ApiResponse<BinData[]>> {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      };
      console.log('ListMyBins request headers:', headers);
      console.log('ListMyBins URL:', `${BASE_URL}/bin/listMyBins`);

      const response = await fetch(`${BASE_URL}/bin/listMyBins`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        console.error('ListMyBins API error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('ListMyBins error response:', errorText);
        throw new Error(`Failed to fetch my bins: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('List my bins response:', data);

      // Handle the backend response format: { code: 0, message: "ok", data: binArray }
      if (data.code === 0 && data.data) {
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || 'Failed to fetch my bins');
      }
    } catch (error) {
      console.error('List my bins error:', error);
      throw error;
    }
  }

  static async listAllBins(): Promise<ApiResponse<BinData[]>> {
    try {
      const response = await fetch(`${BASE_URL}/bin/listAllBins`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
      });

      if (!response.ok) {
        console.error('ListAllBins API error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('ListAllBins error response:', errorText);
        throw new Error(`Failed to fetch all bins: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('List all bins response:', data);

      // Handle the backend response format: { code: 0, message: "ok", data: binArray }
      if (data.code === 0 && data.data) {
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || 'Failed to fetch all bins');
      }
    } catch (error) {
      console.error('List all bins error:', error);
      throw error;
    }
  }
}