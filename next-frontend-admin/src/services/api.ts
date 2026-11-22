export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('admin_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    private async handleResponse<T>(response: Response, isAuthEndpoint: boolean = false): Promise<T> {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || errorData.message || `Error ${response.status}: ${response.statusText}`;

            const isLockdown = response.status === 503 && (
                errorData.code === 'PLATFORM_LOCKDOWN' ||
                (typeof errorMessage === 'string' && errorMessage.includes('PLATFORM_LOCKDOWN'))
            );

            if (isLockdown && !isAuthEndpoint) {
                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                    localStorage.removeItem('admin_token');
                    localStorage.removeItem('admin_user');
                    sessionStorage.removeItem('admin_token');
                    sessionStorage.removeItem('admin_user');
                    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
                    document.cookie = 'admin_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
                    window.location.href = '/login?maintenance=true';
                }
            }

            const isAuthFailure = response.status === 401 || (
                response.status === 403 && typeof errorMessage === 'string' && (
                    errorMessage.toLowerCase().includes('token') ||
                    errorMessage.toLowerCase().includes('expirado') ||
                    errorMessage.toLowerCase().includes('inactivo') ||
                    errorMessage.toLowerCase().includes('no autenticado')
                )
            );

            if (isAuthFailure && !isAuthEndpoint) {
                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                    localStorage.removeItem('admin_token');
                    localStorage.removeItem('admin_user');
                    sessionStorage.removeItem('admin_token');
                    sessionStorage.removeItem('admin_user');
                    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
                    document.cookie = 'admin_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
                    window.location.href = '/login';
                }
            }
            throw new Error(errorMessage);
        }

        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    }

    public async get<T>(url: string): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        return this.handleResponse<T>(response, url.includes('/auth/'));
    }

    public async post<T>(url: string, body: unknown): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(body),
        });
        return this.handleResponse<T>(response, url.includes('/auth/'));
    }

    public async patch<T>(url: string, body: unknown): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify(body),
        });
        return this.handleResponse<T>(response, url.includes('/auth/'));
    }

    public async put<T>(url: string, body: unknown): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(body),
        });
        return this.handleResponse<T>(response, url.includes('/auth/'));
    }

    public async delete<T>(url: string): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });
        return this.handleResponse<T>(response, url.includes('/auth/'));
    }
}

export const api = new ApiClient();
