"use client";

import { useEffect, useState, useMemo } from "react";
import { AppointmentService, Representative } from "@/services/appointment.service";
import { AuthService } from "@/services/auth.service";
import { UserCheck, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { RepresentantesStats } from "@/components/representantes/RepresentantesStats";
import { RepresentantesFilterBar } from "@/components/representantes/RepresentantesFilterBar";
import { RepresentantesTable } from "@/components/representantes/RepresentantesTable";
import { RepresentanteFormView } from "@/components/representantes/RepresentanteFormView";
import { DeleteRepresentanteDialog } from "@/components/representantes/DeleteRepresentanteDialog";

const DEFAULT_UBICACION = "Unidad de Gestión de Doctorados";

const SUGGESTED_ROLES = [
    "Director UGD",
    "Analista de Procesos",
    "Analista Técnico",
    "Coordinador de Tesis",
    "Secretaría Académica",
];

const ADMIN_ROLES = [
    {
        code: "ANALISTA_PROCESOS",
        label: "Analista de Procesos",
        description: "Gestión de expedientes, doctorandos, trámites y citas presenciales.",
        badgeClass: "bg-role-process-bg text-role-process border-role-process-border",
    },
    {
        code: "ANALISTA_TECNICO",
        label: "Analista Técnico",
        description: "Soporte técnico, diagnóstico de plataformas y gestión de citas.",
        badgeClass: "bg-role-tech-bg text-role-tech border-role-tech-border",
    },
    {
        code: "DIRECTOR",
        label: "Director UGD",
        description: "Supervisión integral, reportería ejecutiva y dirección académica.",
        badgeClass: "bg-role-director-bg text-role-director border-role-director-border",
    },
];

type ViewMode = "list" | "create" | "edit";

export default function RepresentantesPage() {
    const [representatives, setRepresentatives] = useState<Representative[]>([]);
    const [loading, setLoading] = useState(true);

    // Modo de visualización: Lista, Crear o Editar a Pantalla Completa
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [selectedRep, setSelectedRep] = useState<Representative | null>(null);
    const [deletingRep, setDeletingRep] = useState<Representative | null>(null);

    // Búsqueda y filtrado
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

    // Campos del formulario (Compartidos entre Crear y Editar)
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [roleCode, setRoleCode] = useState("ANALISTA_PROCESOS");
    const [title, setTitle] = useState("");
    const [ubicacion, setUbicacion] = useState(DEFAULT_UBICACION);
    const [estado, setEstado] = useState<"activo" | "inactivo">("activo");
    const [submitting, setSubmitting] = useState(false);

    const fetchRepresentatives = async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const data = await AppointmentService.listRepresentatives();
            setRepresentatives(data);
        } catch (error: unknown) {
            console.error("Error al cargar representantes UGD", error);
            toast.error("Error al obtener representantes UGD");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!AuthService.isAuthenticated()) {
            AuthService.logout();
            return;
        }
        let isMounted = true;
        AppointmentService.listRepresentatives()
            .then((data) => {
                if (isMounted) {
                    setRepresentatives(data);
                    setLoading(false);
                }
            })
            .catch((error: unknown) => {
                console.error("Error al cargar representantes UGD", error);
                if (isMounted) {
                    toast.error("Error al obtener representantes UGD");
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const resetForm = () => {
        setNombre("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setShowPassword(false);
        setRoleCode("ANALISTA_PROCESOS");
        setTitle("");
        setUbicacion(DEFAULT_UBICACION);
        setEstado("activo");
    };

    const handleOpenCreate = () => {
        resetForm();
        setSelectedRep(null);
        setViewMode("create");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleOpenEdit = (rep: Representative) => {
        setSelectedRep(rep);
        setNombre(rep.nombre || rep.name || "");
        setEmail(rep.email || "");
        setPassword("");
        setConfirmPassword("");
        setShowPassword(false);
        setRoleCode(rep.roleCode || "ANALISTA_PROCESOS");
        setTitle(rep.title || "Analista UGD");
        setUbicacion(rep.ubicacion || rep.location || DEFAULT_UBICACION);
        setEstado(rep.estado === "inactivo" ? "inactivo" : "activo");
        setViewMode("edit");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleBackToList = () => {
        setViewMode("list");
        setSelectedRep(null);
        resetForm();
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSaveCreate = async () => {
        const trimmedNombre = nombre.trim();
        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedNombre) {
            toast.error("El nombre completo del representante es obligatorio");
            return;
        }

        if (!trimmedEmail) {
            toast.error("El correo institucional es obligatorio");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            toast.error("Por favor ingresa un correo electrónico válido");
            return;
        }

        if (!password || password.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }

        setSubmitting(true);
        try {
            await AppointmentService.createRepresentative({
                nombre: trimmedNombre,
                email: trimmedEmail,
                password,
                roleCode,
                title: title.trim() || (ADMIN_ROLES.find((r) => r.code === roleCode)?.label || "Analista UGD"),
                ubicacion: ubicacion.trim() || DEFAULT_UBICACION,
                capacidad: 1,
                estado,
            });
            toast.success("Representante registrado y credenciales asignadas exitosamente");
            handleBackToList();
            fetchRepresentatives();
        } catch (error: unknown) {
            const err = error as Error;
            toast.error(err.message || "Error al registrar representante");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!selectedRep) return;
        const trimmedNombre = nombre.trim();
        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedNombre) {
            toast.error("El nombre completo no puede estar vacío");
            return;
        }

        if (trimmedEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(trimmedEmail)) {
                toast.error("El formato del correo electrónico no es válido");
                return;
            }
        }

        if (password && password.length < 6) {
            toast.error("Si vas a cambiar la contraseña, debe tener al menos 6 caracteres");
            return;
        }

        if (password && password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }

        setSubmitting(true);
        try {
            await AppointmentService.updateRepresentative(selectedRep.id, {
                nombre: trimmedNombre,
                title: title.trim() || "Analista UGD",
                ubicacion: ubicacion.trim() || DEFAULT_UBICACION,
                capacidad: 1,
                estado,
                email: trimmedEmail || undefined,
                password: password.trim() || undefined,
                roleCode,
            });
            toast.success("Datos y permisos del representante actualizados exitosamente");
            handleBackToList();
            fetchRepresentatives();
        } catch (error: unknown) {
            const err = error as Error;
            toast.error(err.message || "Error al actualizar representante");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingRep) return;
        setSubmitting(true);
        try {
            await AppointmentService.deleteRepresentative(deletingRep.id);
            toast.success("Representante eliminado del directorio");
            setDeletingRep(null);
            fetchRepresentatives();
        } catch (error: unknown) {
            const err = error as Error;
            toast.error(err.message || "Error al eliminar el representante");
        } finally {
            setSubmitting(false);
        }
    };

    // Listado filtrado
    const filteredReps = useMemo(() => {
        return representatives.filter((rep) => {
            const repName = (rep.nombre || rep.name || "").toLowerCase();
            const repEmail = (rep.email || "").toLowerCase();
            const repTitle = (rep.title || "").toLowerCase();
            const query = searchQuery.toLowerCase().trim();

            const matchesQuery = !query || repName.includes(query) || repTitle.includes(query) || repEmail.includes(query);

            const isRepActive = rep.estado === "activo" || rep.estado === "disponible";
            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && isRepActive) ||
                (statusFilter === "inactive" && !isRepActive);

            return matchesQuery && matchesStatus;
        });
    }, [representatives, searchQuery, statusFilter]);

    // Estadísticas
    const stats = useMemo(() => {
        const total = representatives.length;
        const active = representatives.filter((r) => r.estado === "activo" || r.estado === "disponible").length;
        const inactive = total - active;
        return { total, active, inactive };
    }, [representatives]);

    // Iniciales
    const getInitials = (name: string) => {
        if (!name) return "UG";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    if (viewMode === "create" || viewMode === "edit") {
        return (
            <RepresentanteFormView
                isEdit={viewMode === "edit"}
                selectedRep={selectedRep}
                nombre={nombre}
                onNombreChange={setNombre}
                email={email}
                onEmailChange={setEmail}
                password={password}
                onPasswordChange={setPassword}
                confirmPassword={confirmPassword}
                onConfirmPasswordChange={setConfirmPassword}
                showPassword={showPassword}
                onToggleShowPassword={() => setShowPassword(!showPassword)}
                roleCode={roleCode}
                onRoleCodeChange={setRoleCode}
                title={title}
                onTitleChange={setTitle}
                ubicacion={ubicacion}
                onUbicacionChange={setUbicacion}
                estado={estado}
                onEstadoChange={setEstado}
                submitting={submitting}
                onBack={handleBackToList}
                onSubmit={viewMode === "edit" ? handleSaveEdit : handleSaveCreate}
                suggestedRoles={SUGGESTED_ROLES}
                adminRoles={ADMIN_ROLES}
            />
        );
    }

    return (
        <div className="space-y-5 sm:space-y-6 pb-14 max-w-7xl mx-auto w-full px-2 sm:px-0">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-border shadow-xs">
                <div className="flex items-center gap-3.5">
                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gold-light border border-gold-border text-gold shadow-2xs shrink-0">
                        <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
                            Directorio de Representantes UGD
                        </h1>
                        <p className="text-muted-foreground text-xs sm:text-sm">
                            Personal asignado a la atención presencial y supervisión doctoral.
                        </p>
                    </div>
                </div>

                <Button
                    onClick={handleOpenCreate}
                    className="bg-primary hover:bg-primary-hover text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-xs px-4 py-2.5 text-xs sm:text-sm transition-all w-full sm:w-auto cursor-pointer"
                >
                    <Plus className="w-4 h-4" /> Registrar Nuevo Representante
                </Button>
            </div>

            {/* Metric Summary Strip */}
            <RepresentantesStats stats={stats} defaultUbicacion={DEFAULT_UBICACION} />

            {/* Filter and Search Bar */}
            <RepresentantesFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                totalCount={stats.total}
                activeCount={stats.active}
                inactiveCount={stats.inactive}
            />

            {/* Master Directory: Adaptive View */}
            <RepresentantesTable
                loading={loading}
                representatives={representatives}
                filteredReps={filteredReps}
                searchQuery={searchQuery}
                onClearSearch={() => setSearchQuery("")}
                onOpenCreate={handleOpenCreate}
                onOpenEdit={handleOpenEdit}
                onDelete={setDeletingRep}
                getInitials={getInitials}
                defaultUbicacion={DEFAULT_UBICACION}
            />

            {/* Modal de Confirmación para Eliminar */}
            <DeleteRepresentanteDialog
                isOpen={!!deletingRep}
                representative={deletingRep}
                onClose={() => setDeletingRep(null)}
                onConfirm={handleDelete}
                isSubmitting={submitting}
            />
        </div>
    );
}
