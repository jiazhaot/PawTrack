const API_BASE_URL = 'https://pawtrack.xyz/api';

export interface Route {
  ID: number;
  userId: number;
  dogId: number;
  pointCount: number;
  createdTime: string;
  updatedTime: string;
}

export interface RoutePoint {
  ID: number;
  routeId: number;
  longitude: number;
  latitude: number;
  createdTime: string;
}

export interface RouteDetail {
  route: Route;
  routePoints: RoutePoint[];
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

export class RouteApiService {
  private static authToken: string | null = null;

  static setToken(token: string | null) {
    this.authToken = token;
  }

  private static getAuthHeaders(): Record<string, string> {
    return this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {};
  }

  private static async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async createRoute(dogId: number): Promise<Route> {
    const response = await this.request<Route>('/route/createRoute', {
      method: 'POST',
      body: JSON.stringify({ dogId }),
    });

    if (response.code !== 0) {
      throw new Error(response.message || 'Failed to create route');
    }

    return response.data;
  }

  static async listAllRoutes(): Promise<Route[]> {
    console.log('🌐 RouteApiService: Making API call to listAllRoutes');
    console.log('🔑 RouteApiService: Using token:', this.authToken ? 'Token present' : 'No token');

    const response = await this.request<Route[]>('/route/listAllRoutes', {
      method: 'GET',
    });

    console.log('📡 RouteApiService: API response code:', response.code);
    console.log('📡 RouteApiService: API response message:', response.message);
    console.log('📡 RouteApiService: API response data length:', response.data?.length || 0);

    if (response.code !== 0) {
      throw new Error(response.message || 'Failed to fetch routes');
    }

    return response.data;
  }

  static async updateRouteLocation(
    routeId: number,
    longitude: number,
    latitude: number
  ): Promise<void> {
    const response = await this.request<null>('/route/updateRouteLocation', {
      method: 'POST',
      body: JSON.stringify({
        routeId,
        longitude,
        latitude,
      }),
    });

    if (response.code !== 0) {
      throw new Error(response.message || 'Failed to update route location');
    }
  }

  static async getRouteDetail(routeId: number): Promise<RouteDetail> {
    console.log('🔍 RouteApiService: Getting route detail for ID:', routeId);

    const response = await this.request<RouteDetail>(
      `/route/getRouteDetail?routeId=${routeId}`,
      {
        method: 'GET',
      }
    );

    console.log('📡 RouteApiService: Route detail response code:', response.code);
    console.log('📡 RouteApiService: Route detail response message:', response.message);
    console.log('📍 RouteApiService: Route points count:', response.data?.routePoints?.length || 0);

    if (response.code !== 0) {
      throw new Error(response.message || 'Failed to fetch route detail');
    }

    return response.data;
  }
}