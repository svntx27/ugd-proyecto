import { prisma } from "../lib/prisma";

export interface ExpedienteSyncPayload {
  tituloInvestigacion?: string;
  estadoExpediente?: string;
  tipoFinanciamiento?: string;
  contratoInicio?: string | Date;
  contratoFin?: string | Date;
  contratoMeses?: number | string;
  tieneApoyoProyecto?: boolean;
  oficioRegistroProyecto?: string;
  fechaOficioRegistro?: string | Date;
  observaciones?: string;
  tieneAlertaLegal?: boolean;
  programaDoctoral?: string;
  tituloAObtener?: string;
  institucionDestino?: string;
  paisDestino?: string;
  convenio?: string;
  adendas?: Array<{
    numeroAdenda?: number;
    tipoModificacion?: string;
    meses?: number | string | null;
    fechaInicio?: string | Date | null;
    fechaFin?: string | Date | null;
  }>;
  registroSenescyt?: string;
  tiempoTexto?: string;
  devengamientoFechaInicio?: string | Date;
  devengamientoFechaFinEstimada?: string | Date;
  devengamientoEstado?: string;
  oficioNotificacion?: string;
  oficioActaTerminacion?: string;
  oficioCierreProyecto?: string;
}

/**
 * Resuelve o crea las entidades Facultad y Carrera por nombre o id
 */
export async function resolveFacultadAndCarrera(
  facultadVal?: string | null,
  carreraVal?: string | null
): Promise<{ facultadId: string | null | undefined; carreraId: string | null | undefined }> {
  let facultadId: string | null | undefined = undefined;
  let carreraId: string | null | undefined = undefined;

  if (facultadVal !== undefined) {
    if (facultadVal && String(facultadVal).trim()) {
      const facName = String(facultadVal).trim();
      let fac = await prisma.facultad.findFirst({
        where: {
          OR: [
            { id: facName },
            { nombre: { equals: facName, mode: "insensitive" } },
            { codigo: { equals: facName, mode: "insensitive" } },
          ],
        },
      });
      if (!fac) {
        fac = await prisma.facultad.create({
          data: {
            nombre: facName,
            codigo: facName.slice(0, 10).toUpperCase(),
          },
        });
      }
      facultadId = fac.id;
    } else {
      facultadId = null;
    }
  }

  if (carreraVal !== undefined) {
    if (carreraVal && String(carreraVal).trim()) {
      const carName = String(carreraVal).trim();
      let car = await prisma.carrera.findFirst({
        where: {
          OR: [
            { id: carName },
            { nombre: { equals: carName, mode: "insensitive" } },
          ],
        },
      });
      if (!car) {
        const defaultFacId = facultadId || (await prisma.facultad.findFirst())?.id;
        if (defaultFacId) {
          car = await prisma.carrera.create({
            data: {
              nombre: carName,
              facultadId: defaultFacId,
            },
          });
        }
      }
      if (car) carreraId = car.id;
    } else {
      carreraId = null;
    }
  }

  return { facultadId, carreraId };
}

/**
 * Sincroniza expediente doctoral, programa doctoral, adendas y devengamiento para un doctorando
 */
