import type { Response } from "express";
import { prisma } from "../lib/prisma";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { resolveFacultadAndCarrera, syncExpediente } from "../services/academic.service";

/**
 * GET /users o /api/users
 * Retorna tanto los usuarios con credenciales (User) como los doctorandos
 * registrados en la nómina académica UGD que aún no han creado su contraseña.
 */
export async function getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const [rawUsers, preRegisteredDoctorandos] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          userType: true,
          isActive: true,
          createdAt: true,
          role: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          doctorando: {
            select: {
              id: true,
              cedula: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.doctorando.findMany({
        where: {
          userId: null,
        },
        select: {
          id: true,
          cedula: true,
          nombres: true,
          apellidos: true,
          correoInstitucional: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const formattedUsers = rawUsers.map((u) => ({
      id: u.id,
      doctorando_id: u.doctorando?.id || undefined,
      full_name: u.name,
      name: u.name,
      email: u.email,
      cedula: u.doctorando?.cedula || undefined,
      userType: u.userType,
      role: u.role.code.toLowerCase() === "estudiante" ? "student" : "admin",
      role_code: u.role.code,
      role_name: u.role.name,
      estado: u.isActive ? "activo" : "inactivo",
      isActive: u.isActive,
      isPreRegistered: false,
      hasAccount: true,
      created_at: u.createdAt,
    }));

    const formattedPreRegistered = preRegisteredDoctorandos.map((d) => {
      const fullName = `${d.nombres} ${d.apellidos}`.trim();
      const cleanId = d.id.startsWith("doc_") ? d.id : `doc_${d.id}`;
      return {
        id: cleanId,
        doctorando_id: d.id,
        full_name: fullName,
        name: fullName,
        email: d.correoInstitucional,
        cedula: d.cedula,
        userType: "Estudiante",
        role: "student",
        role_code: "ESTUDIANTE",
        role_name: "Estudiante Doctorando",
        estado: "preregistrado",
        isActive: false,
        isPreRegistered: true,
        hasAccount: false,
        created_at: d.createdAt,
      };
    });

    res.json([...formattedUsers, ...formattedPreRegistered]);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al consultar usuarios" });
  }
}

/**
 * GET /api/users/roles
 */
export async function getUserRoles(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    res.json({ roles });
  } catch (error) {
    console.error("Error al obtener roles:", error);
    res.status(500).json({ error: "Error al consultar roles" });
  }
}

/**
 * POST /users/estudiantes - Registrar nuevo estudiante doctorando en el padrón UGD
 */
export async function createStudent(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const hasPerm =
      req.user?.permissions.includes("USUARIOS_CREAR") ||
      req.user?.permissions.includes("ESTUDIANTES_CREAR") ||
      req.user?.role.code === "DESARROLLADOR" ||
      req.user?.role.code === "DIRECTOR";

    if (!hasPerm) {
      res.status(403).json({ error: "No dispones de privilegios para registrar nuevos estudiantes." });
      return;
    }

    const {
      cedula,
      nombres,
      apellidos,
      correoInstitucional,
      email,
      telefono,
      sexo,
      fechaNacimiento,
      tituloTercerNivel,
      tituloCuartoNivel,
      carpeta,
      numeroOrden,
    } = req.body;
    const cleanCedula = String(cedula || "").trim();
    const cleanNombres = String(nombres || "").trim();
    const cleanApellidos = String(apellidos || "").trim();
    const cleanEmail = String(correoInstitucional || email || "").trim().toLowerCase();
    const cleanTelefono = telefono ? String(telefono).trim() : null;
    const cleanSexo = sexo ? String(sexo).trim().toUpperCase() : null;
    const cleanFechaNacimiento = fechaNacimiento ? new Date(fechaNacimiento) : null;
    const cleanTituloTercero = tituloTercerNivel ? String(tituloTercerNivel).trim() : null;
    const cleanTituloCuarto = tituloCuartoNivel ? String(tituloCuartoNivel).trim() : null;
    const cleanCarpeta = carpeta ? String(carpeta).trim() : null;
    const cleanNumeroOrden =
      numeroOrden !== undefined && numeroOrden !== null && !isNaN(Number(numeroOrden))
        ? Number(numeroOrden)
        : null;

    if (!cleanCedula || !cleanNombres || !cleanApellidos || !cleanEmail) {
      res.status(400).json({ error: "Cédula, nombres, apellidos y correo institucional son obligatorios." });
      return;
    }

    if (!cleanEmail.endsWith("@uce.edu.ec")) {
      res.status(400).json({ error: "El correo debe pertenecer al dominio institucional @uce.edu.ec" });
      return;
    }

    // Verificar si ya existe en Doctorandos
    const existingDoctorando = await prisma.doctorando.findFirst({
      where: {
        OR: [{ cedula: cleanCedula }, { correoInstitucional: cleanEmail }],
      },
    });

    if (existingDoctorando) {
      res.status(409).json({
        error:
          existingDoctorando.cedula === cleanCedula
            ? "Ya existe un estudiante registrado con este número de cédula."
            : "Ya existe un estudiante registrado con este correo institucional.",
      });
      return;
    }

    // Verificar si ya existe en User
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      res.status(409).json({ error: "Ya existe una cuenta de usuario con este correo electrónico." });
      return;
    }

    const createdDoctorando = await prisma.doctorando.create({
      data: {
        cedula: cleanCedula,
        nombres: cleanNombres,
        apellidos: cleanApellidos,
        correoInstitucional: cleanEmail,
        telefono: cleanTelefono,
        sexo: cleanSexo,
        fechaNacimiento: cleanFechaNacimiento,
        tituloTercerNivel: cleanTituloTercero,
        tituloCuartoNivel: cleanTituloCuarto,
        carpeta: cleanCarpeta,
        numeroOrden: cleanNumeroOrden,
      },
    });

    const fullName = `${createdDoctorando.nombres} ${createdDoctorando.apellidos}`.trim();
    const cleanId = createdDoctorando.id.startsWith("doc_") ? createdDoctorando.id : `doc_${createdDoctorando.id}`;

    res.status(201).json({
      id: cleanId,
      doctorando_id: createdDoctorando.id,
      full_name: fullName,
      name: fullName,
      email: createdDoctorando.correoInstitucional,
      cedula: createdDoctorando.cedula,
      userType: "Estudiante",
      role: "student",
      role_code: "ESTUDIANTE",
      role_name: "Estudiante Doctorando",
      estado: "preregistrado",
      isActive: false,
      isPreRegistered: true,
      hasAccount: false,
      created_at: createdDoctorando.createdAt,
    });
  } catch (error) {
    console.error("Error al registrar doctorando:", error);
    res.status(500).json({ error: "Error interno al registrar estudiante doctorando." });
  }
}

