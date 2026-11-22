import { api } from './api';

export interface Representative {
    id: number;
    nombre: string;
    name?: string;
    title?: string;
    ubicacion: string;
    location?: string;
    capacidad: number;
    capacity?: number;
    estado?: string;
    status?: string;
    userId?: string | null;
    email?: string | null;
    role?: string | null;
    roleCode?: string | null;
}

export interface CreateRepresentativePayload {
    nombre: string;
    title?: string;
    ubicacion?: string;
    capacidad?: number;
    estado?: string;
    email?: string | null;
    password?: string;
    roleCode?: string | null;
}

export type Lab = Representative;

export interface Appointment {
    id: number;
    user_id?: string | number;
    representative_id?: number;
    lab_id?: number;
    fecha: string;
    hora_inicio: string | number;
    materia: string;
    estado: string;
    representative_nombre?: string;
    lab_nombre?: string;
    user_nombre?: string;
    user_email?: string;
    usuario_nombre?: string;
    usuario_email?: string;
}

export type Reservation = Appointment;

export interface CreateBookingRequest {
    representative_id?: number;
    lab_id?: number;
    fecha: string;
    horas: (string | number)[];
    materia: string;
}

class AppointmentServiceFacade {
    async listRepresentatives(): Promise<Representative[]> {
        try {
            const reps = await api.get<any[]>('/representatives');
            return reps.map(r => ({
                id: r.id,
                nombre: r.name || r.nombre,
                name: r.name || r.nombre,
                title: r.title || 'Analista UGD',
                ubicacion: r.location || r.ubicacion,
                location: r.location || r.ubicacion,
                capacidad: r.capacity || r.capacidad || 1,
                capacity: r.capacity || r.capacidad || 1,
                estado: r.status || r.estado || 'activo',
                status: r.status || r.estado || 'activo',
                userId: r.userId || null,
                email: r.email || null,
                role: r.role || null,
                roleCode: r.roleCode || null,
            }));
        } catch (error) {
            console.error('Error al obtener representantes:', error);
            return [];
        }
    }

    async createRepresentative(data: CreateRepresentativePayload): Promise<Representative> {
        return api.post<Representative>('/representatives', data);
    }

    async updateRepresentative(id: number, data: Partial<CreateRepresentativePayload>): Promise<Representative> {
        return api.put<Representative>(`/representatives/${id}`, data);
    }

    async deleteRepresentative(id: number): Promise<{ success: boolean }> {
        return api.delete<{ success: boolean }>(`/representatives/${id}`);
    }

    async getAvailability(representativeId: number, fecha: string): Promise<Record<string, unknown>[]> {
        return api.get<Record<string, unknown>[]>(`/representatives/disponibilidad?representative_id=${representativeId}&fecha=${fecha}`);
    }

    async getAppointments(): Promise<Appointment[]> {
        try {
            return await api.get<Appointment[]>('/appointments/admin');
        } catch (error) {
            console.error('Error al obtener citas UGD:', error);
            return [];
        }
    }

    async createAppointment(request: CreateBookingRequest): Promise<Appointment> {
        const payload = {
            representative_id: request.representative_id || request.lab_id,
            fecha: request.fecha,
            horas: request.horas,
            materia: request.materia,
        };
        return api.post<Appointment>('/appointments/agendar', payload);
    }

    async cancelAppointment(id: number): Promise<{ message: string }> {
        return api.delete<{ message: string }>(`/appointments/citas/${id}`);
    }

    async adminCancelAppointment(id: number): Promise<{ message: string }> {
        return api.delete<{ message: string }>(`/appointments/admin/${id}`);
    }

    async adminRescheduleAppointment(id: number, fecha: string, hora_inicio: string | number): Promise<{ message: string, appointment: Appointment }> {
        return api.patch<{ message: string, appointment: Appointment }>(`/appointments/admin/${id}/reschedule`, { fecha, hora_inicio });
    }

    // Aliases de compatibilidad
    async listLabs() { return this.listRepresentatives(); }
    async createLab(data: Omit<Representative, 'id'>) { return this.createRepresentative(data); }
    async updateLab(id: number, data: Omit<Representative, 'id'>) { return this.updateRepresentative(id, data); }
    async deleteLab(id: number) { return this.deleteRepresentative(id); }
    async getReservations() { return this.getAppointments(); }
    async createBooking(request: CreateBookingRequest) { return this.createAppointment(request); }
    async rescheduleReservation(id: number, fecha: string, hora_inicio: string | number) { return this.adminRescheduleAppointment(id, fecha, hora_inicio); }
}

export const AppointmentService = new AppointmentServiceFacade();
export const LabService = AppointmentService;
