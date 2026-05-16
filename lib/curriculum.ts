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
    'Religión'
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
    'Religión'
  ]
}

export const NIVELES = [
  '1° Básico', '2° Básico', '3° Básico', '4° Básico',
  '5° Básico', '6° Básico', '7° Básico', '8° Básico',
  '1° Medio', '2° Medio', '3° Medio', '4° Medio'
]

export const TIPOS_INSTRUMENTO = [
  { value: 'prueba', label: 'Prueba Escrita' },
  { value: 'guia', label: 'Guía de Trabajo' },
  { value: 'pauta', label: 'Pauta de Corrección' },
  { value: 'rubrica', label: 'Rúbrica' },
  { value: 'lista_cotejo', label: 'Lista de Cotejo' },
  { value: 'autoevaluacion', label: 'Autoevaluación' },
  { value: 'coevaluacion', label: 'Coevaluación' }
]

export const TIPOS_ITEM = [
  'Selección múltiple',
  'Verdadero/Falso',
  'Términos pareados',
  'Completación',
  'Respuesta breve',
  'Desarrollo',
  'Producción textual',
  'Resolución de problemas'
]

export const NIVELES_COGNITIVOS = [
  { nivel: 'Conocimiento/Recordar', descripcion: 'Recordar información, definir, listar, nombrar' },
  { nivel: 'Comprensión/Entender', descripcion: 'Explicar, interpretar, resumir, clasificar' },
  { nivel: 'Aplicación/Aplicar', descripcion: 'Usar en nuevas situaciones, resolver, demostrar' },
  { nivel: 'Análisis/Analizar', descripcion: 'Descomponer, comparar, distinguir, examinar' },
  { nivel: 'Síntesis/Evaluar', descripcion: 'Juzgar, valorar, criticar, justificar' },
  { nivel: 'Evaluación/Crear', descripcion: 'Diseñar, construir, producir, formular' }
]

export function buildAnalysisPrompt(instrumento: string, tipoArchivo: string = 'texto'): string {
  return `Eres un experto evaluador educativo especializado en el sistema educativo chileno, con profundo conocimiento de:
- Bases Curriculares MINEDUC (2012, 2013, 2018, 2022)
- Programas de Estudio de todas las asignaturas
- Decreto 67 de 2018 (Evaluación, calificación y promoción)
- Orientaciones para la Evaluación de la Agencia de Calidad de la Educación
- Estándares de formación inicial docente del CPEIP
- Principios de evaluación para el aprendizaje (DocenteMás)
- Taxonomía de Bloom adaptada al currículum nacional
- Técnicas e instrumentos de evaluación educativa

Tu tarea es realizar un ANÁLISIS TÉCNICO EXHAUSTIVO del siguiente instrumento de evaluación.

INSTRUMENTO A ANALIZAR:
${instrumento}

Proporciona un análisis detallado en formato JSON con la siguiente estructura EXACTA:

{
  "resumenEjecutivo": "Párrafo de 2-3 oraciones con evaluación general",
  "puntajeGeneral": 0,
  "calificacionGeneral": "Deficiente|Regular|Bueno|Muy Bueno|Excelente",
  "fortalezas": ["fortaleza 1", "fortaleza 2"],
  "debilidades": ["debilidad 1", "debilidad 2"],
  "dimensiones": {
    "validezContenido": {
      "puntaje": 0,
      "descripcion": "análisis detallado",
      "observaciones": ["obs1", "obs2"]
    },
    "coherenciaCurricular": {
      "puntaje": 0,
      "descripcion": "análisis de alineación con OA del currículum chileno",
      "observaciones": ["obs1", "obs2"]
    },
    "calidadItems": {
      "puntaje": 0,
      "descripcion": "análisis de redacción, claridad y pertinencia",
      "observaciones": ["obs1", "obs2"]
    },
    "distribucionCognitiva": {
      "puntaje": 0,
      "descripcion": "distribución por niveles de la Taxonomía de Bloom",
      "niveles": {
        "conocimiento": 0,
        "comprension": 0,
        "aplicacion": 0,
        "analisis": 0,
        "sintesis": 0,
        "evaluacion": 0
      }
    },
    "aspectosTecnicos": {
      "puntaje": 0,
      "descripcion": "instrucciones, puntajes, tiempo, formato",
      "observaciones": ["obs1", "obs2"]
    },
    "cumplimientoDecreto67": {
      "puntaje": 0,
      "descripcion": "cumplimiento del Decreto 67/2018",
      "observaciones": ["obs1", "obs2"]
    }
  },
  "itemsDetalle": [
    {
      "numero": 1,
      "tipo": "tipo de ítem",
      "nivelCognitivo": "nivel",
      "calidad": "Deficiente|Regular|Bueno|Excelente",
      "observacion": "comentario específico",
      "sugerencia": "mejora sugerida"
    }
  ],
  "recomendaciones": [
    {
      "prioridad": "Alta|Media|Baja",
      "categoria": "categoría",
      "descripcion": "descripción detallada de la mejora",
      "ejemploMejora": "ejemplo concreto si aplica"
    }
  ],
  "tablaEspecificaciones": {
    "existe": false,
    "calidad": "análisis si existe o sugerencia de cómo crearla",
    "sugerida": [
      {
        "oa": "OA sugerido",
        "indicador": "indicador de evaluación",
        "nivelCognitivo": "nivel",
        "tipoItem": "tipo",
        "cantidadItems": 0,
        "puntaje": 0,
        "porcentaje": 0
      }
    ]
  },
  "cumplimientoNormativo": {
    "decreto67": {"cumple": false, "observaciones": "detalles"},
    "basesCurriculares": {"cumple": false, "observaciones": "detalles"},
    "orientacionesEvaluacion": {"cumple": false, "observaciones": "detalles"}
  }
}

Responde ÚNICAMENTE con el JSON válido, sin texto adicional.`
}

