"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { UserService, User, NewDoctorandoPayload } from "@/services/user.service";
import { AuthService, AdminUser } from "@/services/auth.service";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { getRoleMeta } from "@/lib/role-badge.helper";
import { Users, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { UsuariosStatsGrid } from "@/components/usuarios/UsuariosStatsGrid";
import { UsuariosFilterBar } from "@/components/usuarios/UsuariosFilterBar";
import { UsuariosTable } from "@/components/usuarios/UsuariosTable";
import { DoctorandoRegisterView } from "@/components/usuarios/DoctorandoRegisterView";
import { UserToggleStatusDialog } from "@/components/usuarios/UserToggleStatusDialog";

const getUserRoleCode = (u: User): string => {
    if (u.role_code) return u.role_code.toUpperCase();
    if (u.role === "student" || u.userType === "student" || u.userType === "Estudiante") return "ESTUDIANTE";
    return (u.role || "ADMIN").toUpperCase();
};

const getInitials = (name?: string) => {
    if (!name) return "UG";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};

export default function UsuariosPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const handleOpenUserDetail = (u: User) => {
        router.push(`/dashboard/usuarios/${u.id}`);
    };

    // Modo Registro de Estudiante a Pantalla Completa
    const [isRegistering, setIsRegistering] = useState(false);
    const [submittingStudent, setSubmittingStudent] = useState(false);
    const [newStudentForm, setNewStudentForm] = useState<NewDoctorandoPayload>({
        cedula: "",
        nombres: "",
        apellidos: "",
        correoInstitucional: "",
        telefono: "",
        sexo: "",
        fechaNacimiento: "",
        tituloTercerNivel: "",
        tituloCuartoNivel: "",
        carpeta: "",
        numeroOrden: null,
    });

    const cancelRegistration = () => {
        setIsRegistering(false);
        setNewStudentForm({
            cedula: "",
            nombres: "",
            apellidos: "",
            correoInstitucional: "",
            telefono: "",
            sexo: "",
            fechaNacimiento: "",
            tituloTercerNivel: "",
            tituloCuartoNivel: "",
            carpeta: "",
            numeroOrden: null,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(8);

    // Modal state for toggle status
    const [userToToggle, setUserToToggle] = useState<User | null>(null);
    const [togglingId, setTogglingId] = useState<string | number | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await UserService.listUsers();
            setUsers(data);
        } catch (error) {
            console.error("Error al cargar usuarios", error);
            toast.error("Error al obtener la lista de usuarios");
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
        fetchUsers();
    }, []);

    // Role permissions
    const userRole = currentUser?.role_code || "";
    const canCreateUsers = ["DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS"].includes(userRole);
    const canEditUsers = ["DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS"].includes(userRole);

    // Dynamic categories extracted from user role codes
    const dynamicCategories = useMemo(() => {
        const categoriesMap = new Map<string, { code: string; label: string; count: number }>();

        users.forEach((u) => {
            const code = getUserRoleCode(u);
            const meta = getRoleMeta(code);
            const current = categoriesMap.get(code);
            if (current) {
                current.count += 1;
            } else {
                categoriesMap.set(code, {
                    code,
                    label: meta.label,
                    count: 1,
                });
            }
        });

        return Array.from(categoriesMap.values());
    }, [users]);

    // Statistics including pre-registered students
    const stats = useMemo(() => {
        const total = users.length;
        const active = users.filter((u) => (u.estado === "activo" || u.isActive === true) && !u.isPreRegistered).length;
        const preRegistered = users.filter((u) => u.isPreRegistered || u.estado === "preregistrado").length;
        const inactive = users.filter((u) => (u.estado === "inactivo" || u.isActive === false) && !u.isPreRegistered).length;
        const students = users.filter((u) => getUserRoleCode(u) === "ESTUDIANTE").length;
        const staff = total - students;
        return { total, active, inactive, preRegistered, students, staff };
    }, [users]);

    // Selected category metadata for custom dropdown display
    const selectedCategoryMeta = useMemo(() => {
        if (categoryFilter === "all") {
            return { label: "Todas las Categorías", count: stats.total };
        }
        const cat = dynamicCategories.find((c) => c.code === categoryFilter);
        return cat ? { label: cat.label, count: cat.count } : { label: "Categoría", count: 0 };
    }, [categoryFilter, dynamicCategories, stats.total]);

    // Filtered users
    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const nameStr = (u.full_name || u.name || "").toLowerCase();
            const emailStr = (u.email || "").toLowerCase();
            const cedulaStr = (u.cedula || "").toLowerCase();
            const query = search.toLowerCase().trim();
            const cleanQuery = query.replace(/[-\s.]/g, "");
            const cleanCedula = cedulaStr.replace(/[-\s.]/g, "");
            const matchesCedula = cedulaStr.includes(query) || (cleanQuery.length >= 3 && cleanCedula.includes(cleanQuery));

            const matchesSearch = !query || nameStr.includes(query) || emailStr.includes(query) || matchesCedula;

            const uRole = getUserRoleCode(u);
            const matchesCategory = categoryFilter === "all" || uRole === categoryFilter;

            const isPre = u.isPreRegistered || u.estado === "preregistrado";
            const isActive = (u.estado === "activo" || u.isActive === true) && !isPre;
            const isInactive = (u.estado === "inactivo" || u.isActive === false) && !isPre;

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && isActive) ||
                (statusFilter === "preregistered" && isPre) ||
                (statusFilter === "inactive" && isInactive);

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [users, search, categoryFilter, statusFilter]);

    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, categoryFilter, statusFilter, pageSize]);

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredUsers.slice(startIndex, startIndex + pageSize);
    }, [filteredUsers, currentPage, pageSize]);

    const handleConfirmToggleState = async () => {
        if (!userToToggle) return;
        if (!canEditUsers) {
            toast.error("No tienes permisos para modificar el estado de usuarios");
            return;
        }

        const isCurrentActive = userToToggle.estado === "activo" || userToToggle.isActive;
        const newStatus = isCurrentActive ? "inactivo" : "activo";
        setTogglingId(userToToggle.id);

        try {
            await UserService.updateUser(userToToggle.id, {
                estado: newStatus,
                isActive: !isCurrentActive,
            });
            toast.success(`Usuario ${!isCurrentActive ? "activado" : "inhabilitado"} correctamente`);
            setUserToToggle(null);
            await fetchUsers();
        } catch (error: any) {
            toast.error(error.message || "Error al actualizar el estado del usuario");
        } finally {
            setTogglingId(null);
        }
    };

    const handleRegisterStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        const cedula = newStudentForm.cedula.trim();
        const nombres = newStudentForm.nombres.trim();
        const apellidos = newStudentForm.apellidos.trim();
        const correo = newStudentForm.correoInstitucional.trim().toLowerCase();

        if (!cedula || !nombres || !apellidos || !correo) {
            toast.error("Por favor completa todos los campos obligatorios (*)");
            return;
        }

        if (!correo.endsWith("@uce.edu.ec")) {
            toast.error("El correo debe pertenecer al dominio institucional @uce.edu.ec");
            return;
        }

        setSubmittingStudent(true);
        try {
            await UserService.registerDoctorando({
                cedula,
                nombres,
                apellidos,
                correoInstitucional: correo,
                telefono: newStudentForm.telefono?.trim() || undefined,
                sexo: newStudentForm.sexo || undefined,
                fechaNacimiento: newStudentForm.fechaNacimiento || undefined,
                tituloTercerNivel: newStudentForm.tituloTercerNivel?.trim() || undefined,
                tituloCuartoNivel: newStudentForm.tituloCuartoNivel?.trim() || undefined,
                carpeta: newStudentForm.carpeta?.trim() || undefined,
                numeroOrden: newStudentForm.numeroOrden ? Number(newStudentForm.numeroOrden) : undefined,
            });

            toast.success("Estudiante doctorando registrado exitosamente en el padrón UGD");
            setIsRegistering(false);
            setNewStudentForm({
                cedula: "",
                nombres: "",
                apellidos: "",
                correoInstitucional: "",
                telefono: "",
                sexo: "",
                fechaNacimiento: "",
                tituloTercerNivel: "",
                tituloCuartoNivel: "",
                carpeta: "",
                numeroOrden: null,
            });
            await fetchUsers();
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error: any) {
            toast.error(error.message || "Error al registrar estudiante doctorando");
        } finally {
            setSubmittingStudent(false);
        }
    };

    const hasActiveFilters = Boolean(search || categoryFilter !== "all" || statusFilter !== "all");

    const handleResetFilters = () => {
        setSearch("");
        setCategoryFilter("all");
        setStatusFilter("all");
    };

    return (
        <RoleGuard
            allowedRoles={["DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS"]}
            moduleName="Directorio de Usuarios"
        >
            <div className={`space-y-5 sm:space-y-6 max-w-7xl mx-auto w-full px-2 sm:px-0 ${isRegistering ? "pb-28 lg:pb-16" : "pb-16"}`}>
                {isRegistering ? (
                    <DoctorandoRegisterView
                        form={newStudentForm}
                        onChange={setNewStudentForm}
                        onSubmit={handleRegisterStudent}
                        onCancel={cancelRegistration}
                        isSubmitting={submittingStudent}
                    />
                ) : (
                    <>
                        {/* Header Global */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-border shadow-xs">
                            <div className="flex items-center gap-3.5">
                                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gold-light border border-gold-border text-gold shadow-2xs shrink-0">
                                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
                                </div>
                                <div>
                                    <h1 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
                                        Directorio de Usuarios
                                    </h1>
                                    <p className="text-muted-foreground text-xs sm:text-sm">
                                        Supervisa las cuentas y accesos autorizados en la plataforma UGD UCE.
                                    </p>
                                </div>
                            </div>

                            {/* Botón Registrar Nuevo Estudiante */}
                            {canCreateUsers && (
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setIsRegistering(true);
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                    className="bg-primary hover:bg-primary-hover text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs px-3.5 py-2.5 transition-all self-stretch sm:self-auto justify-center cursor-pointer"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span>Registrar Estudiante</span>
                                </Button>
                            )}
                        </div>

                        {/* Metric Summary Cards */}
                        <UsuariosStatsGrid stats={stats} />

                        {/* Filter and Search Bar */}
                        <UsuariosFilterBar
                            search={search}
                            onSearchChange={setSearch}
                            categoryFilter={categoryFilter}
                            onCategoryChange={setCategoryFilter}
                            statusFilter={statusFilter}
                            onStatusChange={setStatusFilter}
                            dynamicCategories={dynamicCategories}
                            selectedCategoryMeta={selectedCategoryMeta}
                            totalCount={stats.total}
                        />

                        {/* Master Directory: Adaptive View */}
                        <UsuariosTable
                            loading={loading}
                            filteredUsers={filteredUsers}
                            paginatedUsers={paginatedUsers}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            totalPages={totalPages}
                            canEditUsers={canEditUsers}
                            togglingId={togglingId}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={setPageSize}
                            onUserDetail={handleOpenUserDetail}
                            onToggleUserStatus={setUserToToggle}
                            onResetFilters={handleResetFilters}
                            hasActiveFilters={hasActiveFilters}
                            getUserRoleCode={getUserRoleCode}
                            getInitials={getInitials}
                        />

                        {/* Confirm State Change Dialog */}
                        <UserToggleStatusDialog
                            user={userToToggle}
                            onClose={() => setUserToToggle(null)}
                            onConfirm={handleConfirmToggleState}
                            isSubmitting={!!togglingId}
                            getUserRoleCode={getUserRoleCode}
                        />
                    </>
                )}
            </div>
        </RoleGuard>
    );
}
