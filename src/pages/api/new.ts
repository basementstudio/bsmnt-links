import { NextApiRequest, NextApiResponse } from 'next'
import { redirect } from 'next/dist/server/api-utils'

import { siteURL } from '~/lib/constants'
import { createShortLink } from '~/lib/redis'
import { formatError } from '~/lib/utils'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { url: original, suggestion } = req.body

  if (
    typeof original !== 'string' ||
    (suggestion && typeof suggestion !== 'string')
  ) {
    redirect(res, `/?error=${encodeURIComponent('Invalid input.')}`)
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

    redirect(
      res,
      `/?success=${encodeURIComponent(JSON.stringify(successData))}`
    )
    return
  } catch (error) {
    redirect(res, `/?error=${encodeURIComponent(formatError(error).message)}`)
    return
  }
}
