import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `Eres EvalUA, un experto evaluador educativo del sistema escolar chileno con conocimiento profundo del currículum nacional.
Conoces en detalle:
- Bases Curriculares MINEDUC (1° a 6° Básico 2012, 7° a 2° Medio 2015-2016, 3° y 4° Medio 2019-2020)
- Programas de estudio de TODAS las asignaturas de 1° Básico a 4° Medio
- Decreto 67/2018 sobre evaluación, calificación y promoción escolar
- Orientaciones para la Evaluación de la Agencia de Calidad de la Educación (2022)
- Estándares de la Práctica Profesional Docente (Marco para la Buena Enseñanza)
- Principios de Evaluación Para el Aprendizaje (DocenteMás - Evaluación formativa)
- Taxonomía de Bloom revisada (Anderson & Krathwohl, 2001) aplicada al contexto chileno
- Técnicas de construcción de ítems: selección múltiple, desarrollo, producción textual
- Criterios de validez, confiabilidad y objetividad de instrumentos de evaluación
- SIMCE y pruebas estandarizadas del sistema chileno
SIEMPRE responde en español. SIEMPRE responde con JSON válido cuando se solicite.`

export async function analyzeWithAI(prompt: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Tipo de respuesta inesperado')
  return content.text
}

export async function analyzeImageWithAI(
  base64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
  prompt: string
): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: prompt },
        ],
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Tipo de respuesta inesperado')
  return content.text
}
