import { NextApiRequest, NextApiResponse } from 'next'

import { badRequest, internalServerError, success } from '~/lib/api-responses'
import { siteURL } from '~/lib/constants'
import { createShortLink } from '~/lib/redis'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { url: original, suggestion } = req.body

  if (
    typeof original !== 'string' ||
    (suggestion && typeof suggestion !== 'string')
  ) {
    badRequest(res, 'Invalid input.')
    return
  }

  try {
    const shortLink = await createShortLink(original, suggestion)
    const newUrl = new URL(siteURL)
    newUrl.pathname = `/${shortLink.key}`

    const successData = {
      key: shortLink.key,
      value: shortLink.value
    }

    success(res, { successData })
    return
  } catch (error) {
    internalServerError(res, error)
    return
  }
}
