import { api } from './api';

export interface User {
    id: string | number;
    doctorando_id?: string;
    full_name?: string;
    name?: string;
    email: string;
    cedula?: string;
    role?: string;
    role_code?: string;
    role_name?: string;
    userType?: string;
    estado?: string; // "activo" | "inactivo" | "preregistrado"
    isActive?: boolean;
    isPreRegistered?: boolean;
    hasAccount?: boolean;
    created_at?: string;
}

export interface Demograficos {
    cedula: string;
    nombres: string;
    apellidos: string;
    sexo?: string | null;
    fechaNacimiento?: string | null;
    telefono?: string | null;
    correoInstitucional: string;
}

export interface Academico {
    facultad?: string | null;
    facultadCodigo?: string | null;
    carrera?: string | null;
    carpetaFisica?: string | null;
    numeroOrden?: number | null;
    tituloTercerNivel?: string | null;
    tituloCuartoNivel?: string | null;
}

export interface AdendaContrato {
    id: string;
    expedienteId?: string;
    numeroAdenda: number;
    fechaInicio?: string | null;
    fechaFin?: string | null;
    meses?: number | null;
    tipoModificacion?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface Devengamiento {
    id: string;
    expedienteId?: string;
    fechaInicio?: string | null;
    tiempoTexto?: string | null;
    fechaFinEstimada?: string | null;
    oficioNotificacion?: string | null;
    oficioActaTerminacion?: string | null;
    oficioCierreProyecto?: string | null;
    registroSenescyt?: string | null;
    estado: string; // "PENDIENTE" | "EN_CURSO" | "FINALIZADO"
    createdAt?: string;
    updatedAt?: string;
}

export interface ExpedienteDoctoral {
    id: string;
    estado: string;
    tituloInvestigacion?: string | null;
    programaDoctoral?: string | null;
    tituloAObtener?: string | null;
    institucionDestino?: string | null;
    paisDestino?: string | null;
    convenio?: string | null;
    tipoFinanciamiento: string;
    tieneApoyoProyecto: boolean;
    tieneAlertaLegal: boolean;
    contratoInicio?: string | null;
    contratoFin?: string | null;
    contratoMeses?: number | null;
    oficioRegistroProyecto?: string | null;
    fechaOficioRegistro?: string | null;
    observaciones?: string | null;
    adendas?: AdendaContrato[];
    devengamiento?: Devengamiento | null;
}

export interface UserAppointment {
    id: number;
    date: string;
    startTime: string;
    subject: string;
    status: string;
    representative: string;
}

export interface PermissionDetail {
    code: string;
    name: string;
    category?: string | null;
    description?: string | null;
}

export interface UserDetail extends User {
    role_description?: string;
    permissions?: string[];
    permissionsDetailed?: PermissionDetail[];
    demograficos?: Demograficos | null;
    academico?: Academico | null;
    expedientes?: ExpedienteDoctoral[];
    appointments?: UserAppointment[];
    updated_at?: string;
}

export interface NewDoctorandoPayload {
    cedula: string;
    nombres: string;
    apellidos: string;
    correoInstitucional: string;
    telefono?: string | null;
    sexo?: string | null;
    fechaNacimiento?: string | null;
    tituloTercerNivel?: string | null;
    tituloCuartoNivel?: string | null;
    carpeta?: string | null;
    numeroOrden?: number | null;
}

export interface UpdateUserPayload extends Partial<User>, Partial<Demograficos>, Partial<Academico> {
    nombres?: string;
    apellidos?: string;
    carpeta?: string | null;
    numeroOrden?: number | null;
    facultad?: string | null;
    carrera?: string | null;
    programaDoctoral?: string | null;
    tituloAObtener?: string | null;
    institucionDestino?: string | null;
    paisDestino?: string | null;
    convenio?: string | null;
    tituloInvestigacion?: string | null;
    estadoExpediente?: string | null;
    tipoFinanciamiento?: string | null;
    contratoInicio?: string | null;
    contratoFin?: string | null;
    contratoMeses?: number | null;
    tieneApoyoProyecto?: boolean;
    oficioRegistroProyecto?: string | null;
    fechaOficioRegistro?: string | null;
    observaciones?: string | null;
    tieneAlertaLegal?: boolean;
    adendas?: Array<{
        id?: string;
        numeroAdenda: number;
        tipoModificacion?: string | null;
        meses?: number | null;
        fechaInicio?: string | null;
        fechaFin?: string | null;
    }>;
    registroSenescyt?: string | null;
    tiempoTexto?: string | null;
    devengamientoFechaInicio?: string | null;
    devengamientoFechaFinEstimada?: string | null;
    devengamientoEstado?: string | null;
    oficioNotificacion?: string | null;
    oficioActaTerminacion?: string | null;
    oficioCierreProyecto?: string | null;
}

class UserServiceFacade {
    async listUsers(): Promise<User[]> {
        const res = await api.get<any>('/users');
        if (Array.isArray(res)) return res;
        return res.users || [];
    }

    async getUser(id: string | number): Promise<UserDetail> {
        return api.get<UserDetail>(`/users/${id}`);
    }

    async createUser(data: Partial<User> & { password?: string }): Promise<User> {
        return api.post<User>('/users', data);
    }

    async registerDoctorando(data: NewDoctorandoPayload): Promise<User> {
        return api.post<User>('/users/estudiantes', data);
    }

    async updateUser(id: string | number, data: UpdateUserPayload): Promise<User> {
        return api.put<User>(`/users/${id}`, data);
    }

    async updatePassword(id: string | number, password: string): Promise<{ success: boolean; message: string }> {
        return api.put<{ success: boolean; message: string }>(`/users/${id}/password`, { password });
    }
}

export const UserService = new UserServiceFacade();
