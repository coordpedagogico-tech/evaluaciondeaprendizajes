export const ASIGNATURAS = {
  basica: [
    'Lenguaje y Comunicación',
    'Matemática',
    'Ciencias Naturales',
    'Historia, Geografía y Ciencias Sociales',
    'Inglés',
    'Educación Física y Salud',
    'Artes Visuales',
    'Música',
    'Tecnología',
    'Orientación',
    'Religión',
  ],
  media: [
    'Lengua y Literatura',
    'Matemática',
    'Biología',
    'Química',
    'Física',
    'Historia, Geografía y Ciencias Sociales',
    'Inglés',
    'Educación Física y Salud',
    'Artes Visuales',
    'Música',
    'Filosofía',
    'Economía y Sociedad',
    'Tecnología',
    'Orientación',
    'Religión',
    'Ciencias para la Ciudadanía',
    'Educación Ciudadana',
    'Artes Escénicas',
  ],
}

export const NIVELES = [
  '1° Básico', '2° Básico', '3° Básico', '4° Básico',
  '5° Básico', '6° Básico', '7° Básico', '8° Básico',
  '1° Medio', '2° Medio', '3° Medio', '4° Medio',
]

export const TIPOS_INSTRUMENTO = [
  { value: 'prueba', label: 'Prueba Escrita' },
  { value: 'guia', label: 'Guía de Trabajo' },
  { value: 'pauta', label: 'Pauta de Corrección' },
  { value: 'rubrica', label: 'Rúbrica' },
  { value: 'lista_cotejo', label: 'Lista de Cotejo' },
  { value: 'autoevaluacion', label: 'Autoevaluación' },
  { value: 'coevaluacion', label: 'Coevaluación' },
]

export const TIPOS_ITEM = [
  'Selección múltiple',
  'Verdadero/Falso',
  'Términos pareados',
  'Completación',
  'Respuesta breve',
  'Desarrollo',
  'Producción textual',
  'Resolución de problemas',
]

export const NIVELES_COGNITIVOS = [
  { nivel: 'Conocimiento/Recordar', descripcion: 'Recordar información, definir, listar, nombrar, identificar' },
  { nivel: 'Comprensión/Entender', descripcion: 'Explicar, interpretar, resumir, clasificar, describir' },
  { nivel: 'Aplicación/Aplicar', descripcion: 'Usar en nuevas situaciones, resolver, demostrar, calcular' },
  { nivel: 'Análisis/Analizar', descripcion: 'Descomponer, comparar, distinguir, examinar, inferir' },
  { nivel: 'Síntesis/Evaluar', descripcion: 'Juzgar, valorar, criticar, justificar, argumentar' },
  { nivel: 'Evaluación/Crear', descripcion: 'Diseñar, construir, producir, formular, planificar' },
]

// ─── PROMPT DE ANÁLISIS ────────────────────────────────────────────────────────

