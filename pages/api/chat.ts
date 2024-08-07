import { ChatBody, Message } from '@/types/chat'
import { DEFAULT_SYSTEM_PROMPT } from '@/utils/app/const'
import { OpenAIError, OpenAIStream } from '@/utils/server'
import { getTiktokenEncoding } from '@/utils/server/tiktoken'

export const config = {
  runtime: 'edge',
}

const handler = async (req: Request): Promise<Response> => {
  const encoding = await getTiktokenEncoding()
  try {
    const { model, messages, key, prompt } = (await req.json()) as ChatBody

    let promptToSend = prompt
    if (!promptToSend) {
      promptToSend = DEFAULT_SYSTEM_PROMPT
    }

    const prompt_tokens = encoding.encode(promptToSend)

    let tokenCount = prompt_tokens.length
    let messagesToSend: Message[] = []

    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i]
      const tokens = encoding.encode(message.content)

      if (tokenCount + tokens.length + 1000 > model.tokenLimit) {
        break
      }
      tokenCount += tokens.length
      messagesToSend = [message, ...messagesToSend]
    }

    const stream = await OpenAIStream(model, promptToSend, key, messagesToSend)

    return new Response(stream, {
      status: 200,
      headers: { statusText: 'success', 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error(error)
    if (error instanceof OpenAIError) {
      return new Response('Error', { status: 500, statusText: error.message })
    } else {
      return new Response('Error', { status: 500 })
    }
  } finally {
    encoding.free()
  }
}

export default handler
