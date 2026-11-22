import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function cleanPreviousData(testStudentsData?: any[]): Promise<void> {
  console.log("[CLEAN] Limpiando datos previos del sistema...");

  await prisma.appointment.deleteMany();

  // Limpiar fichas, adendas y expedientes de prueba si existen
  if (testStudentsData && testStudentsData.length > 0) {
    const testDocIds = testStudentsData.map((s) => s.doctorando.id);
    const testEmails = testStudentsData.map((s) => s.doctorando.correoInstitucional);

    await prisma.devengamiento.deleteMany({
      where: { expediente: { doctorandoId: { in: testDocIds } } },
    });
    await prisma.adendaContrato.deleteMany({
      where: { expediente: { doctorandoId: { in: testDocIds } } },
    });
    await prisma.expedienteDoctoral.deleteMany({
      where: { doctorandoId: { in: testDocIds } },
    });
    await prisma.doctorando.deleteMany({
      where: { id: { in: testDocIds } },
    });

    // Limpiar usuarios creados previamente con los correos de prueba si fueron activados
    await prisma.user.deleteMany({
      where: { email: { in: testEmails } },
    });
  }

  // Limpiar convenios y programas de prueba
  await prisma.convenio.deleteMany({
    where: { id: { in: ["conv_test_uam_2021"] } },
  }).catch(() => {});

  await prisma.programaDoctoral.deleteMany({
    where: { id: { in: ["prog_test_info", "prog_test_biomed"] } },
  }).catch(() => {});

  await prisma.representative.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();

  console.log("[CLEAN] Datos anteriores removidos correctamente.");
}

async function seedRbac(
  permissionsData: any[],
  rolesData: any[],
  rolePermissionAssignments: any[]
): Promise<{ rolesMap: Map<string, string>; permissionsMap: Map<string, string> }> {
  console.log("[SEED] Configurando matriz RBAC (Permisos y Roles)...");

  const permissionsMap = new Map<string, string>();
  for (const perm of permissionsData) {
    const created = await prisma.permission.create({ data: perm });
    permissionsMap.set(perm.code, created.id);
  }
  console.log(`[INFO] ${permissionsMap.size} permisos creados.`);

  const rolesMap = new Map<string, string>();
  for (const role of rolesData) {
    const created = await prisma.role.create({ data: role });
    rolesMap.set(role.code, created.id);
  }
  console.log(`[INFO] ${rolesMap.size} roles creados.`);

  for (const assignment of rolePermissionAssignments) {
    const roleId = rolesMap.get(assignment.roleCode);
    if (!roleId) continue;

    for (const permCode of assignment.permCodes) {
      const permissionId = permissionsMap.get(permCode);
      if (!permissionId) continue;

      await prisma.rolePermission.create({
        data: { roleId, permissionId },
      });
    }
  }
  console.log("[SUCCESS] Matriz de permisos RBAC vinculada exitosamente.");

  return { rolesMap, permissionsMap };
}

async function seedStaffUsers(staffUsersToSeed: any[], rolesMap: Map<string, string>): Promise<Map<string, any>> {
  console.log("[SEED] Creando cuentas de personal y administradores UGD...");

  const createdUsers = new Map<string, any>();

  for (const u of staffUsersToSeed) {
    const roleId = rolesMap.get(u.roleCode);
    if (!roleId) {
      throw new Error(`Rol desconocido: ${u.roleCode} para usuario ${u.email}`);
    }

    const hashedPassword = await bcrypt.hash(u.plainPassword, 10);
    const user = await prisma.user.create({
      data: {
        name: u.name,
        userType: u.userType,
        email: u.email,
        password: hashedPassword,
        roleId,
        isActive: true,
      },
    });

    createdUsers.set(u.email, user);

    if (u.representative) {
      await prisma.representative.create({
        data: {
          name: u.name,
          title: u.representative.title,
          location: u.representative.location,
          capacity: u.representative.capacity,
          status: u.representative.status,
          userId: user.id,
        },
      });
    }
  }

  console.log(`[SUCCESS] ${createdUsers.size} usuarios de personal creados.`);
  return createdUsers;
}

