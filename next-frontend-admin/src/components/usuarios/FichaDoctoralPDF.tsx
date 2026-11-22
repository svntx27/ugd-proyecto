"use client";

import React from "react";
import { UserDetail, AdendaContrato, Devengamiento } from "@/services/user.service";

interface FichaDoctoralPDFProps {
    user: UserDetail;
    emitidoPor?: string;
    folio?: string;
}

const parseObservacionesList = (text?: string | null): string[] => {
    if (!text || !text.trim()) return [];
    return text
        .split(/\r?\n+/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
};

export const FichaDoctoralPDF: React.FC<FichaDoctoralPDFProps> = ({
    user,
    emitidoPor = "Personal Técnico UGD UCE",
    folio,
}) => {
    const fullName = user.full_name || user.name || "Sin nombre registrado";
    const demograficos = user.demograficos;
    const academico = user.academico;
    const expedientes = user.expedientes || [];
    const exp = expedientes[0];
    const adendas: AdendaContrato[] = exp?.adendas || [];
    const devengamiento: Devengamiento | null | undefined = exp?.devengamiento;

    // Formato de fechas
    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return "No registrado";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString("es-EC", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    const fechaEmision = new Date().toLocaleDateString("es-EC", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const isPre = user.isPreRegistered || user.estado === "preregistrado";
    const isActive = (user.estado === "activo" || user.isActive === true) && !isPre;

    const estadoTexto = isPre
        ? "PRE-REGISTRADO"
        : isActive
        ? "ACTIVO / HABILITADO"
        : "INHABILITADO";

    const cedulaDoc = demograficos?.cedula || user.cedula;
    const folioFinal =
        folio ||
        `UGD-${new Date().getFullYear()}-${
            cedulaDoc ? cedulaDoc.slice(-6) : String(user.id).slice(0, 6).toUpperCase()
        }`;

    return (
        <div id="ficha-doctoral-impresion" className="hidden print:block font-serif text-black bg-white p-0 m-0">
            {/* Reglas de Impresión Estrictas A4 */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 10mm 12mm 12mm 12mm;
                    }
                    html, body {
                        background: #ffffff !important;
                        color: #000000 !important;
                        font-family: 'Times New Roman', Times, serif, system-ui;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    /* Ocultar interfaz del dashboard de forma robusta */
                    body * {
                        visibility: hidden !important;
                    }
                    #ficha-doctoral-impresion, #ficha-doctoral-impresion * {
                        visibility: visible !important;
                    }
                    #ficha-doctoral-impresion {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        display: block !important;
                        background: #ffffff !important;
                        z-index: 999999 !important;
                    }
                    .print-avoid-break {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                }
            `}} />

            <div className="w-full bg-white text-[#111111] leading-tight text-[10.5pt]">
                
                {/* 1. MEMBRETE OFICIAL UNIVERSITARIO */}
                <header className="border-b-2 border-[#172D4D] pb-3 mb-3">
                    <div className="flex items-center justify-between gap-4">
                        {/* Escudo Oficial UCE */}
                        <div className="w-20 h-20 shrink-0 flex items-center justify-center p-1 bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/logo-uce.png"
                                alt="Escudo Universidad Central del Ecuador"
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {/* Texto Membrete */}
                        <div className="text-center flex-1">
                            <h1 className="text-[13pt] font-bold uppercase tracking-wide text-[#172D4D] leading-none mb-1">
                                Universidad Central del Ecuador
                            </h1>
                            <h2 className="text-[9.5pt] font-semibold uppercase tracking-wider text-[#333333] leading-tight">
                                Vicerrectorado de Investigación, Doctorados e Innovación
                            </h2>
                            <h3 className="text-[9pt] uppercase text-[#444444] font-medium leading-tight">
                                Dirección General de Posgrado • Unidad de Gestión de Doctorados (UGD)
                            </h3>
                            <div className="mt-1.5 inline-block px-3 py-0.5 bg-[#F8F6F0] border border-[#B58A45]/60 rounded text-[9pt] font-bold uppercase tracking-wider text-[#172D4D]">
                                Ficha Técnica y Expediente de Integrante Doctoral
                            </div>
                        </div>

                        {/* Cuadro de Folio y Fecha */}
                        <div className="w-44 text-right text-[8pt] border border-[#B58A45]/50 p-2 rounded-sm bg-[#FAF8F5] space-y-1 shrink-0">
                            <div>
                                <span className="font-bold text-[#172D4D] block text-[7.5pt] uppercase">Folio Oficial:</span>
                                <span className="font-mono font-bold text-[8.5pt] text-[#111111]">{folioFinal}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-0.5">
                                <span className="text-gray-500 block text-[7pt]">Emisión:</span>
                                <span className="font-medium text-[#222222]">{fechaEmision}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-0.5">
                                <span className="text-gray-500 block text-[7pt]">Estado en Padrón:</span>
                                <span className="font-bold text-[#172D4D] text-[7.5pt]">{estadoTexto}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* 2. SECCIÓN I: IDENTIDAD Y DATOS DEMOGRÁFICOS */}
                <section className="mb-3 print-avoid-break">
                    <div className="bg-[#172D4D] text-white px-2 py-0.5 text-[8.5pt] font-bold uppercase tracking-wider mb-1 flex justify-between items-center">
                        <span>I. Datos de Identidad y Contacto Oficial</span>
                        <span className="text-[7.5pt] font-normal opacity-90">Padrón Oficial UGD</span>
                    </div>

                    <table className="w-full border-collapse border border-gray-300 text-[8.5pt]">
                        <tbody>
                            <tr>
                                <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold w-[25%] text-[#172D4D]">
                                    Nombres y Apellidos:
                                </td>
                                <td className="border border-gray-300 p-1.5 font-semibold text-[9.5pt]" colSpan={3}>
                                    {fullName}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold text-[#172D4D]">
                                    Cédula de Identidad:
                                </td>
                                <td className="border border-gray-300 p-1.5 font-mono font-semibold">
                                    {demograficos?.cedula || user.cedula || "No registrada"}
                                </td>
                                <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold text-[#172D4D] w-[20%]">
                                    Sexo / Género:
                                </td>
                                <td className="border border-gray-300 p-1.5">
                                    {demograficos?.sexo === "H" ? "Hombre (H)" : demograficos?.sexo === "M" ? "Mujer (M)" : "No especificado"}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold text-[#172D4D]">
                                    Fecha de Nacimiento:
                                </td>
                                <td className="border border-gray-300 p-1.5">
                                    {formatDate(demograficos?.fechaNacimiento)}
                                </td>
                                <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold text-[#172D4D]">
                                    Teléfono de Contacto:
                                </td>
                                <td className="border border-gray-300 p-1.5 font-mono">
                                    {demograficos?.telefono || "No registrado"}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold text-[#172D4D]">
                                    Correo Institucional UCE:
                                </td>
                                <td className="border border-gray-300 p-1.5 font-mono text-[#172D4D] font-semibold" colSpan={3}>
                                    {demograficos?.correoInstitucional || user.email || "No registrado"}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                {/* 3. SECCIÓN II: FILIACIÓN ACADÉMICA Y ARCHIVO UGD */}
                <section className="mb-3 print-avoid-break">
                    <div className="bg-[#172D4D] text-white px-2 py-0.5 text-[8.5pt] font-bold uppercase tracking-wider mb-1 flex justify-between items-center">
                        <span>II. Filiación Académica y Archivo Físico UGD</span>
                        <span className="text-[7.5pt] font-normal opacity-90">Facultad, Carrera y Archivo</span>
                    </div>

                    <table className="w-full border-collapse border border-gray-300 text-[8.5pt]">
                        <tbody>
                            <tr>
                                <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold w-[25%] text-[#172D4D]">
                                    Facultad de Procedencia:
                                </td>
                                <td className="border border-gray-300 p-1.5 font-medium">
                                    {academico?.facultad || "Sin facultad asignada"}
                                    {academico?.facultadCodigo && ` (${academico.facultadCodigo})`}
                                </td>
                                <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold text-[#172D4D] w-[20%]">
                                    Carrera / Depto:
                                </td>
                                <td className="border border-gray-300 p-1.5 font-medium">
                                    {academico?.carrera || "Sin carrera asignada"}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold text-[#172D4D]">
                                    Título de 3er Nivel (Pregrado):
                                </td>
                                <td className="border border-gray-300 p-1.5" colSpan={3}>
                                    {academico?.tituloTercerNivel || "No registrado en nómina"}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold text-[#172D4D]">
                                    Título de 4to Nivel (Maestría):
                                </td>
                                <td className="border border-gray-300 p-1.5" colSpan={3}>
                                    {academico?.tituloCuartoNivel || "No registrado en nómina"}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold text-[#172D4D]">
                                    Carpeta Física en Archivo:
                                </td>
                                <td className="border border-gray-300 p-1.5 font-mono font-bold text-[#172D4D]">
                                    {academico?.carpetaFisica || "Sin carpeta asignada"}
                                </td>
                                <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold text-[#172D4D]">
                                    N° Orden / Nómina:
                                </td>
                                <td className="border border-gray-300 p-1.5 font-mono font-bold">
                                    {academico?.numeroOrden ? `#${academico.numeroOrden}` : "No asignado"}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                {/* 4. SECCIÓN III: EXPEDIENTE DOCTORAL Y PROYECTO DE INVESTIGACIÓN */}
                <section className="mb-3 print-avoid-break">
                    <div className="bg-[#172D4D] text-white px-2 py-0.5 text-[8.5pt] font-bold uppercase tracking-wider mb-1 flex justify-between items-center">
                        <span>III. Expediente Doctoral y Proyecto de Investigación</span>
                        <span className="text-[7.5pt] font-normal opacity-90">Seguimiento Académico y Beca</span>
                    </div>

                    <table className="w-full border-collapse border border-gray-300 text-[8.5pt]">
                        <tbody>
                            <tr>
                                <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold w-[25%] text-[#172D4D]">
                                    Programa Doctoral:
                                </td>
                                <td className="border border-gray-300 p-1.5 font-semibold" colSpan={3}>
                                    {exp?.programaDoctoral || "Programa no especificado"}
                                    {exp?.tituloAObtener && ` — Título a obtener: ${exp.tituloAObtener}`}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold text-[#172D4D]">
                                    Institución de Destino:
                                </td>
                                <td className="border border-gray-300 p-1.5">
                                    {exp?.institucionDestino || "—"}
                                </td>
                                <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold text-[#172D4D] w-[20%]">
                                    País de Destino:
                                </td>
                                <td className="border border-gray-300 p-1.5">
                                    {exp?.paisDestino || "—"}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold text-[#172D4D]">
                                    Tipo de Convenio:
                                </td>
                                <td className="border border-gray-300 p-1.5">
                                    {exp?.convenio || "Directo Institucional"}
                                </td>
                                <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold text-[#172D4D]">
                                    Estado del Expediente:
                                </td>
                                <td className="border border-gray-300 p-1.5 font-bold text-[#172D4D]">
                                    {exp?.estado?.replace(/_/g, " ") || "EN ESTUDIOS"}
                                    {exp?.tieneAlertaLegal && (
                                        <span className="ml-2 px-1.5 py-0.5 text-[7pt] bg-amber-100 text-amber-900 border border-amber-300 rounded font-semibold uppercase">
                                            [Alerta Jurídica Activa]
                                        </span>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold text-[#172D4D]">
                                    Financiamiento / Beca:
                                </td>
                                <td className="border border-gray-300 p-1.5">
                                    {exp?.tipoFinanciamiento || "Beca"}
                                    {exp?.tieneApoyoProyecto ? " (Con apoyo de proyectos)" : " (Beca regular)"}
                                </td>
                                <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold text-[#172D4D]">
                                    Período de Contrato:
                                </td>
                                <td className="border border-gray-300 p-1.5 text-[8pt]">
                                    {exp?.contratoInicio && exp?.contratoFin 
                                        ? `${formatDate(exp.contratoInicio)} al ${formatDate(exp.contratoFin)}` 
                                        : "Vigente según calendario"}
                                    {exp?.contratoMeses && ` (${exp.contratoMeses} meses)`}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold text-[#172D4D]">
                                    Oficio Registro Proyecto:
                                </td>
                                <td className="border border-gray-300 p-1.5 font-mono text-[8pt]" colSpan={3}>
                                    {exp?.oficioRegistroProyecto 
                                        ? `${exp.oficioRegistroProyecto} ${exp.fechaOficioRegistro ? `(Fecha de aprobación: ${formatDate(exp.fechaOficioRegistro)})` : ""}` 
                                        : "Sin oficio de registro registrado"}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold text-[#172D4D] align-top">
                                    Tema de Tesis / Proyecto:
                                </td>
                                <td className="border border-gray-300 p-1.5 italic text-[#222222]" colSpan={3}>
                                    {exp?.tituloInvestigacion 
                                        ? `"${exp.tituloInvestigacion}"` 
                                        : "Sin tema de investigación registrado en expediente"}
                                </td>
                            </tr>
                            {exp?.observaciones && (
                                <tr>
                                    <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold text-[#172D4D] align-top">
                                        Observaciones UGD:
                                    </td>
                                    <td className="border border-gray-300 p-1.5 text-[#333333] text-[8pt]" colSpan={3}>
                                        {parseObservacionesList(exp.observaciones).length > 1 ? (
                                            <ul className="list-disc pl-4 space-y-1">
                                                {parseObservacionesList(exp.observaciones).map((obsItem, obsIdx) => (
                                                    <li key={obsIdx} className="leading-snug">
                                                        {obsItem}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="leading-snug">{exp.observaciones}</p>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>

                {/* 5. SECCIÓN IV: HISTORIAL DE ADENDAS Y PRÓRROGAS DE CONTRATO */}
                <section className="mb-3 print-avoid-break">
                    <div className="bg-[#172D4D] text-white px-2 py-0.5 text-[8.5pt] font-bold uppercase tracking-wider mb-1 flex justify-between items-center">
                        <span>IV. Historial de Adendas y Modificaciones Contractuales</span>
                        <span className="text-[7.5pt] font-normal opacity-90">
                            {adendas.length > 0 ? `${adendas.length} Adenda(s) registrada(s)` : "Sin modificaciones"}
                        </span>
                    </div>

                    {adendas.length > 0 ? (
                        <table className="w-full border-collapse border border-gray-300 text-[8pt]">
                            <thead>
                                <tr className="bg-[#F2F5F8] text-[#172D4D]">
                                    <th className="border border-gray-300 p-1 text-center w-[12%]">Adenda</th>
                                    <th className="border border-gray-300 p-1 text-left w-[38%]">Tipo de Modificación</th>
                                    <th className="border border-gray-300 p-1 text-center w-[15%]">Plazo</th>
                                    <th className="border border-gray-300 p-1 text-left w-[35%]">Vigencia Aprobada</th>
                                </tr>
                            </thead>
                            <tbody>
                                {adendas.map((ad) => (
                                    <tr key={ad.id || ad.numeroAdenda}>
                                        <td className="border border-gray-300 p-1 text-center font-bold">
                                            N° {ad.numeroAdenda}
                                        </td>
                                        <td className="border border-gray-300 p-1">
                                            {ad.tipoModificacion || "Ampliación de Plazo"}
                                        </td>
                                        <td className="border border-gray-300 p-1 text-center font-mono">
                                            {ad.meses ? `+${ad.meses} meses` : "—"}
                                        </td>
                                        <td className="border border-gray-300 p-1">
                                            {formatDate(ad.fechaInicio)} al {formatDate(ad.fechaFin)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="border border-gray-300 p-2 text-center text-gray-500 text-[8pt] italic bg-[#FAF8F5]">
                            El contrato original no registra adendas ni prórrogas formalizadas en el archivo de la UGD.
                        </div>
                    )}
                </section>

                {/* 6. SECCIÓN V: COMPROMISO DE DEVENGAMIENTO INSTITUCIONAL */}
                <section className="mb-4 print-avoid-break">
                    <div className="bg-[#172D4D] text-white px-2 py-0.5 text-[8.5pt] font-bold uppercase tracking-wider mb-1 flex justify-between items-center">
                        <span>V. Compromiso de Devengamiento Institucional</span>
                        <span className="text-[7.5pt] font-normal opacity-90">Retribución de Beca UCE</span>
                    </div>

                    {devengamiento ? (
                        <table className="w-full border-collapse border border-gray-300 text-[8.5pt]">
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold w-[25%] text-[#172D4D]">
                                        Estado de Devengamiento:
                                    </td>
                                    <td className="border border-gray-300 p-1.5 font-bold text-[#172D4D]">
                                        {devengamiento.estado?.replace(/_/g, " ") || "EN CURSO"}
                                    </td>
                                    <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold text-[#172D4D] w-[20%]">
                                        Registro Senescyt:
                                    </td>
                                    <td className="border border-gray-300 p-1.5 font-mono font-bold text-[9pt]">
                                        {devengamiento.registroSenescyt || "En trámite de homologación"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold text-[#172D4D]">
                                        Tiempo Total a Devengar:
                                    </td>
                                    <td className="border border-gray-300 p-1.5 font-semibold">
                                        {devengamiento.tiempoTexto || "No calculado"}
                                    </td>
                                    <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold text-[#172D4D]">
                                        Período de Cumplimiento:
                                    </td>
                                    <td className="border border-gray-300 p-1.5 text-[8pt]">
                                        {formatDate(devengamiento.fechaInicio)} al {formatDate(devengamiento.fechaFinEstimada)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold text-[#172D4D]">
                                        Oficio Notificación Inicio:
                                    </td>
                                    <td className="border border-gray-300 p-1.5 font-mono text-[8pt]">
                                        {devengamiento.oficioNotificacion || "—"}
                                    </td>
                                    <td className="border border-gray-300 bg-[#F2F5F8] p-1.5 font-bold text-[#172D4D]">
                                        Acta Terminación / Cierre:
                                    </td>
                                    <td className="border border-gray-300 p-1.5 font-mono text-[8pt]">
                                        {devengamiento.oficioActaTerminacion || devengamiento.oficioCierreProyecto || "En trámite institucional"}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    ) : (
                        <div className="border border-gray-300 p-2 text-center text-gray-500 text-[8pt] italic bg-[#FAF8F5]">
                            No registra compromiso de devengamiento activo (El estudiante se encuentra en período formativo o no aplica retribución por beca).
                        </div>
                    )}
                </section>

                {/* 7. SECCIÓN VI: DILIGENCIA Y VALIDACIÓN INSTITUCIONAL */}
                <section className="mt-6 pt-3 border-t border-gray-300 print-avoid-break">
                    <div className="grid grid-cols-2 gap-10 text-center">
                        {/* Firma del Responsable */}
                        <div className="space-y-1">
                            <div className="h-14 flex items-end justify-center">
                                <div className="w-56 border-b border-black"></div>
                            </div>
                            <p className="font-bold text-[8.5pt] uppercase text-[#111111]">
                                {emitidoPor}
                            </p>
                            <p className="text-[7.5pt] text-gray-600">
                                Responsable de Emisión / Analista UGD
                            </p>
                            <p className="text-[7pt] text-gray-500">
                                Unidad de Gestión de Doctorados (UGD)
                            </p>
                        </div>

                        {/* Sello Oficial UGD */}
                        <div className="space-y-1">
                            <div className="h-14 flex items-center justify-center">
                                <div className="w-24 h-14 border-2 border-dashed border-[#172D4D]/35 rounded flex items-center justify-center text-[7pt] text-[#172D4D]/70 uppercase font-bold tracking-wider">
                                    Sello Oficial UGD
                                </div>
                            </div>
                            <p className="font-bold text-[8.5pt] uppercase text-[#111111]">
                                Dirección General de Posgrado
                            </p>
                            <p className="text-[7.5pt] text-gray-600">
                                Universidad Central del Ecuador
                            </p>
                            <p className="text-[7pt] text-gray-500">
                                Quito - Ecuador
                            </p>
                        </div>
                    </div>

                    {/* Nota Legal y Pie de Página */}
                    <div className="mt-4 pt-2 border-t border-gray-200 text-center text-[6.5pt] text-gray-500 leading-tight">
                        <p>
                            Este documento es emitido de manera oficial y automatizada a través del Sistema Integrado de la Unidad de Gestión de Doctorados (UGD) de la Universidad Central del Ecuador.
                        </p>
                        <p className="mt-0.5">
                            La información aquí contenida reposa en los expedientes físicos y bases de datos institucionales. Sede Central UCE: Ciudadela Universitaria, Av. América y Av. Universitaria, Quito, Ecuador.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};