export async function syncExpediente(doctorandoId: string, payload: ExpedienteSyncPayload): Promise<void> {
  const {
    tituloInvestigacion,
    estadoExpediente,
    tipoFinanciamiento,
    contratoInicio,
    contratoFin,
    contratoMeses,
    tieneApoyoProyecto,
    oficioRegistroProyecto,
    fechaOficioRegistro,
    observaciones,
    tieneAlertaLegal,
    programaDoctoral,
    tituloAObtener,
    institucionDestino,
    paisDestino,
    convenio,
    adendas,
    registroSenescyt,
    tiempoTexto,
    devengamientoFechaInicio,
    devengamientoFechaFinEstimada,
    devengamientoEstado,
    oficioNotificacion,
    oficioActaTerminacion,
    oficioCierreProyecto,
  } = payload;

  let primaryExp = await prisma.expedienteDoctoral.findFirst({
    where: { doctorandoId },
    orderBy: { createdAt: "asc" },
  });

  const hasExpedienteFields =
    tituloInvestigacion !== undefined ||
    estadoExpediente !== undefined ||
    tipoFinanciamiento !== undefined ||
    contratoInicio !== undefined ||
    contratoFin !== undefined ||
    contratoMeses !== undefined ||
    tieneApoyoProyecto !== undefined ||
    oficioRegistroProyecto !== undefined ||
    fechaOficioRegistro !== undefined ||
    observaciones !== undefined ||
    tieneAlertaLegal !== undefined ||
    programaDoctoral !== undefined ||
    tituloAObtener !== undefined ||
    institucionDestino !== undefined ||
    paisDestino !== undefined ||
    convenio !== undefined ||
    Array.isArray(adendas);

  const hasDevengamientoFields =
    registroSenescyt !== undefined ||
    tiempoTexto !== undefined ||
    devengamientoFechaInicio !== undefined ||
    devengamientoFechaFinEstimada !== undefined ||
    devengamientoEstado !== undefined ||
    oficioNotificacion !== undefined ||
    oficioActaTerminacion !== undefined ||
    oficioCierreProyecto !== undefined;

  // Si no existe un expediente previo pero se envían datos académicos/contractuales, crearlo
  if (!primaryExp && (hasExpedienteFields || hasDevengamientoFields)) {
    const instName = institucionDestino ? String(institucionDestino).trim() : "Institución no especificada";
    let inst = await prisma.institucionDestino.findFirst({
      where: { nombre: { equals: instName, mode: "insensitive" } },
    });
    if (!inst) {
      inst = await prisma.institucionDestino.create({
        data: {
          nombre: instName,
          pais: paisDestino ? String(paisDestino).trim() : "Ecuador",
        },
      });
    }

    const progName = programaDoctoral ? String(programaDoctoral).trim() : "Programa Doctoral";
    let prog = await prisma.programaDoctoral.findFirst({
      where: {
        institucionDestinoId: inst.id,
        nombre: { equals: progName, mode: "insensitive" },
      },
    });
    if (!prog) {
      prog = await prisma.programaDoctoral.create({
        data: {
          nombre: progName,
          tituloAObtener: tituloAObtener ? String(tituloAObtener).trim() : null,
          institucionDestinoId: inst.id,
        },
      });
    }

    let convId: string | null = null;
    if (convenio && String(convenio).trim()) {
      const convName = String(convenio).trim();
      let conv = await prisma.convenio.findFirst({
        where: { nombre: { equals: convName, mode: "insensitive" } },
      });
      if (!conv) {
        conv = await prisma.convenio.create({ data: { nombre: convName } });
      }
      convId = conv.id;
    }

    primaryExp = await prisma.expedienteDoctoral.create({
      data: {
        doctorandoId,
        programaDoctoralId: prog.id,
        convenioId: convId,
        tituloInvestigacion: tituloInvestigacion ? String(tituloInvestigacion).trim() : null,
        estado: estadoExpediente ? String(estadoExpediente).trim() : "EN_ESTUDIOS",
        tipoFinanciamiento: tipoFinanciamiento ? String(tipoFinanciamiento).trim() : "Beca",
        contratoInicio: contratoInicio ? new Date(contratoInicio) : null,
        contratoFin: contratoFin ? new Date(contratoFin) : null,
        contratoMeses:
          contratoMeses !== "" && contratoMeses !== null && contratoMeses !== undefined
            ? Number(contratoMeses)
            : null,
        tieneApoyoProyecto: tieneApoyoProyecto !== undefined ? Boolean(tieneApoyoProyecto) : false,
        oficioRegistroProyecto: oficioRegistroProyecto ? String(oficioRegistroProyecto).trim() : null,
        fechaOficioRegistro: fechaOficioRegistro ? new Date(fechaOficioRegistro) : null,
        observaciones: observaciones ? String(observaciones).trim() : null,
        tieneAlertaLegal: tieneAlertaLegal !== undefined ? Boolean(tieneAlertaLegal) : false,
      },
    });
  }

  if (!primaryExp) return;

  // 1. Actualizar ExpedienteDoctoral
  if (hasExpedienteFields) {
    await prisma.expedienteDoctoral.update({
      where: { id: primaryExp.id },
      data: {
        tituloInvestigacion:
          tituloInvestigacion !== undefined
            ? (tituloInvestigacion ? String(tituloInvestigacion).trim() : null)
            : undefined,
        estado: estadoExpediente !== undefined ? String(estadoExpediente).trim() : undefined,
        tipoFinanciamiento:
          tipoFinanciamiento !== undefined ? String(tipoFinanciamiento).trim() : undefined,
        contratoInicio:
          contratoInicio !== undefined
            ? (contratoInicio ? new Date(contratoInicio) : null)
            : undefined,
        contratoFin:
          contratoFin !== undefined
            ? (contratoFin ? new Date(contratoFin) : null)
            : undefined,
        contratoMeses:
          contratoMeses !== undefined
            ? (contratoMeses !== "" && contratoMeses !== null ? Number(contratoMeses) : null)
            : undefined,
        tieneApoyoProyecto:
          tieneApoyoProyecto !== undefined ? Boolean(tieneApoyoProyecto) : undefined,
        oficioRegistroProyecto:
          oficioRegistroProyecto !== undefined
            ? (oficioRegistroProyecto ? String(oficioRegistroProyecto).trim() : null)
            : undefined,
        fechaOficioRegistro:
          fechaOficioRegistro !== undefined
            ? (fechaOficioRegistro ? new Date(fechaOficioRegistro) : null)
            : undefined,
        observaciones:
          observaciones !== undefined
            ? (observaciones ? String(observaciones).trim() : null)
            : undefined,
        tieneAlertaLegal:
          tieneAlertaLegal !== undefined ? Boolean(tieneAlertaLegal) : undefined,
      },
    });
  }

  // 2. Programa Doctoral, Destino y Convenio
  if (
    primaryExp.programaDoctoralId &&
    (programaDoctoral !== undefined ||
      tituloAObtener !== undefined ||
      institucionDestino !== undefined ||
      paisDestino !== undefined)
  ) {
    const prog = await prisma.programaDoctoral.findUnique({
      where: { id: primaryExp.programaDoctoralId },
      include: { institucionDestino: true },
    });

    if (prog) {
      if (programaDoctoral !== undefined || tituloAObtener !== undefined) {
        await prisma.programaDoctoral.update({
          where: { id: prog.id },
          data: {
            nombre:
              programaDoctoral !== undefined && programaDoctoral
                ? String(programaDoctoral).trim()
                : undefined,
            tituloAObtener:
              tituloAObtener !== undefined
                ? (tituloAObtener ? String(tituloAObtener).trim() : null)
                : undefined,
          },
        });
      }

      if (
        prog.institucionDestinoId &&
        (institucionDestino !== undefined || paisDestino !== undefined)
      ) {
        await prisma.institucionDestino.update({
          where: { id: prog.institucionDestinoId },
          data: {
            nombre:
              institucionDestino !== undefined && institucionDestino
                ? String(institucionDestino).trim()
                : undefined,
            pais:
              paisDestino !== undefined && paisDestino
                ? String(paisDestino).trim()
                : undefined,
          },
        });
      }
    }
  }

  if (convenio !== undefined) {
    if (convenio && String(convenio).trim()) {
      const convName = String(convenio).trim();
      let conv = await prisma.convenio.findFirst({
        where: { nombre: { equals: convName, mode: "insensitive" } },
      });
      if (!conv) {
        conv = await prisma.convenio.create({ data: { nombre: convName } });
      }
      await prisma.expedienteDoctoral.update({
        where: { id: primaryExp.id },
        data: { convenioId: conv.id },
      });
    } else {
      await prisma.expedienteDoctoral.update({
        where: { id: primaryExp.id },
        data: { convenioId: null },
      });
    }
  }

  // 3. Adendas Contractuales (actualización atómica)
  if (Array.isArray(adendas)) {
    await prisma.$transaction(async (tx) => {
      await tx.adendaContrato.deleteMany({
        where: { expedienteId: primaryExp.id },
      });

      for (let i = 0; i < adendas.length; i++) {
        const a = adendas[i];
        if (!a) continue;
        await tx.adendaContrato.create({
          data: {
            expedienteId: primaryExp.id,
            numeroAdenda: Number(a.numeroAdenda) || i + 1,
            tipoModificacion: a.tipoModificacion
              ? String(a.tipoModificacion).trim()
              : "Ampliación",
            meses:
              a.meses !== null && a.meses !== undefined && a.meses !== ""
                ? Number(a.meses)
                : null,
            fechaInicio: a.fechaInicio ? new Date(a.fechaInicio) : null,
            fechaFin: a.fechaFin ? new Date(a.fechaFin) : null,
          },
        });
      }
    });
  }

  // 4. Devengamiento Institucional
  if (hasDevengamientoFields) {
    await prisma.devengamiento.upsert({
      where: { expedienteId: primaryExp.id },
      create: {
        expedienteId: primaryExp.id,
        registroSenescyt:
          registroSenescyt !== undefined
            ? (registroSenescyt ? String(registroSenescyt).trim() : null)
            : null,
        tiempoTexto:
          tiempoTexto !== undefined ? (tiempoTexto ? String(tiempoTexto).trim() : null) : null,
        fechaInicio:
          devengamientoFechaInicio !== undefined
            ? (devengamientoFechaInicio ? new Date(devengamientoFechaInicio) : null)
            : null,
        fechaFinEstimada:
          devengamientoFechaFinEstimada !== undefined
            ? (devengamientoFechaFinEstimada ? new Date(devengamientoFechaFinEstimada) : null)
            : null,
        estado:
          devengamientoEstado !== undefined ? String(devengamientoEstado).trim() : "PENDIENTE",
        oficioNotificacion:
          oficioNotificacion !== undefined
            ? (oficioNotificacion ? String(oficioNotificacion).trim() : null)
            : null,
        oficioActaTerminacion:
          oficioActaTerminacion !== undefined
            ? (oficioActaTerminacion ? String(oficioActaTerminacion).trim() : null)
            : null,
        oficioCierreProyecto:
          oficioCierreProyecto !== undefined
            ? (oficioCierreProyecto ? String(oficioCierreProyecto).trim() : null)
            : null,
      },
      update: {
        registroSenescyt:
          registroSenescyt !== undefined
            ? (registroSenescyt ? String(registroSenescyt).trim() : null)
            : undefined,
        tiempoTexto:
          tiempoTexto !== undefined
            ? (tiempoTexto ? String(tiempoTexto).trim() : null)
            : undefined,
        fechaInicio:
          devengamientoFechaInicio !== undefined
            ? (devengamientoFechaInicio ? new Date(devengamientoFechaInicio) : null)
            : undefined,
        fechaFinEstimada:
          devengamientoFechaFinEstimada !== undefined
            ? (devengamientoFechaFinEstimada ? new Date(devengamientoFechaFinEstimada) : null)
            : undefined,
        estado:
          devengamientoEstado !== undefined ? String(devengamientoEstado).trim() : undefined,
        oficioNotificacion:
          oficioNotificacion !== undefined
            ? (oficioNotificacion ? String(oficioNotificacion).trim() : null)
            : undefined,
        oficioActaTerminacion:
          oficioActaTerminacion !== undefined
            ? (oficioActaTerminacion ? String(oficioActaTerminacion).trim() : null)
            : undefined,
        oficioCierreProyecto:
          oficioCierreProyecto !== undefined
            ? (oficioCierreProyecto ? String(oficioCierreProyecto).trim() : null)
            : undefined,
      },
    });
  }
}
