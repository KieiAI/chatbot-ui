import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    res.status(200).json({ message: 'Hello' })
  } catch (error) {
    return new Response('Error', { status: 500 })
  }
}

export default handler