export function buildAnalysisPrompt(instrumento: string, asignatura?: string, nivel?: string): string {
  const contexto = asignatura || nivel
    ? `\nCONTEXTO ADICIONAL:\n- Asignatura: ${asignatura || 'No especificada'}\n- Nivel: ${nivel || 'No especificado'}\n`
    : ''

  return `Realiza un ANÁLISIS TÉCNICO EXHAUSTIVO del siguiente instrumento de evaluación del sistema escolar chileno.
${contexto}
MARCO DE REFERENCIA (aplica todo lo siguiente):
1. Bases Curriculares MINEDUC y Programas de Estudio de la asignatura/nivel
2. Decreto 67/2018 (Evaluación, calificación y promoción escolar)
3. Orientaciones para la Evaluación — Agencia de Calidad de la Educación
4. Marco para la Buena Enseñanza (Dominio C: Enseñanza para el aprendizaje)
5. Principios de Evaluación Para el Aprendizaje (DocenteMás)
6. Taxonomía de Bloom revisada (Anderson & Krathwohl, 2001)
7. Estándares técnicos de construcción de ítems (SIMCE, evaluaciones internacionales)

INSTRUMENTO A ANALIZAR:
─────────────────────────────────────────
${instrumento}
─────────────────────────────────────────

INSTRUCCIONES:
- Analiza CADA ítem individualmente si el texto lo permite
- Verifica coherencia entre OA declarados y contenido real evaluado
- Evalúa la progresión cognitiva y la distribución de niveles de Bloom
- Detecta errores técnicos en ítems (ambigüedad, claves deficientes, reactivos defectuosos)
- Verifica cumplimiento del Decreto 67: escala, porcentaje de exigencia, retroalimentación
- Identifica si existe tabla de especificaciones o si se puede inferir
- Puntajes de 0 a 100 por dimensión siendo realista y crítico

Responde ÚNICAMENTE con el siguiente JSON válido (sin texto adicional, sin markdown):

{
  "resumenEjecutivo": "2-3 oraciones que sintetizan la calidad del instrumento",
  "puntajeGeneral": 75,
  "calificacionGeneral": "Bueno",
  "fortalezas": [
    "Fortaleza específica 1 con evidencia del instrumento",
    "Fortaleza específica 2"
  ],
  "debilidades": [
    "Debilidad específica 1 con referencia al ítem o sección",
    "Debilidad específica 2"
  ],
  "dimensiones": {
    "validezContenido": {
      "puntaje": 70,
      "descripcion": "Análisis detallado de qué tan bien mide los OA declarados",
      "observaciones": ["obs 1", "obs 2"]
    },
    "coherenciaCurricular": {
      "puntaje": 75,
      "descripcion": "Análisis de alineación con Bases Curriculares y Programas de Estudio",
      "observaciones": ["obs 1", "obs 2"]
    },
    "calidadItems": {
      "puntaje": 70,
      "descripcion": "Análisis de redacción, claridad y pertinencia de cada ítem",
      "observaciones": ["obs 1"]
    },
    "distribucionCognitiva": {
      "puntaje": 65,
      "descripcion": "Descripción de la distribución por niveles de Bloom y si es adecuada",
      "observaciones": ["La mayoría se concentra en..."],
      "niveles": {
        "conocimiento": 5,
        "comprension": 8,
        "aplicacion": 4,
        "analisis": 2,
        "sintesis": 1,
        "evaluacion": 0
      }
    },
    "aspectosTecnicos": {
      "puntaje": 75,
      "descripcion": "Instrucciones, puntajes, tiempo estimado, formato y presentación",
      "observaciones": ["obs 1"]
    },
    "cumplimientoDecreto67": {
      "puntaje": 80,
      "descripcion": "Análisis del cumplimiento del Decreto 67/2018",
      "observaciones": ["El instrumento..."]
    }
  },
  "itemsDetalle": [
    {
      "numero": 1,
      "tipo": "Selección múltiple",
      "nivelCognitivo": "comprension",
      "calidad": "Bueno",
      "observacion": "Observación técnica específica del ítem",
      "sugerencia": "Cómo mejorar este ítem específicamente"
    }
  ],
  "recomendaciones": [
    {
      "prioridad": "Alta",
      "categoria": "Coherencia curricular",
      "descripcion": "Descripción detallada de la mejora a realizar",
      "ejemploMejora": "Ejemplo concreto de cómo implementar la mejora"
    },
    {
      "prioridad": "Media",
      "categoria": "Construcción de ítems",
      "descripcion": "Descripción de la mejora",
      "ejemploMejora": "Ejemplo concreto"
    }
  ],
  "tablaEspecificaciones": {
    "existe": false,
    "calidad": "Descripción de si existe o no, y su calidad",
    "sugerida": [
      {
        "oa": "OA X: descripción del OA evaluado",
        "indicador": "Indicador de evaluación observable",
        "nivelCognitivo": "Comprensión",
        "tipoItem": "Selección múltiple",
        "cantidadItems": 4,
        "puntaje": 8,
        "porcentaje": 25
      }
    ]
  },
  "cumplimientoNormativo": {
    "decreto67": {
      "cumple": true,
      "observaciones": "Descripción del cumplimiento o incumplimiento"
    },
    "basesCurriculares": {
      "cumple": true,
      "observaciones": "Descripción de la alineación curricular"
    },
    "orientacionesEvaluacion": {
      "cumple": false,
      "observaciones": "Descripción de qué orientaciones se cumplen o no"
    }
  }
}`
}

