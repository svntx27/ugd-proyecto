import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { createSseTicket } from "../lib/sse-tickets";
import { getSystemStatus } from "../lib/system-status";
import { validarPassword } from "../lib/password-policy";

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? "" : "dev-only-secret-key-ugd-2026");
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET obligatorio en producción");
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Debe proporcionar correo y contraseña" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
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
                programaDoctoral: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ error: "Credenciales inválidas o usuario inactivo" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }

    // Bloqueo total por Mantenimiento Crítico en el panel administrativo: solo se permite al Desarrollador
    const systemStatus = await getSystemStatus();
    if (systemStatus === "lockdown" && user.role.code !== "DESARROLLADOR") {
      res.status(503).json({
        code: "PLATFORM_LOCKDOWN",
        error: "PLATFORM_LOCKDOWN: La plataforma se encuentra en mantenimiento técnico. Por favor, intente más tarde.",
      });
      return;
    }

    const permissions = user.role.rolePermissions.map((rp) => rp.permission.code);

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role.code,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    res.json({
      message: "Inicio de sesión exitoso",
      token,
      role: user.role.code.toLowerCase() === "estudiante" ? "student" : "admin",
      role_code: user.role.code,
      full_name: user.name,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        role: {
          id: user.role.id,
          code: user.role.code,
          name: user.role.name,
          description: user.role.description,
        },
        permissions,
        doctorando: user.doctorando
          ? {
              id: user.doctorando.id,
              cedula: user.doctorando.cedula,
              nombres: user.doctorando.nombres,
              apellidos: user.doctorando.apellidos,
              correoInstitucional: user.doctorando.correoInstitucional,
              telefono: user.doctorando.telefono,
              tituloTercerNivel: user.doctorando.tituloTercerNivel,
              tituloCuartoNivel: user.doctorando.tituloCuartoNivel,
              facultad: user.doctorando.facultad?.nombre || null,
              carrera: user.doctorando.carrera?.nombre || null,
              expedientes: user.doctorando.expedientes.map((e) => ({
                id: e.id,
                estado: e.estado,
                programa: e.programaDoctoral?.nombre || null,
                tituloInvestigacion: e.tituloInvestigacion,
              })),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor en inicio de sesión" });
  }
}

export async function adminLogin(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Debe proporcionar correo y contraseña" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
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
    });

    if (!user || !user.isActive) {
      res.status(401).json({ error: "Credenciales inválidas o usuario inactivo" });
      return;
    }

    // Verificar roles privilegiados
    const adminRoles = ["DESARROLLADOR", "DIRECTOR", "ANALISTA_PROCESOS", "ANALISTA_TECNICO"];
    if (!adminRoles.includes(user.role.code)) {
      res.status(403).json({ error: "Acceso denegado. Solo administradores pueden acceder a este panel." });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }

    // Bloqueo total por Mantenimiento Crítico en el panel administrativo: solo se permite al Desarrollador
    const systemStatus = await getSystemStatus();
    if (systemStatus === "lockdown" && user.role.code !== "DESARROLLADOR") {
      res.status(503).json({
        code: "PLATFORM_LOCKDOWN",
        error: "PLATFORM_LOCKDOWN: La plataforma se encuentra en mantenimiento técnico. Por favor, intente más tarde.",
      });
      return;
    }

    const permissions = user.role.rolePermissions.map((rp) => rp.permission.code);

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role.code,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    res.json({
      message: "Inicio de sesión de administrador exitoso",
      token,
      role: "admin",
      role_code: user.role.code,
      full_name: user.name,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        role: {
          id: user.role.id,
          code: user.role.code,
          name: user.role.name,
        },
        permissions,
      },
    });
  } catch (error) {
    console.error("Error en admin login:", error);
    res.status(500).json({ error: "Error interno del servidor en inicio de sesión administrativo" });
  }
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { full_name, name, email, password } = req.body;
    const userFullName = full_name || name;

    if (!userFullName || !email || !password) {
      res.status(400).json({ error: "Nombre completo, correo y contraseña son obligatorios" });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // Requisito estricto de dominio institucional
    if (!cleanEmail.endsWith("@uce.edu.ec")) {
      res.status(400).json({ error: "El correo debe pertenecer al dominio institucional @uce.edu.ec" });
      return;
    }

    const errorPassword = validarPassword(password);
    if (errorPassword) {
      res.status(400).json({ error: errorPassword });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      res.status(409).json({ error: "El correo electrónico ya se encuentra registrado" });
      return;
    }

    // Buscar rol ESTUDIANTE
    const estudianteRole = await prisma.role.findFirst({
      where: { code: "ESTUDIANTE" },
    });

    if (!estudianteRole) {
      res.status(500).json({ error: "El rol ESTUDIANTE no está configurado en la base de datos" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: userFullName,
        email: cleanEmail,
        password: hashedPassword,
        userType: "Estudiante",
        roleId: estudianteRole.id,
        isActive: true,
      },
      include: {
        role: true,
      },
    });

    const token = jwt.sign(
      {
        userId: newUser.id,
        role: newUser.role.code,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    res.status(201).json({
      id: newUser.id,
      full_name: newUser.name,
      email: newUser.email,
      role: "student",
      role_code: newUser.role.code,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        userType: newUser.userType,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error interno al registrar usuario" });
  }
}

/**
 * POST /api/auth/verificar-doctorando (y alias /api/auth/verify-doctorando)
 * Valida si la cédula y correo institucional corresponden a un estudiante registrado en la nómina UGD
 */
export async function verifyDoctorando(req: Request, res: Response): Promise<void> {
  try {
    const { cedula, identification, correo, email } = req.body;
    const cleanCedula = String(cedula || identification || "").trim();
    const cleanEmail = String(correo || email || "").trim().toLowerCase();

    if (!cleanCedula || !cleanEmail) {
      res.status(400).json({ error: "Debe proporcionar cédula y correo institucional" });
      return;
    }

    const doctorando = await prisma.doctorando.findFirst({
      where: {
        cedula: cleanCedula,
        correoInstitucional: {
          equals: cleanEmail,
          mode: "insensitive",
        },
      },
      include: {
        user: true,
        facultad: true,
        carrera: true,
        expedientes: {
          include: {
            programaDoctoral: true,
          },
        },
      },
    });

    if (!doctorando) {
      res.status(404).json({
        valid: false,
        error: "No se encontró ningún estudiante doctorando registrado con los datos proporcionados. Verifique su número de cédula y correo institucional.",
      });
      return;
    }

    if (doctorando.userId || doctorando.user) {
      res.status(409).json({
        valid: false,
        alreadyActivated: true,
        error: "Esta cuenta de doctorando ya se encuentra activada. Puede iniciar sesión directamente con su correo y contraseña.",
        nombres: doctorando.nombres,
        apellidos: doctorando.apellidos,
      });
      return;
    }

    res.json({
      valid: true,
      alreadyActivated: false,
      message: "Estudiante doctorando verificado exitosamente y listo para activación.",
      doctorando: {
        id: doctorando.id,
        cedula: doctorando.cedula,
        nombres: doctorando.nombres,
        apellidos: doctorando.apellidos,
        nombreCompleto: `${doctorando.nombres} ${doctorando.apellidos}`.trim(),
        correoInstitucional: doctorando.correoInstitucional,
        facultad: doctorando.facultad?.nombre || null,
        carrera: doctorando.carrera?.nombre || null,
        programa: doctorando.expedientes[0]?.programaDoctoral?.nombre || null,
        estadoAcademico: doctorando.expedientes[0]?.estado || "EN_ESTUDIOS",
      },
    });
  } catch (error) {
    console.error("Error al verificar doctorando:", error);
    res.status(500).json({ error: "Error interno al verificar datos del doctorando" });
  }
}

/**
 * POST /api/auth/activar-cuenta (y alias /api/auth/activate)
 * Activa la cuenta de un estudiante doctorando creando sus credenciales de acceso vinculadas a su ficha oficial
 */
export async function activateDoctorandoAccount(req: Request, res: Response): Promise<void> {
  try {
    const { cedula, identification, correo, email, password } = req.body;
    const cleanCedula = String(cedula || identification || "").trim();
    const cleanEmail = String(correo || email || "").trim().toLowerCase();

    if (!cleanCedula || !cleanEmail || !password) {
      res.status(400).json({
        error: "Se requieren los campos 'cedula', 'correo' (o email) y 'password'",
      });
      return;
    }

    const errorPassword = validarPassword(password);
    if (errorPassword) {
      res.status(400).json({ error: errorPassword });
      return;
    }

    // 1. Buscar en la nómina de doctorandos
    const doctorando = await prisma.doctorando.findFirst({
      where: {
        cedula: cleanCedula,
        correoInstitucional: {
          equals: cleanEmail,
          mode: "insensitive",
        },
      },
      include: {
        user: true,
        facultad: true,
        carrera: true,
        expedientes: {
          include: {
            programaDoctoral: true,
          },
        },
      },
    });

    if (!doctorando) {
      res.status(404).json({
        error: "No se encontró ningún estudiante doctorando registrado con los datos proporcionados. Verifique su número de cédula y correo institucional.",
      });
      return;
    }

    // 2. Validar que no esté activado
    if (doctorando.userId || doctorando.user) {
      res.status(409).json({
        error: "Esta cuenta de doctorando ya se encuentra activada. Puede iniciar sesión directamente con su correo y contraseña.",
        alreadyActivated: true,
      });
      return;
    }

    // 3. Obtener rol ESTUDIANTE con permisos
    const estudianteRole = await prisma.role.findFirst({
      where: { code: "ESTUDIANTE" },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!estudianteRole) {
      res.status(500).json({
        error: "El rol ESTUDIANTE no está configurado en el sistema.",
      });
      return;
    }

    // 4. Verificar si ya existía un User con ese correo
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const fullName = `${doctorando.nombres} ${doctorando.apellidos}`.trim();

    // 5. Transacción atómica de creación / vinculación
    const { activatedUser, updatedDoctorando } = await prisma.$transaction(async (tx) => {
      let userRecord;
      if (existingUser) {
        userRecord = await tx.user.update({
          where: { id: existingUser.id },
          data: {
            name: fullName,
            password: hashedPassword,
            isActive: true,
            roleId: estudianteRole.id,
          },
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
        });
      } else {
        userRecord = await tx.user.create({
          data: {
            name: fullName,
            email: cleanEmail,
            password: hashedPassword,
            userType: "Estudiante",
            roleId: estudianteRole.id,
            isActive: true,
          },
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
        });
      }

      const docRecord = await tx.doctorando.update({
        where: { id: doctorando.id },
        data: { userId: userRecord.id },
        include: {
          facultad: true,
          carrera: true,
          expedientes: {
            include: {
              programaDoctoral: true,
            },
          },
        },
      });

      return { activatedUser: userRecord, updatedDoctorando: docRecord };
    });

    // 6. Generar token JWT para sesión inmediata
    const permissions = estudianteRole.rolePermissions.map((rp) => rp.permission.code);
    const token = jwt.sign(
      {
        userId: activatedUser.id,
        role: activatedUser.role.code,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    res.status(201).json({
      message: "¡Cuenta activada exitosamente! Bienvenido al Sistema de Citas y Gestión Doctoral UGD.",
      token,
      role: "student",
      role_code: activatedUser.role.code,
      full_name: activatedUser.name,
      user: {
        id: activatedUser.id,
        name: activatedUser.name,
        email: activatedUser.email,
        userType: activatedUser.userType,
        role: {
          id: activatedUser.role.id,
          code: activatedUser.role.code,
          name: activatedUser.role.name,
          description: activatedUser.role.description,
        },
        permissions,
        doctorando: {
          id: updatedDoctorando.id,
          cedula: updatedDoctorando.cedula,
          nombres: updatedDoctorando.nombres,
          apellidos: updatedDoctorando.apellidos,
          correoInstitucional: updatedDoctorando.correoInstitucional,
          facultad: updatedDoctorando.facultad?.nombre || null,
          carrera: updatedDoctorando.carrera?.nombre || null,
          expedientes: updatedDoctorando.expedientes.map((e) => ({
            id: e.id,
            estado: e.estado,
            programa: e.programaDoctoral?.nombre || null,
            tituloInvestigacion: e.tituloInvestigacion,
          })),
        },
      },
    });
  } catch (error) {
    console.error("Error al activar cuenta de doctorando:", error);
    res.status(500).json({ error: "Error interno al activar la cuenta" });
  }
}

export async function getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const doctorando = await prisma.doctorando.findUnique({
      where: { userId: req.user.id },
      include: {
        facultad: true,
        carrera: true,
        expedientes: {
          include: {
            programaDoctoral: { include: { institucionDestino: true } },
            convenio: true,
            adendas: { orderBy: { numeroAdenda: "asc" } },
            devengamiento: true,
          },
        },
      },
    });

    res.json({
      user: {
        ...req.user,
        doctorando: doctorando
          ? {
              id: doctorando.id,
              carpeta: doctorando.carpeta,
              numeroOrden: doctorando.numeroOrden,
              cedula: doctorando.cedula,
              nombres: doctorando.nombres,
              apellidos: doctorando.apellidos,
              nombreCompleto: `${doctorando.nombres} ${doctorando.apellidos}`.trim(),
              sexo: doctorando.sexo,
              fechaNacimiento: doctorando.fechaNacimiento,
              correoInstitucional: doctorando.correoInstitucional,
              telefono: doctorando.telefono,
              tituloTercerNivel: doctorando.tituloTercerNivel,
              tituloCuartoNivel: doctorando.tituloCuartoNivel,
              facultad: doctorando.facultad?.nombre || null,
              facultadObj: doctorando.facultad,
              carrera: doctorando.carrera?.nombre || null,
              carreraObj: doctorando.carrera,
              expedientes: doctorando.expedientes.map((e) => ({
                id: e.id,
                estado: e.estado,
                programa: e.programaDoctoral?.nombre || null,
                programaDoctoral: e.programaDoctoral,
                institucionDestino: e.programaDoctoral?.institucionDestino
                  ? { nombre: e.programaDoctoral.institucionDestino.nombre, pais: e.programaDoctoral.institucionDestino.pais }
                  : null,
                tituloInvestigacion: e.tituloInvestigacion,
                oficioRegistroProyecto: e.oficioRegistroProyecto,
                fechaOficioRegistro: e.fechaOficioRegistro,
                tipoFinanciamiento: e.tipoFinanciamiento,
                tieneApoyoProyecto: e.tieneApoyoProyecto,
                contratoInicio: e.contratoInicio,
                contratoFin: e.contratoFin,
                contratoMeses: e.contratoMeses,
                convenio: e.convenio?.nombre || null,
                convenioObj: e.convenio,
                adendas: e.adendas || [],
                devengamiento: e.devengamiento || null,
                tieneAlertaLegal: e.tieneAlertaLegal,
                observaciones: e.observaciones,
              })),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error en getProfile:", error);
    res.status(500).json({ error: "Error interno al obtener el perfil" });
  }
}

/**
 * Emite un ticket criptográfico temporal de un solo uso (TTL: 60s)
 * para conectar el canal en tiempo real SSE sin exponer el token JWT en la URL.
 */
export async function generateSseTicket(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  const ticket = createSseTicket(user.id, user.role.code, 60);
  res.json({
    ticket,
    expiresIn: 60,
  });
}
