/**
 * Datos simulados de estudiantes y expedientes de prueba para desarrollo y demostración.
 * 
 * NOTA DE ARQUITECTURA:
 * Estos registros representan doctorandos oficiales en la nómina UGD que aún NO han activado su cuenta.
 * Por lo tanto, NO tienen un `userId` ni credenciales asignadas en la tabla `users`.
 * 
 * Perfiles incluidos:
 * 1. Dennis Trujillo (En Estudios - Beca en fase experimental)
 * 2. Freddy Tapia (En Devengamiento inicial)
 * 3. Dra. María Elena Morales (FICHA COMPLETA 100% SIN NULLS: Múltiples adendas, oficios, 
 *    historial de informes semestrales, convenio internacional, devengamiento en curso con SENESCYT)
 */

export interface AdendaSeed {
  id: string;
  numeroAdenda: number;
  tipoModificacion: string;
  meses: number;
  fechaInicio: Date;
  fechaFin: Date;
}

export interface ConvenioSeed {
  id: string;
  nombre: string;
  fechaInicio: Date;
  fechaFin: Date;
  institucionDestinoId: string;
}

export interface TestStudentSeed {
  doctorando: {
    id: string;
    carpeta: string;
    numeroOrden: number;
    cedula: string;
    apellidos: string;
    nombres: string;
    sexo: string;
    fechaNacimiento: Date;
    correoInstitucional: string;
    telefono: string;
    tituloTercerNivel: string;
    tituloCuartoNivel: string;
    facultadId: string;
    carreraId: string;
  };
  convenio?: ConvenioSeed;
  expediente: {
    id: string;
    programaDoctoralId: string;
    tituloInvestigacion: string;
    oficioRegistroProyecto: string;
    fechaOficioRegistro: Date;
    tipoFinanciamiento: string;
    estado: string;
    tieneApoyoProyecto: boolean;
    contratoInicio: Date;
    contratoFin: Date;
    contratoMeses: number;
    observaciones: string;
    tieneAlertaLegal: boolean;
    historialInformes: string;
  };
  adendas?: AdendaSeed[];
  devengamiento: {
    id: string;
    estado: string;
    tiempoTexto: string;
    fechaInicio: Date;
    fechaFinEstimada: Date;
    oficioNotificacion: string;
    oficioActaTerminacion: string;
    oficioCierreProyecto: string;
    registroSenescyt: string;
  };
}

// Catálogos armónicos con el SQL oficial de la UGD
export const testFacultyEngineering = {
  id: "fac_9",
  nombre: "Ingeniería y Ciencias Aplicadas",
  codigo: "FAC-09",
};

export const testFacultyChemistry = {
  id: "fac_20",
  nombre: "Ciencias Químicas",
  codigo: "FAC-20",
};

export const testCareerSystems = {
  id: "car_72",
  nombre: "Sistemas de Información",
  facultadId: "fac_9",
};

export const testCareerBiochemistry = {
  id: "car_79",
  nombre: "Bioquímica Clínica",
  facultadId: "fac_20",
};

export const testInstitutionSalamanca = {
  id: "inst_1",
  nombre: "Universidad de Salamanca",
  pais: "España",
};

export const testInstitutionMadrid = {
  id: "inst_61",
  nombre: "Universidad Autónoma de Madrid",
  pais: "España",
};

export const testDoctoralProgramCS = {
  id: "prog_test_info",
  nombre: "Doctorado en Informática y Ciencias de la Computación",
  tituloAObtener: "Doctor en Ciencias de la Computación",
  institucionDestinoId: "inst_1",
};

export const testDoctoralProgramBiomed = {
  id: "prog_test_biomed",
  nombre: "Doctorado en Biomedicina y Ciencias de la Salud",
  tituloAObtener: "Doctor en Biomedicina",
  institucionDestinoId: "inst_61",
};