// ─── PROMPT CREAR EVALUACIÓN ──────────────────────────────────────────────────

export function buildCrearEvaluacionPrompt(params: {
  asignatura: string
  nivel: string
  oas: string
  tipoEvaluacion: string
  cantidadItems: number
  tiempoMinutos: number
  instrucciones?: string
  titulo?: string
}): string {
  return `Eres un experto en diseño de evaluaciones educativas del sistema escolar chileno.

Crea una evaluación COMPLETA con los siguientes parámetros:
- Asignatura: ${params.asignatura}
- Nivel: ${params.nivel}
- Tipo de instrumento: ${params.tipoEvaluacion}
- Objetivos de Aprendizaje a evaluar: ${params.oas}
- Cantidad de ítems: ${params.cantidadItems}
- Tiempo disponible: ${params.tiempoMinutos} minutos
- Instrucciones adicionales: ${params.instrucciones || 'Ninguna'}
- Título sugerido: ${params.titulo || 'Evaluación'}

MARCOS DE REFERENCIA QUE DEBES APLICAR:
1. Bases Curriculares MINEDUC y Programa de Estudio de ${params.asignatura} para ${params.nivel}
2. Decreto 67/2018: escala de notas 1.0 a 7.0, exigencia mínima 60%
3. Distribución cognitiva equilibrada según Taxonomía de Bloom
4. Instrucciones claras y completas para el estudiante
5. Puntajes distribuidos lógicamente y escala de conversión correcta

REQUISITOS:
- Los ítems deben estar alineados DIRECTAMENTE a los OA indicados
- Incluir al menos 2 tipos diferentes de ítems
- La escala de calificación debe seguir el Decreto 67/2018
- La tabla de especificaciones debe mapear cada ítem a su OA y nivel cognitivo

Responde ÚNICAMENTE con el siguiente JSON válido:

{
  "titulo": "Título completo de la evaluación",
  "encabezado": {
    "establecimiento": "_________________________",
    "nombre": "_________________________",
    "curso": "${params.nivel}",
    "fecha": "_________________________",
    "profesor": "_________________________",
    "asignatura": "${params.asignatura}",
    "puntaje": 0,
    "nota": "_____",
    "tiempo": "${params.tiempoMinutos} minutos"
  },
  "instruccionesGenerales": "Instrucciones completas y claras para el estudiante",
  "secciones": [
    {
      "numero": 1,
      "titulo": "I. SELECCIÓN MÚLTIPLE",
      "instrucciones": "Lee cada pregunta y marca la alternativa correcta con una X.",
      "puntajeTotal": 20,
      "items": [
        {
          "numero": 1,
          "tipo": "seleccion_multiple",
          "enunciado": "Enunciado claro y bien redactado del ítem",
          "alternativas": ["A) Primera alternativa", "B) Segunda alternativa", "C) Tercera alternativa", "D) Cuarta alternativa"],
          "puntaje": 2,
          "oa": "OA que evalúa este ítem",
          "nivelCognitivo": "Comprensión",
          "espacio": null
        }
      ]
    }
  ],
  "pautaCorreccion": {
    "items": [
      {
        "numero": 1,
        "respuestaCorrecta": "C) Tercera alternativa",
        "criterios": ["La respuesta correcta es la C porque..."],
        "puntaje": 2,
        "puntajeParcial": null
      }
    ],
    "escalaCalificacion": {
      "puntajeMaximo": 40,
      "notaMinima": 4.0,
      "porcentajeExigencia": 60,
      "formula": "Si puntaje >= 60% del máximo → Nota = ((puntaje - puntajeExigencia) × 3) / (puntajeMaximo - puntajeExigencia) + 4; si no → Nota = (puntaje × 3) / puntajeExigencia + 1",
      "tabla": [
        {"puntajeMin": 0, "puntajeMax": 5, "nota": 1.0},
        {"puntajeMin": 6, "puntajeMax": 10, "nota": 1.5},
        {"puntajeMin": 11, "puntajeMax": 15, "nota": 2.0},
        {"puntajeMin": 16, "puntajeMax": 20, "nota": 2.5},
        {"puntajeMin": 21, "puntajeMax": 23, "nota": 3.0},
        {"puntajeMin": 24, "puntajeMax": 24, "nota": 3.9},
        {"puntajeMin": 25, "puntajeMax": 28, "nota": 4.5},
        {"puntajeMin": 29, "puntajeMax": 32, "nota": 5.0},
        {"puntajeMin": 33, "puntajeMax": 36, "nota": 5.5},
        {"puntajeMin": 37, "puntajeMax": 38, "nota": 6.0},
        {"puntajeMin": 39, "puntajeMax": 39, "nota": 6.5},
        {"puntajeMin": 40, "puntajeMax": 40, "nota": 7.0}
      ]
    }
  },
  "tablaEspecificaciones": [
    {
      "oa": "OA evaluado con descripción",
      "indicadores": ["Indicador observable 1", "Indicador observable 2"],
      "nivelCognitivo": "Comprensión",
      "tipoItem": "Selección múltiple",
      "numerosItems": [1, 2, 3, 4],
      "puntaje": 8,
      "porcentaje": 20
    }
  ]
}`
}