export function buildCrearEvaluacionPrompt(params: {
  asignatura: string
  nivel: string
  oas: string
  tipoEvaluacion: string
  cantidadItems: number
  tiempoMinutos: number
  instrucciones?: string
}): string {
  return `Eres un experto en diseño de evaluaciones educativas para el sistema escolar chileno.

Crea una evaluación completa con los siguientes parámetros:
- Asignatura: ${params.asignatura}
- Nivel: ${params.nivel}
- Objetivos de Aprendizaje: ${params.oas}
- Tipo de Evaluación: ${params.tipoEvaluacion}
- Cantidad de ítems: ${params.cantidadItems}
- Tiempo: ${params.tiempoMinutos} minutos
- Instrucciones especiales: ${params.instrucciones || 'Ninguna'}

Genera la evaluación en formato JSON con esta estructura EXACTA:
{
  "titulo": "Título de la evaluación",
  "encabezado": {
    "establecimiento": "_________________________",
    "nombre": "_________________________",
    "curso": "${params.nivel}",
    "fecha": "_________________________",
    "profesor": "_________________________",
    "puntaje": 0,
    "nota": "_____",
    "tiempo": "${params.tiempoMinutos} minutos"
  },
  "instruccionesGenerales": "Instrucciones claras para el estudiante",
  "secciones": [
    {
      "numero": 1,
      "titulo": "I. Nombre de la sección",
      "instrucciones": "Instrucciones específicas",
      "puntajeTotal": 0,
      "items": [
        {
          "numero": 1,
          "tipo": "seleccion_multiple|verdadero_falso|terminos_pareados|completacion|desarrollo|respuesta_breve",
          "enunciado": "Texto del ítem",
          "alternativas": ["A) ...", "B) ...", "C) ...", "D) ..."],
          "puntaje": 0,
          "oa": "OA que evalúa",
          "nivelCognitivo": "Conocimiento|Comprensión|Aplicación|Análisis|Síntesis|Evaluación",
          "espacio": "líneas o cm para respuesta si aplica"
        }
      ]
    }
  ],
  "pautaCorreccion": {
    "items": [
      {
        "numero": 1,
        "respuestaCorrecta": "respuesta o criterios",
        "criterios": ["criterio 1", "criterio 2"],
        "puntaje": 0,
        "puntajeParcial": "descripción si aplica"
      }
    ],
    "escalaCalificacion": {
      "puntajeMaximo": 0,
      "notaMinima": 4.0,
      "porcentajeExigencia": 60,
      "tabla": [
        {"puntajeMin": 0, "puntajeMax": 0, "nota": 1.0}
      ]
    }
  },
  "tablaEspecificaciones": [
    {
      "oa": "OA evaluado",
      "indicadores": ["indicador 1"],
      "nivelCognitivo": "nivel",
      "tipoItem": "tipo",
      "numerosItems": [1, 2],
      "puntaje": 0,
      "porcentaje": 0
    }
  ]
}

Responde ÚNICAMENTE con el JSON válido.`
}