async function seedTestStudents(testModule: any): Promise<void> {
  console.log("[SEED] Registrando estudiantes en la nómina oficial (pendientes de activación)...");

  const {
    testFacultyEngineering,
    testFacultyChemistry,
    testCareerSystems,
    testCareerBiochemistry,
    testInstitutionSalamanca,
    testInstitutionMadrid,
    testDoctoralProgramCS,
    testDoctoralProgramBiomed,
    testStudentsData,
  } = testModule;

  // 1. Asegurar catálogo base de Facultades
  await prisma.facultad.upsert({
    where: { id: testFacultyEngineering.id },
    update: {},
    create: testFacultyEngineering,
  });
  await prisma.facultad.upsert({
    where: { id: testFacultyChemistry.id },
    update: {},
    create: testFacultyChemistry,
  });

  // 2. Asegurar Carreras
  await prisma.carrera.upsert({
    where: { id: testCareerSystems.id },
    update: {},
    create: testCareerSystems,
  });
  await prisma.carrera.upsert({
    where: { id: testCareerBiochemistry.id },
    update: {},
    create: testCareerBiochemistry,
  });

  // 3. Asegurar Instituciones Destino
  await prisma.institucionDestino.upsert({
    where: { id: testInstitutionSalamanca.id },
    update: {},
    create: testInstitutionSalamanca,
  });
  await prisma.institucionDestino.upsert({
    where: { id: testInstitutionMadrid.id },
    update: {},
    create: testInstitutionMadrid,
  });

  // 4. Asegurar Programas Doctorales
  await prisma.programaDoctoral.upsert({
    where: { id: testDoctoralProgramCS.id },
    update: {
      nombre: testDoctoralProgramCS.nombre,
      institucionDestinoId: testDoctoralProgramCS.institucionDestinoId,
    },
    create: testDoctoralProgramCS,
  });
  await prisma.programaDoctoral.upsert({
    where: { id: testDoctoralProgramBiomed.id },
    update: {
      nombre: testDoctoralProgramBiomed.nombre,
      institucionDestinoId: testDoctoralProgramBiomed.institucionDestinoId,
    },
    create: testDoctoralProgramBiomed,
  });

  // 5. Sembrar cada estudiante con su ficha completa
  for (const s of testStudentsData) {
    if (s.convenio) {
      await prisma.convenio.upsert({
        where: { id: s.convenio.id },
        update: {},
        create: {
          id: s.convenio.id,
          nombre: s.convenio.nombre,
          fechaInicio: s.convenio.fechaInicio,
          fechaFin: s.convenio.fechaFin,
          institucionDestinoId: s.convenio.institucionDestinoId,
        },
      });
    }

    const doc = await prisma.doctorando.create({
      data: {
        id: s.doctorando.id,
        carpeta: s.doctorando.carpeta,
        numeroOrden: s.doctorando.numeroOrden,
        cedula: s.doctorando.cedula,
        apellidos: s.doctorando.apellidos,
        nombres: s.doctorando.nombres,
        sexo: s.doctorando.sexo,
        fechaNacimiento: s.doctorando.fechaNacimiento,
        correoInstitucional: s.doctorando.correoInstitucional,
        telefono: s.doctorando.telefono,
        tituloTercerNivel: s.doctorando.tituloTercerNivel,
        tituloCuartoNivel: s.doctorando.tituloCuartoNivel,
        facultadId: s.doctorando.facultadId,
        carreraId: s.doctorando.carreraId,
        userId: null,
      },
    });

    const exp = await prisma.expedienteDoctoral.create({
      data: {
        id: s.expediente.id,
        doctorandoId: doc.id,
        programaDoctoralId: s.expediente.programaDoctoralId,
        convenioId: s.convenio?.id ?? null,
        tituloInvestigacion: s.expediente.tituloInvestigacion,
        oficioRegistroProyecto: s.expediente.oficioRegistroProyecto,
        fechaOficioRegistro: s.expediente.fechaOficioRegistro,
        tipoFinanciamiento: s.expediente.tipoFinanciamiento,
        estado: s.expediente.estado,
        tieneApoyoProyecto: s.expediente.tieneApoyoProyecto,
        contratoInicio: s.expediente.contratoInicio,
        contratoFin: s.expediente.contratoFin,
        contratoMeses: s.expediente.contratoMeses,
        observaciones: s.expediente.observaciones,
        tieneAlertaLegal: s.expediente.tieneAlertaLegal,
        historialInformes: s.expediente.historialInformes,
      },
    });

    if (s.adendas && s.adendas.length > 0) {
      for (const adenda of s.adendas) {
        await prisma.adendaContrato.create({
          data: {
            id: adenda.id,
            expedienteId: exp.id,
            numeroAdenda: adenda.numeroAdenda,
            tipoModificacion: adenda.tipoModificacion,
            meses: adenda.meses,
            fechaInicio: adenda.fechaInicio,
            fechaFin: adenda.fechaFin,
          },
        });
      }
    }

    await prisma.devengamiento.create({
      data: {
        id: s.devengamiento.id,
        expedienteId: exp.id,
        estado: s.devengamiento.estado,
        tiempoTexto: s.devengamiento.tiempoTexto,
        fechaInicio: s.devengamiento.fechaInicio,
        fechaFinEstimada: s.devengamiento.fechaFinEstimada,
        oficioNotificacion: s.devengamiento.oficioNotificacion,
        oficioActaTerminacion: s.devengamiento.oficioActaTerminacion,
        oficioCierreProyecto: s.devengamiento.oficioCierreProyecto,
        registroSenescyt: s.devengamiento.registroSenescyt,
      },
    });

    console.log(`[INFO] Ficha registrada: ${s.doctorando.nombres} ${s.doctorando.apellidos} (CI: ${s.doctorando.cedula}) - Estado: ${s.expediente.estado}`);
  }

  console.log("[SUCCESS] Estudiantes registrados en nómina oficial con expedientes y adendas completas.");
}