/**
 * GET /users/:id - Obtener información completa y detallada de un usuario o doctorando
 */
export async function getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const rawId = String(req.params.id);

    // Caso 1: ID con prefijo doc_ (Doctorando pre-registrado)
    if (rawId.startsWith("doc_")) {
      const candidateDocIds = [
        rawId,
        rawId.replace(/^doc_/, ""),
        rawId.replace(/^(doc_)+/, "doc_"),
        rawId.replace(/^(doc_)+/, ""),
      ];
      const doctorando = await prisma.doctorando.findFirst({
        where: { id: { in: candidateDocIds } },
        include: {
          facultad: true,
          carrera: true,
          expedientes: {
            include: {
              programaDoctoral: {
                include: {
                  institucionDestino: true,
                },
              },
              convenio: true,
              adendas: {
                orderBy: { numeroAdenda: "asc" },
              },
              devengamiento: true,
            },
          },
          user: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!doctorando) {
        res.status(404).json({ error: "Estudiante doctorando no encontrado" });
        return;
      }

      const fullName = `${doctorando.nombres} ${doctorando.apellidos}`.trim();
      const cleanId = doctorando.id.startsWith("doc_") ? doctorando.id : `doc_${doctorando.id}`;

      res.json({
        id: cleanId,
        doctorando_id: doctorando.id,
        user_id: doctorando.userId,
        full_name: fullName,
        name: fullName,
        email: doctorando.correoInstitucional,
        cedula: doctorando.cedula,
        userType: "Estudiante",
        role: "student",
        role_code: "ESTUDIANTE",
        role_name: "Estudiante Doctorando",
        estado: "preregistrado",
        isActive: false,
        isPreRegistered: true,
        hasAccount: false,
        created_at: doctorando.createdAt,
        updated_at: doctorando.updatedAt,
        demograficos: {
          cedula: doctorando.cedula,
          nombres: doctorando.nombres,
          apellidos: doctorando.apellidos,
          sexo: doctorando.sexo,
          fechaNacimiento: doctorando.fechaNacimiento,
          telefono: doctorando.telefono,
          correoInstitucional: doctorando.correoInstitucional,
        },
        academico: {
          facultad: doctorando.facultad?.nombre || null,
          facultadCodigo: doctorando.facultad?.codigo || null,
          carrera: doctorando.carrera?.nombre || null,
          carpetaFisica: doctorando.carpeta || null,
          numeroOrden: doctorando.numeroOrden || null,
          tituloTercerNivel: doctorando.tituloTercerNivel || null,
          tituloCuartoNivel: doctorando.tituloCuartoNivel || null,
        },
        expedientes: doctorando.expedientes.map((exp) => ({
          id: exp.id,
          estado: exp.estado,
          tituloInvestigacion: exp.tituloInvestigacion,
          programaDoctoral: exp.programaDoctoral?.nombre || null,
          tituloAObtener: exp.programaDoctoral?.tituloAObtener || null,
          institucionDestino: exp.programaDoctoral?.institucionDestino?.nombre || null,
          paisDestino: exp.programaDoctoral?.institucionDestino?.pais || null,
          convenio: exp.convenio?.nombre || null,
          tipoFinanciamiento: exp.tipoFinanciamiento,
          tieneApoyoProyecto: exp.tieneApoyoProyecto,
          tieneAlertaLegal: exp.tieneAlertaLegal,
          contratoInicio: exp.contratoInicio,
          contratoFin: exp.contratoFin,
          contratoMeses: exp.contratoMeses,
          oficioRegistroProyecto: exp.oficioRegistroProyecto,
          fechaOficioRegistro: exp.fechaOficioRegistro,
          observaciones: exp.observaciones,
          adendas: exp.adendas,
          devengamiento: exp.devengamiento,
        })),
        permissions: ["PROCESOS_VER", "ESTUDIANTES_VER"],
        appointments: [],
      });
      return;
    }

    // Caso 2: Búsqueda por ID de User
    const user = await prisma.user.findUnique({
      where: { id: rawId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        doctorando: {
          include: {
            facultad: true,
            carrera: true,
            expedientes: {
              include: {
                programaDoctoral: {
                  include: {
                    institucionDestino: true,
                  },
                },
                convenio: true,
                adendas: {
                  orderBy: { numeroAdenda: "asc" },
                },
                devengamiento: true,
              },
            },
          },
        },
        appointments: {
          include: {
            representative: true,
          },
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });

    if (user) {
      const permissions = user.role.rolePermissions.map((rp) => ({
        code: rp.permission.code,
        name: rp.permission.name,
        category: rp.permission.category,
        description: rp.permission.description,
      }));

      const doc = user.doctorando;

      res.json({
        id: user.id,
        user_id: user.id,
        doctorando_id: doc?.id || null,
        full_name: user.name,
        name: user.name,
        email: user.email,
        cedula: doc?.cedula || undefined,
        userType: user.userType,
        role: user.role.code.toLowerCase() === "estudiante" ? "student" : "admin",
        role_code: user.role.code,
        role_name: user.role.name,
        role_description: user.role.description,
        estado: user.isActive ? "activo" : "inactivo",
        isActive: user.isActive,
        isPreRegistered: false,
        hasAccount: true,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
        permissions: permissions.map((p) => p.code),
        permissionsDetailed: permissions,
        demograficos: doc
          ? {
              cedula: doc.cedula,
              nombres: doc.nombres,
              apellidos: doc.apellidos,
              sexo: doc.sexo,
              fechaNacimiento: doc.fechaNacimiento,
              telefono: doc.telefono,
              correoInstitucional: doc.correoInstitucional,
            }
          : null,
        academico: doc
          ? {
              facultad: doc.facultad?.nombre || null,
              facultadCodigo: doc.facultad?.codigo || null,
              carrera: doc.carrera?.nombre || null,
              carpetaFisica: doc.carpeta || null,
              numeroOrden: doc.numeroOrden || null,
              tituloTercerNivel: doc.tituloTercerNivel || null,
              tituloCuartoNivel: doc.tituloCuartoNivel || null,
            }
          : null,
        expedientes: doc
          ? doc.expedientes.map((exp) => ({
              id: exp.id,
              estado: exp.estado,
              tituloInvestigacion: exp.tituloInvestigacion,
              programaDoctoral: exp.programaDoctoral?.nombre || null,
              tituloAObtener: exp.programaDoctoral?.tituloAObtener || null,
              institucionDestino: exp.programaDoctoral?.institucionDestino?.nombre || null,
              paisDestino: exp.programaDoctoral?.institucionDestino?.pais || null,
              convenio: exp.convenio?.nombre || null,
              tipoFinanciamiento: exp.tipoFinanciamiento,
              tieneApoyoProyecto: exp.tieneApoyoProyecto,
              tieneAlertaLegal: exp.tieneAlertaLegal,
              contratoInicio: exp.contratoInicio,
              contratoFin: exp.contratoFin,
              contratoMeses: exp.contratoMeses,
              oficioRegistroProyecto: exp.oficioRegistroProyecto,
              fechaOficioRegistro: exp.fechaOficioRegistro,
              observaciones: exp.observaciones,
              adendas: exp.adendas,
              devengamiento: exp.devengamiento,
            }))
          : [],
        appointments: user.appointments.map((a) => ({
          id: a.id,
          date: a.date,
          startTime: a.startTime,
          subject: a.subject,
          status: a.status,
          representative: a.representative?.name || "Asesor UGD",
        })),
      });
      return;
    }

    // Caso 3: Búsqueda directa por ID de doctorando
    const doctorandoDirecto = await prisma.doctorando.findUnique({
      where: { id: rawId },
      include: {
        facultad: true,
        carrera: true,
        expedientes: {
          include: {
            programaDoctoral: {
              include: {
                institucionDestino: true,
              },
            },
            convenio: true,
            adendas: {
              orderBy: { numeroAdenda: "asc" },
            },
            devengamiento: true,
          },
        },
        user: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (doctorandoDirecto) {
      const fullName = `${doctorandoDirecto.nombres} ${doctorandoDirecto.apellidos}`.trim();
      const hasUser = !!doctorandoDirecto.user;

      const cleanId = hasUser
        ? doctorandoDirecto.user!.id
        : doctorandoDirecto.id.startsWith("doc_")
        ? doctorandoDirecto.id
        : `doc_${doctorandoDirecto.id}`;

      res.json({
        id: cleanId,
        doctorando_id: doctorandoDirecto.id,
        user_id: doctorandoDirecto.userId,
        full_name: fullName,
        name: fullName,
        email: doctorandoDirecto.correoInstitucional,
        cedula: doctorandoDirecto.cedula,
        userType: "Estudiante",
        role: "student",
        role_code: "ESTUDIANTE",
        role_name: "Estudiante Doctorando",
        estado: hasUser ? (doctorandoDirecto.user!.isActive ? "activo" : "inactivo") : "preregistrado",
        isActive: hasUser ? doctorandoDirecto.user!.isActive : false,
        isPreRegistered: !hasUser,
        hasAccount: hasUser,
        created_at: doctorandoDirecto.createdAt,
        updated_at: doctorandoDirecto.updatedAt,
        demograficos: {
          cedula: doctorandoDirecto.cedula,
          nombres: doctorandoDirecto.nombres,
          apellidos: doctorandoDirecto.apellidos,
          sexo: doctorandoDirecto.sexo,
          fechaNacimiento: doctorandoDirecto.fechaNacimiento,
          telefono: doctorandoDirecto.telefono,
          correoInstitucional: doctorandoDirecto.correoInstitucional,
        },
        academico: {
          facultad: doctorandoDirecto.facultad?.nombre || null,
          facultadCodigo: doctorandoDirecto.facultad?.codigo || null,
          carrera: doctorandoDirecto.carrera?.nombre || null,
          carpetaFisica: doctorandoDirecto.carpeta || null,
          numeroOrden: doctorandoDirecto.numeroOrden || null,
          tituloTercerNivel: doctorandoDirecto.tituloTercerNivel || null,
          tituloCuartoNivel: doctorandoDirecto.tituloCuartoNivel || null,
        },
        expedientes: doctorandoDirecto.expedientes.map((exp) => ({
          id: exp.id,
          estado: exp.estado,
          tituloInvestigacion: exp.tituloInvestigacion,
          programaDoctoral: exp.programaDoctoral?.nombre || null,
          tituloAObtener: exp.programaDoctoral?.tituloAObtener || null,
          institucionDestino: exp.programaDoctoral?.institucionDestino?.nombre || null,
          paisDestino: exp.programaDoctoral?.institucionDestino?.pais || null,
          convenio: exp.convenio?.nombre || null,
          tipoFinanciamiento: exp.tipoFinanciamiento,
          tieneApoyoProyecto: exp.tieneApoyoProyecto,
          tieneAlertaLegal: exp.tieneAlertaLegal,
          contratoInicio: exp.contratoInicio,
          contratoFin: exp.contratoFin,
          contratoMeses: exp.contratoMeses,
          oficioRegistroProyecto: exp.oficioRegistroProyecto,
          fechaOficioRegistro: exp.fechaOficioRegistro,
          observaciones: exp.observaciones,
          adendas: exp.adendas,
          devengamiento: exp.devengamiento,
        })),
        permissions: ["PROCESOS_VER", "ESTUDIANTES_VER"],
        appointments: [],
      });
      return;
    }

    res.status(404).json({ error: "Usuario o integrante no encontrado" });
  } catch (error) {
    console.error("Error al obtener detalle del usuario:", error);
    res.status(500).json({ error: "Error interno al obtener detalle del usuario" });
  }
}

/**
 * PUT /users/:id - Actualizar estado o datos demográficos/académicos de un usuario o doctorando
 */
export async function updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const rawId = String(req.params.id);
    const {
      estado,
      isActive,
      name,
      full_name,
      cedula,
      nombres,
      apellidos,
      sexo,
      fechaNacimiento,
      telefono,
      correoInstitucional,
      email,
      tituloTercerNivel,
      tituloCuartoNivel,
      carpeta,
      numeroOrden,
      facultad,
      carrera,
      programaDoctoral,
      tituloAObtener,
      institucionDestino,
      paisDestino,
      convenio,
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
      adendas,
      registroSenescyt,
      tiempoTexto,
      devengamientoFechaInicio,
      devengamientoFechaFinEstimada,
      devengamientoEstado,
      oficioNotificacion,
      oficioActaTerminacion,
      oficioCierreProyecto,
    } = req.body;

    let activeState = isActive;
    if (estado !== undefined) {
      activeState = estado === "activo" || estado === true;
    }

    const syncPayload = {
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
    };

    // Caso A: Es un Doctorando Pre-registrado (prefijo doc_)
    if (rawId.startsWith("doc_")) {
      const candidateDocIds = [
        rawId,
        rawId.replace(/^doc_/, ""),
        rawId.replace(/^(doc_)+/, "doc_"),
        rawId.replace(/^(doc_)+/, ""),
      ];
      const existingDoc = await prisma.doctorando.findFirst({
        where: { id: { in: candidateDocIds } },
      });

      if (!existingDoc) {
        res.status(404).json({ error: "Estudiante doctorando no encontrado" });
        return;
      }

      // Si intentan inhabilitar cuenta a un pre-registrado
      if (activeState !== undefined && !existingDoc.userId) {
        res.status(400).json({
          error: "Este estudiante está pre-registrado y aún no posee cuenta de usuario para inhabilitar.",
        });
        return;
      }

      // Validar unicidad si cambian cédula o correo
      if (cedula && cedula !== existingDoc.cedula) {
        const dupCedula = await prisma.doctorando.findUnique({ where: { cedula: String(cedula).trim() } });
        if (dupCedula) {
          res.status(409).json({ error: "Ya existe otro estudiante con este número de cédula." });
          return;
        }
      }

      const cleanEmail = correoInstitucional || email;
      if (cleanEmail && cleanEmail !== existingDoc.correoInstitucional) {
        const dupEmail = await prisma.doctorando.findUnique({
          where: { correoInstitucional: String(cleanEmail).trim().toLowerCase() },
        });
        if (dupEmail) {
          res.status(409).json({ error: "Ya existe otro estudiante con este correo institucional." });
          return;
        }
      }

      const { facultadId, carreraId } = await resolveFacultadAndCarrera(facultad, carrera);

      const updatedDoc = await prisma.doctorando.update({
        where: { id: existingDoc.id },
        data: {
          nombres: nombres !== undefined ? String(nombres).trim() : undefined,
          apellidos: apellidos !== undefined ? String(apellidos).trim() : undefined,
          cedula: cedula !== undefined ? String(cedula).trim() : undefined,
          sexo: sexo !== undefined ? (sexo ? String(sexo).trim() : null) : undefined,
          fechaNacimiento:
            fechaNacimiento !== undefined ? (fechaNacimiento ? new Date(fechaNacimiento) : null) : undefined,
          telefono: telefono !== undefined ? (telefono ? String(telefono).trim() : null) : undefined,
          correoInstitucional: cleanEmail ? String(cleanEmail).trim().toLowerCase() : undefined,
          tituloTercerNivel:
            tituloTercerNivel !== undefined ? (tituloTercerNivel ? String(tituloTercerNivel).trim() : null) : undefined,
          tituloCuartoNivel:
            tituloCuartoNivel !== undefined ? (tituloCuartoNivel ? String(tituloCuartoNivel).trim() : null) : undefined,
          carpeta: carpeta !== undefined ? (carpeta ? String(carpeta).trim() : null) : undefined,
          numeroOrden:
            numeroOrden !== undefined
              ? numeroOrden !== "" && numeroOrden !== null
                ? Number(numeroOrden)
                : null
              : undefined,
          facultadId: facultadId !== undefined ? facultadId : undefined,
          carreraId: carreraId !== undefined ? carreraId : undefined,
        },
      });

      await syncExpediente(updatedDoc.id, syncPayload);

      const fullName = `${updatedDoc.nombres} ${updatedDoc.apellidos}`.trim();
      const cleanId = updatedDoc.id.startsWith("doc_") ? updatedDoc.id : `doc_${updatedDoc.id}`;

      res.json({
        id: cleanId,
        doctorando_id: updatedDoc.id,
        full_name: fullName,
        name: fullName,
        email: updatedDoc.correoInstitucional,
        cedula: updatedDoc.cedula,
        estado: "preregistrado",
        isActive: false,
      });
      return;
    }

    // Caso B: Es un User
    const existingUser = await prisma.user.findUnique({
      where: { id: rawId },
      include: {
        role: true,
        doctorando: true,
      },
    });

    if (existingUser) {
      // Proteger cuenta de Desarrollador contra inhabilitación
      if (
        activeState === false &&
        (existingUser.role.code === "DESARROLLADOR" || existingUser.email === "dev@dev.ugd.local")
      ) {
        res.status(403).json({ error: "La cuenta de Desarrollador está protegida y no puede ser inhabilitada." });
        return;
      }

      // Si el usuario tiene ficha de Doctorando vinculada, actualizar también la ficha
      if (existingUser.doctorando) {
        const cleanEmail = correoInstitucional || email;
        const finalNombres =
          nombres !== undefined ? String(nombres).trim() : existingUser.doctorando.nombres;
        const finalApellidos =
          apellidos !== undefined ? String(apellidos).trim() : existingUser.doctorando.apellidos;

        const { facultadId, carreraId } = await resolveFacultadAndCarrera(facultad, carrera);

        await prisma.doctorando.update({
          where: { id: existingUser.doctorando.id },
          data: {
            nombres: nombres !== undefined ? String(nombres).trim() : undefined,
            apellidos: apellidos !== undefined ? String(apellidos).trim() : undefined,
            cedula: cedula !== undefined ? String(cedula).trim() : undefined,
            sexo: sexo !== undefined ? (sexo ? String(sexo).trim() : null) : undefined,
            fechaNacimiento:
              fechaNacimiento !== undefined
                ? fechaNacimiento
                  ? new Date(fechaNacimiento)
                  : null
                : undefined,
            telefono: telefono !== undefined ? (telefono ? String(telefono).trim() : null) : undefined,
            correoInstitucional: cleanEmail ? String(cleanEmail).trim().toLowerCase() : undefined,
            tituloTercerNivel:
              tituloTercerNivel !== undefined
                ? tituloTercerNivel
                  ? String(tituloTercerNivel).trim()
                  : null
                : undefined,
            tituloCuartoNivel:
              tituloCuartoNivel !== undefined
                ? tituloCuartoNivel
                  ? String(tituloCuartoNivel).trim()
                  : null
                : undefined,
            carpeta: carpeta !== undefined ? (carpeta ? String(carpeta).trim() : null) : undefined,
            numeroOrden:
              numeroOrden !== undefined
                ? numeroOrden !== "" && numeroOrden !== null
                  ? Number(numeroOrden)
                  : null
                : undefined,
            facultadId: facultadId !== undefined ? facultadId : undefined,
            carreraId: carreraId !== undefined ? carreraId : undefined,
          },
        });

        await syncExpediente(existingUser.doctorando.id, syncPayload);

        const syncName = `${finalNombres} ${finalApellidos}`.trim();
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: syncName || full_name || name || undefined,
            email: cleanEmail ? String(cleanEmail).trim().toLowerCase() : undefined,
            isActive: activeState !== undefined ? Boolean(activeState) : undefined,
          },
        });

        res.json({
          id: updatedUser.id,
          full_name: updatedUser.name,
          email: updatedUser.email,
          estado: updatedUser.isActive ? "activo" : "inactivo",
          role: existingUser.role.code,
        });
        return;
      }

      // Si es un usuario administrativo común (sin doctorando vinculado)
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: full_name || name || undefined,
          email: email ? String(email).trim().toLowerCase() : undefined,
          isActive: activeState !== undefined ? Boolean(activeState) : undefined,
        },
      });

      res.json({
        id: updatedUser.id,
        full_name: updatedUser.name,
        email: updatedUser.email,
        estado: updatedUser.isActive ? "activo" : "inactivo",
        role: existingUser.role.code,
      });
      return;
    }

    // Caso C: Buscar directamente si rawId coincide con un doctorando.id
    const doctorandoDirecto = await prisma.doctorando.findUnique({
      where: { id: rawId },
    });

    if (doctorandoDirecto) {
      const cleanEmail = correoInstitucional || email;
      const { facultadId, carreraId } = await resolveFacultadAndCarrera(facultad, carrera);

      const updatedDoc = await prisma.doctorando.update({
        where: { id: rawId },
        data: {
          nombres: nombres !== undefined ? String(nombres).trim() : undefined,
          apellidos: apellidos !== undefined ? String(apellidos).trim() : undefined,
          cedula: cedula !== undefined ? String(cedula).trim() : undefined,
          sexo: sexo !== undefined ? (sexo ? String(sexo).trim() : null) : undefined,
          fechaNacimiento:
            fechaNacimiento !== undefined
              ? fechaNacimiento
                ? new Date(fechaNacimiento)
                : null
              : undefined,
          telefono: telefono !== undefined ? (telefono ? String(telefono).trim() : null) : undefined,
          correoInstitucional: cleanEmail ? String(cleanEmail).trim().toLowerCase() : undefined,
          tituloTercerNivel:
            tituloTercerNivel !== undefined
              ? tituloTercerNivel
                ? String(tituloTercerNivel).trim()
                : null
              : undefined,
          tituloCuartoNivel:
            tituloCuartoNivel !== undefined
              ? tituloCuartoNivel
                ? String(tituloCuartoNivel).trim()
                : null
              : undefined,
          carpeta: carpeta !== undefined ? (carpeta ? String(carpeta).trim() : null) : undefined,
          numeroOrden:
            numeroOrden !== undefined
              ? numeroOrden !== "" && numeroOrden !== null
                ? Number(numeroOrden)
                : null
              : undefined,
          facultadId: facultadId !== undefined ? facultadId : undefined,
          carreraId: carreraId !== undefined ? carreraId : undefined,
        },
      });

      await syncExpediente(updatedDoc.id, syncPayload);

      const fullName = `${updatedDoc.nombres} ${updatedDoc.apellidos}`.trim();
      const cleanId = updatedDoc.id.startsWith("doc_") ? updatedDoc.id : `doc_${updatedDoc.id}`;
      res.json({
        id: cleanId,
        full_name: fullName,
        email: updatedDoc.correoInstitucional,
        cedula: updatedDoc.cedula,
        estado: "preregistrado",
      });
      return;
    }

    res.status(404).json({ error: "Usuario o doctorando no encontrado" });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ error: "Error al actualizar información del usuario" });
  }
}