export function buildPautaPrompt(instrumento: string): string {
  return `Eres un experto en evaluación educativa chilena. Analiza este instrumento y crea/mejora su pauta de corrección.

INSTRUMENTO:
${instrumento}

Genera una pauta de corrección completa en JSON:
{
  "titulo": "Pauta de Corrección - [título del instrumento]",
  "puntajeTotal": 0,
  "escalaCalificacion": {
    "puntajeMaximo": 0,
    "notaMinima": 4.0,
    "porcentajeExigencia": 60,
    "formula": "Nota = (Puntaje obtenido / Puntaje máximo) * 5 + 1",
    "tabla": [
      {"puntajeMin": 0, "puntajeMax": 0, "nota": 1.0}
    ]
  },
  "criteriosGenerales": ["criterio 1", "criterio 2"],
  "items": [
    {
      "numero": 1,
      "tipo": "tipo de ítem",
      "enunciado": "resumen del ítem",
      "respuestaCorrecta": "respuesta o modelo de respuesta",
      "puntaje": 0,
      "criteriosEvaluacion": [
        {
          "criterio": "descripción del criterio",
          "puntaje": 0,
          "indicadores": ["indicador observable 1", "indicador observable 2"]
        }
      ],
      "erroresComunesEsperados": ["error común 1"],
      "observacionesDocente": "notas para el docente"
    }
  ],
  "observacionesGenerales": "Instrucciones para aplicar la pauta"
}

Responde ÚNICAMENTE con el JSON válido.`
}

export function buildTablaEspecificacionesPrompt(params: {
  asignatura: string
  nivel: string
  oas: string
  cantidadItems: number
  puntajeTotal: number
  tiposItems: string[]
}): string {
  return `Eres un experto en evaluación educativa del sistema escolar chileno.

Crea una tabla de especificaciones para:
- Asignatura: ${params.asignatura}
- Nivel: ${params.nivel}
- OAs a evaluar: ${params.oas}
- Total de ítems: ${params.cantidadItems}
- Puntaje total: ${params.puntajeTotal}
- Tipos de ítems a usar: ${params.tiposItems.join(', ')}

Responde con JSON:
{
  "titulo": "Tabla de Especificaciones",
  "asignatura": "${params.asignatura}",
  "nivel": "${params.nivel}",
  "puntajeTotal": ${params.puntajeTotal},
  "cantidadItems": ${params.cantidadItems},
  "distribucionCognitiva": {
    "conocimiento": {"porcentaje": 0, "items": 0},
    "comprension": {"porcentaje": 0, "items": 0},
    "aplicacion": {"porcentaje": 0, "items": 0},
    "analisis": {"porcentaje": 0, "items": 0},
    "sintesis": {"porcentaje": 0, "items": 0},
    "evaluacion": {"porcentaje": 0, "items": 0}
  },
  "filas": [
    {
      "oa": "OA X: descripción del OA",
      "indicadoresEvaluacion": ["indicador 1", "indicador 2"],
      "nivelCognitivo": "nivel",
      "tipoItem": "tipo",
      "numerosItems": [1, 2, 3],
      "cantidadItems": 0,
      "puntajeItems": 0,
      "porcentaje": 0
    }
  ],
  "totales": {
    "items": ${params.cantidadItems},
    "puntaje": ${params.puntajeTotal},
    "porcentaje": 100
  },
  "notas": ["nota metodológica 1", "nota metodológica 2"]
}

Responde ÚNICAMENTE con el JSON válido.`
}
