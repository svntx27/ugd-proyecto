"use client";

import React from "react";
import {
    BookOpen,
    Award,
    IdCard,
    CalendarCheck,
    ChevronDown,
} from "lucide-react";
import { UserDetail } from "@/services/user.service";

export type UserDetailTabType = "expediente" | "devengamiento" | "filiacion" | "citas";

export interface UserDetailTabsNavProps {
    activeTab: UserDetailTabType;
    onSelectTab: (tab: UserDetailTabType) => void;
    isDoctorando: boolean;
    user: UserDetail;
    totalUserAppointments: number;
}

export function UserDetailTabsNav({
    activeTab,
    onSelectTab,
    isDoctorando,
    user,
    totalUserAppointments,
}: UserDetailTabsNavProps) {
    return (
        <div className="space-y-2">
            {/* 3.A MÓVIL (< sm): Selector desplegable único (Select) */}
            <div className="block sm:hidden w-full">
                <label htmlFor="user-tabs-select" className="sr-only">
                    Seleccionar sección del expediente
                </label>
                <div className="relative flex items-center bg-card border border-border rounded-xl shadow-2xs hover:border-border-strong transition-colors">
                    <div className="absolute left-3.5 pointer-events-none text-primary">
                        {activeTab === "expediente" && <BookOpen className="w-4 h-4" />}
                        {activeTab === "devengamiento" && <Award className="w-4 h-4" />}
                        {activeTab === "filiacion" && <IdCard className="w-4 h-4" />}
                        {activeTab === "citas" && <CalendarCheck className="w-4 h-4" />}
                    </div>
                    <select
                        id="user-tabs-select"
                        value={activeTab}
                        onChange={(e) => onSelectTab(e.target.value as UserDetailTabType)}
                        className="w-full bg-transparent pl-10 pr-9 py-2.5 text-xs font-semibold text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-xl"
                    >
                        {isDoctorando && (
                            <option value="expediente" className="bg-card text-foreground">
                                Expediente & Tesis {user.expedientes?.[0]?.estado ? `• [${user.expedientes[0].estado.replace(/_/g, " ")}]` : ""}
                            </option>
                        )}
                        {isDoctorando && (
                            <option value="devengamiento" className="bg-card text-foreground">
                                Devengamiento & Adendas {user.expedientes?.[0]?.devengamiento?.estado ? `• [${user.expedientes[0].devengamiento.estado.replace(/_/g, " ")}]` : ""}
                            </option>
                        )}
                        <option value="filiacion" className="bg-card text-foreground">
                            Filiación & Datos Personales
                        </option>
                        <option value="citas" className="bg-card text-foreground">
                            Citas & Seguridad {totalUserAppointments > 0 ? `• [${totalUserAppointments} citas]` : ""}
                        </option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-muted-subtle absolute right-3 pointer-events-none" />
                </div>

                {/* Indicador de estado destacado en móvil */}
                <div className="mt-1.5 flex items-center justify-between px-1 text-[11px] text-muted-foreground">
                    <span>Sección activa:</span>
                    {activeTab === "expediente" && user.expedientes?.[0]?.estado && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-accent text-accent-foreground border border-border">
                            {user.expedientes[0].estado.replace(/_/g, " ")}
                        </span>
                    )}
                    {activeTab === "devengamiento" && user.expedientes?.[0]?.devengamiento?.estado && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-success-bg text-success border border-success-border">
                            {user.expedientes[0].devengamiento.estado.replace(/_/g, " ")}
                        </span>
                    )}
                    {activeTab === "citas" && totalUserAppointments > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-accent text-accent-foreground border border-border">
                            {totalUserAppointments} cita{totalUserAppointments > 1 ? "s" : ""}
                        </span>
                    )}
                    {activeTab === "filiacion" && (
                        <span className="text-[10px] text-muted-subtle font-medium">
                            Ficha General
                        </span>
                    )}
                </div>
            </div>

            {/* 3.B TABLET (sm hasta < lg): Cuadrícula de dos columnas */}
            <div className="hidden sm:grid lg:hidden grid-cols-2 gap-2.5 w-full">
                {isDoctorando && (
                    <button
                        type="button"
                        onClick={() => onSelectTab("expediente")}
                        className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                            activeTab === "expediente"
                                ? "bg-primary text-white shadow-2xs"
                                : "bg-card hover:bg-surface-subtle text-foreground-soft border border-border"
                        }`}
                    >
                        <div className="flex items-center gap-2 truncate">
                            <BookOpen className="w-4 h-4 shrink-0" />
                            <span className="truncate">Expediente & Tesis</span>
                        </div>
                        {user.expedientes && user.expedientes.length > 0 && (
                            <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ml-1.5 ${
                                    activeTab === "expediente" ? "bg-white/20 text-white" : "bg-accent text-accent-foreground"
                                }`}
                            >
                                {user.expedientes[0].estado.replace(/_/g, " ")}
                            </span>
                        )}
                    </button>
                )}

                {isDoctorando && (
                    <button
                        type="button"
                        onClick={() => onSelectTab("devengamiento")}
                        className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                            activeTab === "devengamiento"
                                ? "bg-primary text-white shadow-2xs"
                                : "bg-card hover:bg-surface-subtle text-foreground-soft border border-border"
                        }`}
                    >
                        <div className="flex items-center gap-2 truncate">
                            <Award className="w-4 h-4 shrink-0" />
                            <span className="truncate">Devengamiento & Adendas</span>
                        </div>
                        {user.expedientes?.[0]?.devengamiento && (
                            <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ml-1.5 ${
                                    activeTab === "devengamiento"
                                        ? "bg-white/20 text-white"
                                        : "bg-success-bg text-success border border-success-border"
                                }`}
                            >
                                {user.expedientes[0].devengamiento.estado.replace(/_/g, " ")}
                            </span>
                        )}
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => onSelectTab("filiacion")}
                    className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        activeTab === "filiacion"
                            ? "bg-primary text-white shadow-2xs"
                            : "bg-card hover:bg-surface-subtle text-foreground-soft border border-border"
                    }`}
                >
                    <div className="flex items-center gap-2 truncate">
                        <IdCard className="w-4 h-4 shrink-0" />
                        <span className="truncate">Filiación & Datos Personales</span>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => onSelectTab("citas")}
                    className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        activeTab === "citas"
                            ? "bg-primary text-white shadow-2xs"
                            : "bg-card hover:bg-surface-subtle text-foreground-soft border border-border"
                    }`}
                >
                    <div className="flex items-center gap-2 truncate">
                        <CalendarCheck className="w-4 h-4 shrink-0" />
                        <span className="truncate">Citas & Seguridad</span>
                    </div>
                    {totalUserAppointments > 0 && (
                        <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ml-1.5 ${
                                activeTab === "citas" ? "bg-white/20 text-white" : "bg-accent text-accent-foreground"
                            }`}
                        >
                            {totalUserAppointments}
                        </span>
                    )}
                </button>
            </div>

            {/* 3.C ESCRITORIO (lg en adelante): Fila única original intacta */}
            <div className="hidden lg:flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {isDoctorando && (
                    <button
                        type="button"
                        onClick={() => onSelectTab("expediente")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === "expediente"
                                ? "bg-primary text-white shadow-2xs"
                                : "bg-card hover:bg-surface-subtle text-foreground-soft border border-border"
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>Expediente & Tesis</span>
                        {user.expedientes && user.expedientes.length > 0 && (
                            <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                    activeTab === "expediente" ? "bg-white/20 text-white" : "bg-accent text-accent-foreground"
                                }`}
                            >
                                {user.expedientes[0].estado.replace(/_/g, " ")}
                            </span>
                        )}
                    </button>
                )}

                {isDoctorando && (
                    <button
                        type="button"
                        onClick={() => onSelectTab("devengamiento")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === "devengamiento"
                                ? "bg-primary text-white shadow-2xs"
                                : "bg-card hover:bg-surface-subtle text-foreground-soft border border-border"
                        }`}
                    >
                        <Award className="w-4 h-4" />
                        <span>Devengamiento & Adendas</span>
                        {user.expedientes?.[0]?.devengamiento && (
                            <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                    activeTab === "devengamiento"
                                        ? "bg-white/20 text-white"
                                        : "bg-success-bg text-success border border-success-border"
                                }`}
                            >
                                {user.expedientes[0].devengamiento.estado.replace(/_/g, " ")}
                            </span>
                        )}
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => onSelectTab("filiacion")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === "filiacion"
                            ? "bg-primary text-white shadow-2xs"
                            : "bg-card hover:bg-surface-subtle text-foreground-soft border border-border"
                    }`}
                >
                    <IdCard className="w-4 h-4" />
                    <span>Filiación & Datos Personales</span>
                </button>

                <button
                    type="button"
                    onClick={() => onSelectTab("citas")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === "citas"
                            ? "bg-primary text-white shadow-2xs"
                            : "bg-card hover:bg-surface-subtle text-foreground-soft border border-border"
                    }`}
                >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Citas & Seguridad</span>
                    {totalUserAppointments > 0 && (
                        <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                activeTab === "citas" ? "bg-white/20 text-white" : "bg-accent text-accent-foreground"
                            }`}
                        >
                            {totalUserAppointments}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}
