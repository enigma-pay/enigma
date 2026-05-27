export interface User {
  user_name: string;
  email: string;
  sol_public_key: string;
  avatar_id: string;
  created_at: string;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";

export interface ApiEndpoint {
  path: string;
  method: HttpMethod;
  headers?: Record<string, string> | null;
  body_schema?: Record<string, unknown> | null;
  query_params?: Record<string, unknown> | null;
  cost_per_request?: number | null;
}

export interface PaymentConfig {
  cost_per_request: number;
  enabled: boolean;
}

export interface Api {
  id: string;
  user_name: string;
  name: string;
  description?: string | null;
  category?: string | null;
  base_url: string;
  endpoints: ApiEndpoint[];
  payment_config?: PaymentConfig | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  user_name: string;
  email: string;
  sol_public_key: string;
  avatar_id?: string;
}

export interface CreateApiRequest {
  name: string;
  description?: string | null;
  category?: string | null;
  base_url: string;
  endpoints: ApiEndpoint[];
  payment_config?: PaymentConfig | null;
}
