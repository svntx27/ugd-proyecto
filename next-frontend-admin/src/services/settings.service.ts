import { api, API_BASE_URL } from './api';

export interface SystemSetting {
    key: string;
    value: any;
    description?: string;
}

export const SettingsService = {
    getSettings: async (): Promise<SystemSetting[]> => {
        return api.get<SystemSetting[]>('/settings');
    },

    updateSetting: async (key: string, value: any): Promise<SystemSetting> => {
        return api.put<SystemSetting>('/settings', { key, value });
    },

    bulkUpdateSettings: async (settingsObj: Record<string, any>): Promise<SystemSetting[]> => {
        return api.post<SystemSetting[]>('/settings/bulk', { settings: settingsObj });
    },

    downloadDatabaseBackup: async (password: string): Promise<void> => {
        const token = localStorage.getItem('admin_token');
        const response = await fetch(`${API_BASE_URL}/settings/backup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token || ''}`,
            },
            body: JSON.stringify({ password }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || 'Error al descargar respaldo de la base de datos');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const dateStr = new Date().toISOString().split('T')[0];
        a.download = `UGD_Database_Backup_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },

    purgeHistory: async (targetStatuses: string[]): Promise<{ message: string, deleted_rows: number }> => {
        return api.post<{ message: string, deleted_rows: number }>('/settings/purge-history', { targetStatuses });
    }
};
