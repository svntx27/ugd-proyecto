"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserService, UserDetail } from "@/services/user.service";
import { AuthService, AdminUser } from "@/services/auth.service";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { FichaDoctoralPDF } from "@/components/usuarios/FichaDoctoralPDF";
import { GraduationCap, AlertTriangle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { UserDetailHeader } from "@/components/usuarios/detalle/UserDetailHeader";
import { UserDetailTabsNav, UserDetailTabType } from "@/components/usuarios/detalle/UserDetailTabsNav";
import { TabExpedienteDoctoral } from "@/components/usuarios/detalle/TabExpedienteDoctoral";
import { TabDevengamiento } from "@/components/usuarios/detalle/TabDevengamiento";
import { TabFiliacion } from "@/components/usuarios/detalle/TabFiliacion";
import { TabUserAppointments } from "@/components/usuarios/detalle/TabUserAppointments";
import { UserStatusModal } from "@/components/usuarios/detalle/UserStatusModal";
import { UserDetailEditView } from "@/components/usuarios/detalle/UserDetailEditView";

const USER_APPOINTMENTS_PAGE_SIZE = 4;

const getInitials = (name?: string) => {
    if (!name) return "UG";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};

const formatDate = (dateString?: string | null) => {
    if (!dateString) return "No registrado";
    try {
        const d = new Date(dateString);
        return d.toLocaleDateString("es-EC", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return dateString;
    }
};

const parseObservacionesList = (text?: string | null): string[] => {
    if (!text || !text.trim()) return [];
    return text
        .split(/\r?\n+/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
};

interface UsuarioDetalleClientProps {
    initialUser?: UserDetail | null;
}

export function UsuarioDetalleClient({ initialUser }: UsuarioDetalleClientProps = {}) {
    const params = useParams();
    const router = useRouter();
    const userId = params?.id as string;

    const [user, setUser] = useState<UserDetail | null>(initialUser ?? null);
    const [loading, setLoading] = useState(!initialUser);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
    const [activeTab, setActiveTab] = useState<UserDetailTabType>("expediente");

    // Modo de Pantalla Completa para Actualizar Datos (sin modales)
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        nombres: "",
        apellidos: "",
        cedula: "",
        correoInstitucional: "",
        telefono: "",
        sexo: "",
        fechaNacimiento: "",
        tituloTercerNivel: "",
        tituloCuartoNivel: "",
        carpeta: "",
        numeroOrden: "",
        facultad: "",
        carrera: "",
        programaDoctoral: "",
        tituloAObtener: "",
        institucionDestino: "",
        paisDestino: "",
        convenio: "",
        tituloInvestigacion: "",
        estadoExpediente: "EN_ESTUDIOS",
        tipoFinanciamiento: "Beca",
        contratoInicio: "",
        contratoFin: "",
        contratoMeses: "",
        tieneApoyoProyecto: false,
        oficioRegistroProyecto: "",
        fechaOficioRegistro: "",
        observaciones: "",
        observacionesList: [] as string[],
        nuevaObservacion: "",
        tieneAlertaLegal: false,
        adendas: [] as Array<{
            id?: string;
            numeroAdenda: number;
            tipoModificacion: string;
            meses: string;
            fechaInicio: string;
            fechaFin: string;
        }>,
        nuevaAdenda: {
            tipoModificacion: "Ampliación",
            meses: "",
            fechaInicio: "",
            fechaFin: "",
        },
        registroSenescyt: "",
        tiempoTexto: "",
        devengamientoFechaInicio: "",
        devengamientoFechaFinEstimada: "",
        devengamientoEstado: "PENDIENTE",
        oficioNotificacion: "",
        oficioActaTerminacion: "",
        oficioCierreProyecto: "",
    });

    // Modal para alternar estado activo/inactivo de la cuenta
    const [showToggleModal, setShowToggleModal] = useState(false);
    const [toggling, setToggling] = useState(false);

    // Paginación de Citas Presenciales del usuario
    const [appointmentsPagination, setAppointmentsPagination] = useState<{ userId: string; page: number }>({
        userId,
        page: 1,
    });
    const userAppointments = user?.appointments ?? [];
    const totalUserAppointments = userAppointments.length;
    const totalAppointmentPages = Math.max(1, Math.ceil(totalUserAppointments / USER_APPOINTMENTS_PAGE_SIZE));
    const rawAppointmentsPage = appointmentsPagination.userId === userId ? appointmentsPagination.page : 1;
    const safeAppointmentsPage = Math.min(rawAppointmentsPage, totalAppointmentPages);
    const paginatedUserAppointments = userAppointments.slice(
        (safeAppointmentsPage - 1) * USER_APPOINTMENTS_PAGE_SIZE,
        safeAppointmentsPage * USER_APPOINTMENTS_PAGE_SIZE
    );

    const fetchDetail = async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await UserService.getUser(userId);
            setUser(data);
        } catch (err: any) {
            console.error("Error al obtener detalle del usuario:", err);
            setError(err.message || "No se pudo cargar la información del usuario");
            toast.error("Error al cargar la ficha del integrante");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!AuthService.isAuthenticated()) {
            AuthService.logout();
            return;
        }
        setCurrentUser(AuthService.getCurrentUser());
        // Si no vino precargado mediante SSR o el ID de la URL es distinto, buscarlo en el cliente
        if (!user || String(user.id) !== String(userId)) {
            fetchDetail();
        }
    }, [userId]);

    useEffect(() => {
        if (user) {
            const isDoc = !!user.demograficos || user.role_code === "ESTUDIANTE" || user.userType === "Estudiante";
            if (!isDoc) {
                setActiveTab("filiacion");
            }
        }
    }, [user]);

    const canEditUsers =
        AuthService.hasPermission("USUARIOS_EDITAR") ||
        ["DESARROLLADOR", "DIRECTOR"].includes(currentUser?.role_code || "");

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copiado al portapapeles`);
    };

    const handleToggleState = async () => {
        if (!user) return;
        if (user.isPreRegistered || user.estado === "preregistrado") {
            toast.info("Este estudiante está pre-registrado y activará su cuenta cuando defina su contraseña.");
            setShowToggleModal(false);
            return;
        }

        if (user.role_code === "DESARROLLADOR" || user.email === "dev@dev.ugd.local") {
            toast.error("La cuenta de Desarrollador está protegida y no puede ser inhabilitada");
            setShowToggleModal(false);
            return;
        }

        const isCurrentActive = user.estado === "activo" || user.isActive === true;
        const newStatus = isCurrentActive ? "inactivo" : "activo";
        setToggling(true);

        try {
            await UserService.updateUser(user.id, { estado: newStatus, isActive: !isCurrentActive });
            toast.success(`Cuenta ${!isCurrentActive ? "activada" : "inhabilitada"} exitosamente`);
            setShowToggleModal(false);
            fetchDetail();
        } catch (err: any) {
            toast.error(err.message || "Error al actualizar estado");
        } finally {
            setToggling(false);
        }
    };

    // Iniciar Modo de Edición en Pantalla Completa precargando la información
    const startEditing = () => {
        if (!user) return;

        const formatDateForInput = (d?: string | null) => {
            if (!d) return "";
            try {
                return new Date(d).toISOString().split("T")[0];
            } catch {
                return "";
            }
        };

        const primaryExp = user.expedientes && user.expedientes.length > 0 ? user.expedientes[0] : null;
        const dev = primaryExp?.devengamiento || null;
        const initialObsList = parseObservacionesList(primaryExp?.observaciones);
        const initialAdendas = (primaryExp?.adendas || []).map((ad, idx) => ({
            id: ad.id,
            numeroAdenda: ad.numeroAdenda || idx + 1,
            tipoModificacion: ad.tipoModificacion || "Ampliación",
            meses: ad.meses !== null && ad.meses !== undefined ? String(ad.meses) : "",
            fechaInicio: formatDateForInput(ad.fechaInicio),
            fechaFin: formatDateForInput(ad.fechaFin),
        }));

        setEditForm({
            nombres: user.demograficos?.nombres || user.name || "",
            apellidos: user.demograficos?.apellidos || "",
            cedula: user.cedula || user.demograficos?.cedula || "",
            correoInstitucional: user.demograficos?.correoInstitucional || user.email || "",
            telefono: user.demograficos?.telefono || "",
            sexo: user.demograficos?.sexo || "",
            fechaNacimiento: formatDateForInput(user.demograficos?.fechaNacimiento),
            tituloTercerNivel: user.academico?.tituloTercerNivel || "",
            tituloCuartoNivel: user.academico?.tituloCuartoNivel || "",
            carpeta: user.academico?.carpetaFisica || "",
            numeroOrden:
                user.academico?.numeroOrden !== null && user.academico?.numeroOrden !== undefined
                    ? String(user.academico.numeroOrden)
                    : "",
            facultad: user.academico?.facultad || "",
            carrera: user.academico?.carrera || "",
            programaDoctoral: primaryExp?.programaDoctoral || "",
            tituloAObtener: primaryExp?.tituloAObtener || "",
            institucionDestino: primaryExp?.institucionDestino || "",
            paisDestino: primaryExp?.paisDestino || "",
            convenio: primaryExp?.convenio || "",
            tituloInvestigacion: primaryExp?.tituloInvestigacion || "",
            estadoExpediente: primaryExp?.estado || "EN_ESTUDIOS",
            tipoFinanciamiento: primaryExp?.tipoFinanciamiento || "Beca",
            contratoInicio: formatDateForInput(primaryExp?.contratoInicio),
            contratoFin: formatDateForInput(primaryExp?.contratoFin),
            contratoMeses:
                primaryExp?.contratoMeses !== null && primaryExp?.contratoMeses !== undefined
                    ? String(primaryExp.contratoMeses)
                    : "",
            tieneApoyoProyecto: !!primaryExp?.tieneApoyoProyecto,
            oficioRegistroProyecto: primaryExp?.oficioRegistroProyecto || "",
            fechaOficioRegistro: formatDateForInput(primaryExp?.fechaOficioRegistro),
            observaciones: primaryExp?.observaciones || "",
            observacionesList: initialObsList,
            nuevaObservacion: "",
            tieneAlertaLegal: !!primaryExp?.tieneAlertaLegal,
            adendas: initialAdendas,
            nuevaAdenda: {
                tipoModificacion: "Ampliación",
                meses: "",
                fechaInicio: "",
                fechaFin: "",
            },
            registroSenescyt: dev?.registroSenescyt || "",
            tiempoTexto: dev?.tiempoTexto || "",
            devengamientoFechaInicio: formatDateForInput(dev?.fechaInicio),
            devengamientoFechaFinEstimada: formatDateForInput(dev?.fechaFinEstimada),
            devengamientoEstado: dev?.estado || "PENDIENTE",
            oficioNotificacion: dev?.oficioNotificacion || "",
            oficioActaTerminacion: dev?.oficioActaTerminacion || "",
            oficioCierreProyecto: dev?.oficioCierreProyecto || "",
        });

        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const cancelEditing = () => {
        setIsEditing(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Control de múltiples observaciones en formulario
    const handleAddObservacion = () => {
        const text = editForm.nuevaObservacion.trim();
        if (!text) return;
        setEditForm({
            ...editForm,
            observacionesList: [...editForm.observacionesList, text],
            nuevaObservacion: "",
        });
    };

    const handleRemoveObservacion = (index: number) => {
        setEditForm({
            ...editForm,
            observacionesList: editForm.observacionesList.filter((_, i) => i !== index),
        });
    };

    const handleUpdateObservacionItem = (index: number, newText: string) => {
        const updated = [...editForm.observacionesList];
        updated[index] = newText;
        setEditForm({
            ...editForm,
            observacionesList: updated,
        });
    };

    // Control de Adendas Contractuales en formulario
    const handleAddAdenda = () => {
        const nextNum = editForm.adendas.length + 1;
        const newAd = {
            numeroAdenda: nextNum,
            tipoModificacion: editForm.nuevaAdenda.tipoModificacion || "Ampliación",
            meses: editForm.nuevaAdenda.meses.trim(),
            fechaInicio: editForm.nuevaAdenda.fechaInicio,
            fechaFin: editForm.nuevaAdenda.fechaFin,
        };
        setEditForm({
            ...editForm,
            adendas: [...editForm.adendas, newAd],
            nuevaAdenda: {
                tipoModificacion: "Ampliación",
                meses: "",
                fechaInicio: "",
                fechaFin: "",
            },
        });
        toast.success(`Adenda N° ${nextNum} agregada a la lista`);
    };

    const handleRemoveAdenda = (index: number) => {
        const updated = editForm.adendas
            .filter((_, i) => i !== index)
            .map((ad, i) => ({ ...ad, numeroAdenda: i + 1 }));
        setEditForm({
            ...editForm,
            adendas: updated,
        });
    };

    const handleUpdateAdendaItem = (index: number, field: string, value: any) => {
        const updated = [...editForm.adendas];
        updated[index] = { ...updated[index], [field]: value };
        setEditForm({
            ...editForm,
            adendas: updated,
        });
    };

    // Guardar cambios parciales o completos
    const handleSaveEdit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!user) return;

        if (!editForm.nombres.trim()) {
            toast.error("El campo Nombres es requerido");
            return;
        }

        setSaving(true);
        try {
            const pendingObs = editForm.nuevaObservacion.trim();
            const allObs = pendingObs
                ? [...editForm.observacionesList, pendingObs]
                : editForm.observacionesList;
            const finalObservaciones = allObs.join("\n").trim();

            const pendingAdenda =
                editForm.nuevaAdenda.meses ||
                editForm.nuevaAdenda.fechaInicio ||
                editForm.nuevaAdenda.fechaFin
                    ? [
                          {
                              numeroAdenda: editForm.adendas.length + 1,
                              tipoModificacion: editForm.nuevaAdenda.tipoModificacion || "Ampliación",
                              meses: editForm.nuevaAdenda.meses
                                  ? Number(editForm.nuevaAdenda.meses)
                                  : null,
                              fechaInicio: editForm.nuevaAdenda.fechaInicio || null,
                              fechaFin: editForm.nuevaAdenda.fechaFin || null,
                          },
                      ]
                    : [];

            const sanitizedAdendas = [
                ...editForm.adendas.map((a, i) => ({
                    id: a.id,
                    numeroAdenda: Number(a.numeroAdenda) || i + 1,
                    tipoModificacion: a.tipoModificacion.trim() || "Ampliación",
                    meses:
                        a.meses !== "" && a.meses !== null && a.meses !== undefined
                            ? Number(a.meses)
                            : null,
                    fechaInicio: a.fechaInicio || null,
                    fechaFin: a.fechaFin || null,
                })),
                ...pendingAdenda,
            ];

            await UserService.updateUser(user.id, {
                nombres: editForm.nombres.trim(),
                apellidos: editForm.apellidos.trim(),
                name: `${editForm.nombres.trim()} ${editForm.apellidos.trim()}`.trim(),
                cedula: editForm.cedula.trim() || undefined,
                correoInstitucional: editForm.correoInstitucional.trim().toLowerCase() || undefined,
                email: editForm.correoInstitucional.trim().toLowerCase() || undefined,
                telefono: editForm.telefono.trim() || null,
                sexo: editForm.sexo || null,
                fechaNacimiento: editForm.fechaNacimiento || null,
                tituloTercerNivel: editForm.tituloTercerNivel.trim() || null,
                tituloCuartoNivel: editForm.tituloCuartoNivel.trim() || null,
                carpeta: editForm.carpeta.trim() || null,
                numeroOrden: editForm.numeroOrden ? Number(editForm.numeroOrden) : null,
                facultad: editForm.facultad.trim() || null,
                carrera: editForm.carrera.trim() || null,
                programaDoctoral: editForm.programaDoctoral.trim() || null,
                tituloAObtener: editForm.tituloAObtener.trim() || null,
                institucionDestino: editForm.institucionDestino.trim() || null,
                paisDestino: editForm.paisDestino.trim() || null,
                convenio: editForm.convenio.trim() || null,
                tituloInvestigacion: editForm.tituloInvestigacion.trim() || null,
                estadoExpediente: editForm.estadoExpediente || undefined,
                tipoFinanciamiento: editForm.tipoFinanciamiento.trim() || undefined,
                contratoInicio: editForm.contratoInicio || null,
                contratoFin: editForm.contratoFin || null,
                contratoMeses: editForm.contratoMeses ? Number(editForm.contratoMeses) : null,
                tieneApoyoProyecto: editForm.tieneApoyoProyecto,
                oficioRegistroProyecto: editForm.oficioRegistroProyecto.trim() || null,
                fechaOficioRegistro: editForm.fechaOficioRegistro || null,
                observaciones: finalObservaciones || null,
                tieneAlertaLegal: editForm.tieneAlertaLegal,
                adendas: sanitizedAdendas,
                registroSenescyt: editForm.registroSenescyt.trim() || null,
                tiempoTexto: editForm.tiempoTexto.trim() || null,
                devengamientoFechaInicio: editForm.devengamientoFechaInicio || null,
                devengamientoFechaFinEstimada: editForm.devengamientoFechaFinEstimada || null,
                devengamientoEstado: editForm.devengamientoEstado || undefined,
                oficioNotificacion: editForm.oficioNotificacion.trim() || null,
                oficioActaTerminacion: editForm.oficioActaTerminacion.trim() || null,
                oficioCierreProyecto: editForm.oficioCierreProyecto.trim() || null,
            });

            toast.success("Información del integrante actualizada exitosamente");
            await fetchDetail();
            setIsEditing(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err: any) {
            toast.error(err.message || "Error al actualizar los datos");
        } finally {
            setSaving(false);
        }
    };

    const handlePrint = () => {
        if (!user) return;
        const originalTitle = document.title;
        const sanitizedName = (user.full_name || user.name || "Usuario")
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9]/g, "_")
            .replace(/_+/g, "_");
        const cedula = user.demograficos?.cedula || user.cedula || "";

        document.title = `Ficha_Doctoral_${sanitizedName}${cedula ? `_${cedula}` : ""}`;
        window.print();

        setTimeout(() => {
            document.title = originalTitle;
        }, 1500);
    };

    if (loading) {
        return (
            <RoleGuard allowedRoles={["DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS"]} moduleName="Ficha de Usuario">
                <div className="animate-fade-in min-h-[65vh] w-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="relative mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                            <GraduationCap className="w-8 h-8 text-primary" />
                        </div>
                        <div className="absolute -inset-1.5 rounded-2xl border-2 border-primary/20 border-t-primary animate-spin pointer-events-none" />
                    </div>

                    <div className="space-y-2 max-w-md">
                        <h3 className="text-lg font-bold font-serif text-foreground tracking-tight">
                            Consultando datos del estudiante...
                        </h3>
                        <p className="text-sm text-foreground-muted leading-relaxed">
                            Recuperando expediente doctoral, adendas e historial académico en la Unidad de Gestión de Doctorados (UGD).
                        </p>
                    </div>
                </div>
            </RoleGuard>
        );
    }

    if (error || !user) {
        return (
            <RoleGuard allowedRoles={["DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS"]} moduleName="Ficha de Usuario">
                <div className="max-w-xl mx-auto my-12 bg-card border border-border rounded-3xl p-8 text-center space-y-4 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-destructive-bg text-destructive flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">No se encontró el registro</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        {error || "El identificador solicitado no coincide con ningún usuario ni estudiante en el padrón UGD."}
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard/usuarios")}
                        className="rounded-xl border-border-strong text-xs font-semibold cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al Directorio
                    </Button>
                </div>
            </RoleGuard>
        );
    }

    const isPre = user.isPreRegistered || user.estado === "preregistrado";
    const isActive = (user.estado === "activo" || user.isActive === true) && !isPre;
    const roleCode = user.role_code || (user.role === "student" ? "ESTUDIANTE" : "ADMIN");
    const fullName = user.full_name || user.name || "Usuario";
    const initials = getInitials(fullName);
    const isDoctorando = !!user.demograficos || roleCode === "ESTUDIANTE" || user.userType === "Estudiante";

    return (
        <RoleGuard allowedRoles={["DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS"]} moduleName="Ficha de Usuario">
            <div className={`animate-fade-in space-y-5 sm:space-y-6 max-w-7xl mx-auto w-full px-2 sm:px-0 ${isEditing ? "pb-28 lg:pb-16" : "pb-20"}`}>
                {/* A. MODO EDICIÓN EN PANTALLA COMPLETA */}
                {isEditing ? (
                    <UserDetailEditView
                        fullName={fullName}
                        isDoctorando={isDoctorando}
                        editForm={editForm}
                        setEditForm={setEditForm}
                        saving={saving}
                        handleSaveEdit={handleSaveEdit}
                        cancelEditing={cancelEditing}
                        handleAddObservacion={handleAddObservacion}
                        handleRemoveObservacion={handleRemoveObservacion}
                        handleUpdateObservacionItem={handleUpdateObservacionItem}
                        handleAddAdenda={handleAddAdenda}
                        handleRemoveAdenda={handleRemoveAdenda}
                        handleUpdateAdendaItem={handleUpdateAdendaItem}
                    />
                ) : (
                    /* B. MODO LECTURA / FICHA COMPLETA */
                    <>
                        <UserDetailHeader
                            user={user}
                            canEditUsers={canEditUsers}
                            isPre={isPre}
                            isActive={isActive}
                            roleCode={roleCode}
                            fullName={fullName}
                            initials={initials}
                            formatDate={formatDate}
                            copyToClipboard={copyToClipboard}
                            onBack={() => router.push("/dashboard/usuarios")}
                            onStartEditing={startEditing}
                            onPrint={handlePrint}
                            onOpenToggleModal={() => setShowToggleModal(true)}
                        />

                        <UserDetailTabsNav
                            activeTab={activeTab}
                            onSelectTab={setActiveTab}
                            isDoctorando={isDoctorando}
                            user={user}
                            totalUserAppointments={totalUserAppointments}
                        />

                        {/* Contenedor Unificado de Contenido por Categoría */}
                        <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs">
                            {activeTab === "expediente" && (
                                <TabExpedienteDoctoral
                                    user={user}
                                    formatDate={formatDate}
                                    parseObservacionesList={parseObservacionesList}
                                />
                            )}

                            {activeTab === "devengamiento" && (
                                <TabDevengamiento
                                    user={user}
                                    formatDate={formatDate}
                                    copyToClipboard={copyToClipboard}
                                />
                            )}

                            {activeTab === "filiacion" && (
                                <TabFiliacion
                                    user={user}
                                    isDoctorando={isDoctorando}
                                    formatDate={formatDate}
                                    copyToClipboard={copyToClipboard}
                                />
                            )}

                            {activeTab === "citas" && (
                                <TabUserAppointments
                                    user={user}
                                    userId={userId}
                                    roleCode={roleCode}
                                    totalUserAppointments={totalUserAppointments}
                                    paginatedUserAppointments={paginatedUserAppointments}
                                    safeAppointmentsPage={safeAppointmentsPage}
                                    pageSize={USER_APPOINTMENTS_PAGE_SIZE}
                                    onPageChange={(nextPage) =>
                                        setAppointmentsPagination({ userId, page: nextPage })
                                    }
                                    formatDate={formatDate}
                                />
                            )}
                        </div>

                        {/* Dialog Confirmar Cambio de Estado de Cuenta */}
                        <UserStatusModal
                            isOpen={showToggleModal}
                            onOpenChange={setShowToggleModal}
                            isActive={isActive}
                            fullName={fullName}
                            email={user.email}
                            toggling={toggling}
                            onConfirm={handleToggleState}
                        />

                        {/* Componente Reutilizable de Impresión / Descarga de Ficha Oficial en PDF A4 */}
                        {user && (
                            <FichaDoctoralPDF
                                user={user}
                                emitidoPor={currentUser?.full_name || "Personal Técnico UGD UCE"}
                            />
                        )}
                    </>
                )}
            </div>
        </RoleGuard>
    );
}