export const testStudentsData: TestStudentSeed[] = [
  {
    doctorando: {
      id: "doc_test_dennis",
      carpeta: "TEST-01",
      numeroOrden: 9001,
      cedula: "1724567890",
      apellidos: "Trujillo Vistin",
      nombres: "Dennis Adrian",
      sexo: "H",
      fechaNacimiento: new Date("1998-05-14"),
      correoInstitucional: "dennis.trujillo@uce.edu.ec",
      telefono: "0991234567",
      tituloTercerNivel: "Ingeniero en Computación",
      tituloCuartoNivel: "Magíster en Ciencias de Datos",
      facultadId: "fac_9",
      carreraId: "car_72",
    },
    expediente: {
      id: "exp_test_dennis",
      programaDoctoralId: "prog_test_info",
      tituloInvestigacion: "Optimización de Algoritmos Distribuidos y Agentes Autónomos para Plataformas Universitarias",
      oficioRegistroProyecto: "OF-VRI-UGD-2024-0105",
      fechaOficioRegistro: new Date("2024-01-10"),
      tipoFinanciamiento: "Beca",
      estado: "EN_ESTUDIOS",
      tieneApoyoProyecto: true,
      contratoInicio: new Date("2024-01-15"),
      contratoFin: new Date("2027-01-15"),
      contratoMeses: 36,
      observaciones: "Estudiante becario en fase experimental de tesis doctoral (Nómina UGD lista para activación).",
      tieneAlertaLegal: false,
      historialInformes: "Informe Semestral 1 presentado en tiempo y forma (Aprobado).",
    },
    devengamiento: {
      id: "dev_test_dennis",
      estado: "PENDIENTE",
      tiempoTexto: "3 años estimados posteriores a graduación",
      fechaInicio: new Date("2027-01-16"),
      fechaFinEstimada: new Date("2030-01-16"),
      oficioNotificacion: "PENDIENTE",
      oficioActaTerminacion: "PENDIENTE",
      oficioCierreProyecto: "PENDIENTE",
      registroSenescyt: "PENDIENTE",
    },
  },
  {
    doctorando: {
      id: "doc_test_freddy",
      carpeta: "TEST-02",
      numeroOrden: 9002,
      cedula: "1729876543",
      apellidos: "Tapia Rea",
      nombres: "Freddy Xavier",
      sexo: "H",
      fechaNacimiento: new Date("1997-11-20"),
      correoInstitucional: "freddy.tapia@uce.edu.ec",
      telefono: "0987654321",
      tituloTercerNivel: "Ingeniero en Sistemas de Información",
      tituloCuartoNivel: "Magíster en Ciberseguridad y Redes",
      facultadId: "fac_9",
      carreraId: "car_72",
    },
    expediente: {
      id: "exp_test_freddy",
      programaDoctoralId: "prog_test_info",
      tituloInvestigacion: "Arquitecturas de Microservicios Resilientes e Integración Segura de Procesos Académicos",
      oficioRegistroProyecto: "OF-VRI-UGD-2022-0230",
      fechaOficioRegistro: new Date("2022-02-15"),
      tipoFinanciamiento: "Beca",
      estado: "EN_DEVENGAMIENTO",
      tieneApoyoProyecto: false,
      contratoInicio: new Date("2022-03-01"),
      contratoFin: new Date("2025-03-01"),
      contratoMeses: 36,
      observaciones: "Doctorando en etapa de devengamiento institucional y defensa final.",
      tieneAlertaLegal: false,
      historialInformes: "Informes semestrales 1 al 6 aprobados favorablemente por la Comisión Académica.",
    },
    devengamiento: {
      id: "dev_test_freddy",
      estado: "EN_CURSO",
      tiempoTexto: "2 años restantes de devengamiento institucional",
      fechaInicio: new Date("2025-04-01"),
      fechaFinEstimada: new Date("2028-04-01"),
      oficioNotificacion: "OF-DIR-UGD-2025-0045",
      oficioActaTerminacion: "ACTA-TERM-UGD-2025-012",
      oficioCierreProyecto: "EN_PROCESO",
      registroSenescyt: "SENESCYT-REG-2025-00412",
    },
  },
  {
    // FICHA MODELO COMPLETA 100% SIN CAMPOS NULL
    doctorando: {
      id: "doc_test_maria",
      carpeta: "TEST-03-COMPLETA",
      numeroOrden: 9003,
      cedula: "1718901234",
      apellidos: "Morales Castro",
      nombres: "María Elena",
      sexo: "M",
      fechaNacimiento: new Date("1992-08-15"),
      correoInstitucional: "maria.morales@uce.edu.ec",
      telefono: "0998765432",
      tituloTercerNivel: "Licenciada en Bioquímica y Farmacia",
      tituloCuartoNivel: "Magíster en Biología Molecular y Biotecnología Médica",
      facultadId: "fac_20",
      carreraId: "car_79",
    },
    convenio: {
      id: "conv_test_uam_2021",
      nombre: "Convenio Específico de Cooperación Académica y Becas Doctorales UCE - UAM 2021",
      fechaInicio: new Date("2021-01-15"),
      fechaFin: new Date("2026-01-15"),
      institucionDestinoId: "inst_61",
    },
    expediente: {
      id: "exp_test_maria",
      programaDoctoralId: "prog_test_biomed",
      tituloInvestigacion: "Mecanismos Epigenéticos y Biomarcadores Moleculares en Enfermedades Crónicas no Transmisibles en Población Ecuatoriana",
      oficioRegistroProyecto: "OF-VRI-UGD-2021-0842",
      fechaOficioRegistro: new Date("2021-09-10"),
      tipoFinanciamiento: "Beca Completa UCE - Convocatoria Docente",
      estado: "EN_DEVENGAMIENTO",
      tieneApoyoProyecto: true,
      contratoInicio: new Date("2021-10-01"),
      contratoFin: new Date("2024-10-01"),
      contratoMeses: 36,
      observaciones: "Doctoranda becaria con dedicación exclusiva. Tesis doctoral defendida con calificación 'Sobresaliente Cum Laude'. Título de Doctora convalidado exitosamente en SENESCYT. Se encuentra desempeñando funciones de docencia e investigación en el marco de su devengamiento en la Facultad de Ciencias Químicas.",
      tieneAlertaLegal: false,
      historialInformes: "Informe Semestral 1 (Res. UGD-2022-045 - Favorable); Informe Semestral 2 (Res. UGD-2022-112 - Favorable); Informe Semestral 3 (Res. UGD-2023-018 - Favorable); Informe Semestral 4 (Res. UGD-2023-095 - Favorable); Informe Semestral 5 (Res. UGD-2024-032 - Favorable); Informe Final de Culminación de Tesis Doctoral (Aprobado por el Consejo de Posgrado el 2024-08-20 con recomendación de publicación de monografía).",
    },
    adendas: [
      {
        id: "adenda_test_maria_1",
        numeroAdenda: 1,
        tipoModificacion: "Ampliación de plazo contractual para defensa de tesis por estancia doctoral internacional en laboratorios CSIC",
        meses: 6,
        fechaInicio: new Date("2024-10-01"),
        fechaFin: new Date("2025-04-01"),
      },
      {
        id: "adenda_test_maria_2",
        numeroAdenda: 2,
        tipoModificacion: "Ajuste presupuestario y apoyo financiero para publicación de artículo de investigación en revista internacional indexada Scopus Q1",
        meses: 0,
        fechaInicio: new Date("2025-01-15"),
        fechaFin: new Date("2025-04-01"),
      },
    ],
    devengamiento: {
      id: "dev_test_maria",
      estado: "EN_CURSO",
      tiempoTexto: "3 años calendario de devengamiento docente e investigación (Restan 2 años y 4 meses)",
      fechaInicio: new Date("2025-05-01"),
      fechaFinEstimada: new Date("2028-05-01"),
      oficioNotificacion: "OF-DIR-UGD-2025-0118-NOT",
      oficioActaTerminacion: "ACTA-UGD-TER-2025-004",
      oficioCierreProyecto: "OF-CIERRE-VRIP-2025-0089",
      registroSenescyt: "SENESCYT-REG-DOC-2024-78945612",
    },
  },
];