// ─── PROMPT PAUTA ─────────────────────────────────────────────────────────────

export function buildPautaPrompt(instrumento: string): string {
  return `Eres un experto en evaluación educativa chilena. Analiza este instrumento y crea una pauta de corrección completa y técnicamente correcta.

INSTRUMENTO:
─────────────────────────────────────────
${instrumento}
─────────────────────────────────────────

REQUISITOS DE LA PAUTA:
1. Criterios de evaluación observables y medibles para cada ítem
2. Puntaje parcial especificado cuando corresponda (ítems de desarrollo)
3. Escala de calificación según Decreto 67/2018 (nota mínima 4.0 con 60% de exigencia)
4. Indicadores conductuales claros para ítems de escala o rúbrica
5. Errores comunes esperados y cómo tratarlos
6. Orientaciones generales para el docente corrector

Responde ÚNICAMENTE con el siguiente JSON válido:

{
  "titulo": "Pauta de Corrección — [título del instrumento]",
  "puntajeTotal": 40,
  "escalaCalificacion": {
    "puntajeMaximo": 40,
    "notaMinima": 4.0,
    "porcentajeExigencia": 60,
    "puntajeExigencia": 24,
    "formula": "Nota = ((puntaje - 24) × 3) / 16 + 4.0 si puntaje ≥ 24; Nota = puntaje × 3 / 24 + 1.0 si puntaje < 24",
    "tabla": [
      {"puntajeMin": 0, "puntajeMax": 4, "nota": 1.0},
      {"puntajeMin": 5, "puntajeMax": 8, "nota": 1.5},
      {"puntajeMin": 9, "puntajeMax": 12, "nota": 2.0},
      {"puntajeMin": 13, "puntajeMax": 16, "nota": 2.5},
      {"puntajeMin": 17, "puntajeMax": 20, "nota": 3.0},
      {"puntajeMin": 21, "puntajeMax": 23, "nota": 3.9},
      {"puntajeMin": 24, "puntajeMax": 27, "nota": 4.5},
      {"puntajeMin": 28, "puntajeMax": 31, "nota": 5.0},
      {"puntajeMin": 32, "puntajeMax": 35, "nota": 5.5},
      {"puntajeMin": 36, "puntajeMax": 37, "nota": 6.0},
      {"puntajeMin": 38, "puntajeMax": 39, "nota": 6.5},
      {"puntajeMin": 40, "puntajeMax": 40, "nota": 7.0}
    ]
  },
  "criteriosGenerales": [
    "Criterio general 1 para la corrección",
    "Criterio general 2"
  ],
  "items": [
    {
      "numero": 1,
      "tipo": "seleccion_multiple",
      "enunciado": "Resumen del enunciado del ítem",
      "respuestaCorrecta": "Letra y contenido de la alternativa correcta",
      "puntaje": 2,
      "criteriosEvaluacion": [
        {
          "criterio": "Descripción del criterio evaluado",
          "puntaje": 2,
          "indicadores": ["El estudiante identifica...", "El estudiante reconoce..."]
        }
      ],
      "puntajeParcial": null,
      "erroresComunesEsperados": [
        "Error común esperado 1 y cómo tratarlo"
      ],
      "observacionesDocente": "Nota para el docente sobre este ítem"
    }
  ],
  "observacionesGenerales": "Instrucciones completas para aplicar la pauta correctamente"
}`
}

