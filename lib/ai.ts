import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function analyzeWithAI(prompt: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }]
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Tipo de respuesta inesperado')
  return content.text
}
