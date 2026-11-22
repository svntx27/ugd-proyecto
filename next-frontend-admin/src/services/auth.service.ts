import { api } from './api';

export interface LoginCredentials {
    correoElectronico: string;
    contrasena: string;
}

export interface AuthResponse {
    message?: string;
    error?: string;
    token?: string;
    role?: string;
    role_code?: string;
    full_name?: string;
    user?: {
        id: string;
        name: string;
        email: string;
        userType: string;
        role: {
            id: string;
            code: string;
            name: string;
        };
        permissions: string[];
    };
}

export interface AdminUser {
    id?: string;
    email?: string;
    full_name: string;
    role: string;
    role_code: string;
    role_name?: string;
    userType?: string;
    permissions: string[];
}

class AuthServiceFacade {
    getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('admin_token');
    }

    isTokenExpired(token?: string | null): boolean {
        const t = token ?? this.getToken();
        if (!t) return true;
        try {
            const parts = t.split('.');
            if (parts.length !== 3) return true;
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            if (!payload.exp) return false;
            return Date.now() >= payload.exp * 1000;
        } catch {
            return true;
        }
    }

    clearSession(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            sessionStorage.removeItem('admin_token');
            sessionStorage.removeItem('admin_user');

            // Expirar cookies en el navegador
            document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
            document.cookie = 'admin_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        }
    }

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const payload = {
            email: credentials.correoElectronico,
            password: credentials.contrasena,
        };
        const response = await api.post<AuthResponse>('/auth/admin-login', payload);
        if (response.token && typeof window !== 'undefined') {
            localStorage.setItem('admin_token', response.token);
            const user: AdminUser = {
                id: response.user?.id,
                email: response.user?.email || payload.email,
                full_name: response.full_name || response.user?.name || '',
                role: response.role || 'admin',
                role_code: response.role_code || response.user?.role?.code || 'ANALISTA_PROCESOS',
                role_name: response.user?.role?.name || (response.role_code ? response.role_code.replace(/_/g, ' ') : 'Administrador'),
                userType: response.user?.userType || 'Personal UGD',
                permissions: response.user?.permissions || [],
            };
            localStorage.setItem('admin_user', JSON.stringify(user));

            // Sincronizar cookies como session-cookies (sin max-age persistente de 24h)
            // para que al cerrar el navegador o reiniciar dev servers no queden huérfanas
            const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
            document.cookie = `admin_token=${response.token}; path=/; SameSite=Lax${isSecure}`;
            document.cookie = `admin_role=${user.role_code}; path=/; SameSite=Lax${isSecure}`;
        } else if (!response.token) {
            throw new Error(response.error || 'No se recibió la clave de acceso (token).');
        }
        return response;
    }

    logout(): void {
        this.clearSession();
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    }

    isAuthenticated(): boolean {
        if (typeof window === 'undefined') return false;
        const token = localStorage.getItem('admin_token');
        if (!token) return false;
        if (this.isTokenExpired(token)) {
            this.clearSession();
            return false;
        }
        return true;
    }

    getCurrentUser(): AdminUser | null {
        if (typeof window === 'undefined') return null;
        if (!this.isAuthenticated()) return null;
        const userStr = localStorage.getItem('admin_user');
        if (!userStr) return null;
        try {
            const user = JSON.parse(userStr) as AdminUser;
            if (user?.role_code && !document.cookie.includes('admin_role=')) {
                const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
                document.cookie = `admin_role=${user.role_code}; path=/; SameSite=Lax${isSecure}`;
            }
            return user;
        } catch {
            this.clearSession();
            return null;
        }
    }

    hasRole(allowedRoles: string | string[]): boolean {
        const user = this.getCurrentUser();
        if (!user) return false;
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        return roles.includes(user.role_code);
    }

    hasPermission(permissionCode: string): boolean {
        const user = this.getCurrentUser();
        if (!user) return false;
        // Desarrollador tiene todos los permisos por defecto
        if (user.role_code === 'DESARROLLADOR') return true;
        return (user.permissions || []).includes(permissionCode);
    }
}

export const AuthService = new AuthServiceFacade();