// ─── PROMPT TABLA DE ESPECIFICACIONES ────────────────────────────────────────

export function buildTablaEspecificacionesPrompt(params: {
  asignatura: string
  nivel: string
  oas: string
  cantidadItems: number
  puntajeTotal: number
  tiposItems: string[]
}): string {
  return `Eres un experto en evaluación educativa del sistema escolar chileno.

Crea una tabla de especificaciones técnica para:
- Asignatura: ${params.asignatura}
- Nivel: ${params.nivel}
- OAs a evaluar: ${params.oas}
- Total de ítems: ${params.cantidadItems}
- Puntaje total: ${params.puntajeTotal}
- Tipos de ítems a usar: ${params.tiposItems.join(', ')}

REQUISITOS:
1. Distribución equilibrada por niveles cognitivos de Bloom (no solo Conocimiento/Comprensión)
2. Cada OA debe tener al menos un indicador de evaluación observable
3. Los porcentajes deben sumar exactamente 100%
4. La distribución de ítems debe ser didácticamente justificable
5. Incluir notas metodológicas para el docente

Responde ÚNICAMENTE con el siguiente JSON válido:

{
  "titulo": "Tabla de Especificaciones",
  "asignatura": "${params.asignatura}",
  "nivel": "${params.nivel}",
  "puntajeTotal": ${params.puntajeTotal},
  "cantidadItems": ${params.cantidadItems},
  "distribucionCognitiva": {
    "conocimiento": {"porcentaje": 15, "items": 3},
    "comprension": {"porcentaje": 25, "items": 5},
    "aplicacion": {"porcentaje": 30, "items": 6},
    "analisis": {"porcentaje": 20, "items": 4},
    "sintesis": {"porcentaje": 7, "items": 1},
    "evaluacion": {"porcentaje": 3, "items": 1}
  },
  "filas": [
    {
      "oa": "OA X: Descripción completa del objetivo de aprendizaje",
      "indicadoresEvaluacion": [
        "Indicador observable 1: el estudiante es capaz de...",
        "Indicador observable 2: el estudiante puede..."
      ],
      "nivelCognitivo": "Comprensión",
      "tipoItem": "Selección múltiple",
      "numerosItems": [1, 2, 3, 4],
      "cantidadItems": 4,
      "puntajeItems": 8,
      "porcentaje": 20
    }
  ],
  "totales": {
    "items": ${params.cantidadItems},
    "puntaje": ${params.puntajeTotal},
    "porcentaje": 100
  },
  "notas": [
    "Nota metodológica 1: justificación de la distribución cognitiva",
    "Nota metodológica 2: recomendaciones para la corrección"
  ]
}`
}