async function seedSettings(systemSettingsToSeed: any[]): Promise<void> {
  console.log("[SEED] Configurando parámetros del sistema...");

  for (const s of systemSettingsToSeed) {
    await prisma.systemSetting.create({ data: s });
  }

  console.log(`[SUCCESS] ${systemSettingsToSeed.length} configuraciones iniciales aplicadas.`);
}

async function main() {
  const isOfficial = process.argv.includes("--official") || process.env.NODE_ENV === "production";

  console.log("[START] Iniciando sembrado (seeding) del sistema base...");
  console.log(`[MODE] Entorno: ${isOfficial ? "OFICIAL / PRODUCCIÓN (Excluye estudiantes de prueba)" : "DEMO / DESARROLLO (Incluye estudiantes de prueba)"}`);
  const startTime = Date.now();

  // Cargar módulos correspondientes al entorno (demo vs official)
  const staffModule = isOfficial
    ? await import("./data/official/staff-seed-data")
    : await import("./data/demo/staff-seed-data");

  const testModule = !isOfficial
    ? await import("./data/demo/test-students-data")
    : null;

  await cleanPreviousData(testModule?.testStudentsData);
  const { rolesMap } = await seedRbac(
    staffModule.permissionsData,
    staffModule.rolesData,
    staffModule.rolePermissionAssignments
  );

  await seedStaffUsers(staffModule.staffUsersToSeed, rolesMap);

  if (!isOfficial && testModule) {
    await seedTestStudents(testModule);
  } else {
    console.log("[INFO] Modo oficial detectado: Se omite la generación de estudiantes y fichas de prueba.");
  }

  await seedSettings(staffModule.systemSettingsToSeed);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[COMPLETE] Proceso de sembrado finalizado con éxito en ${elapsed}s.`);
}

main()
  .catch((e) => {
    console.error("[ERROR] Fallo crítico durante el sembrado:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
