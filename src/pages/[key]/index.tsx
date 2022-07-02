import { GetServerSideProps } from 'next'

import { getShortLinkValue } from '~/lib/redis'

const IdPage = () => {
  return null
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const key = ctx.params?.key

  if (typeof key !== 'string') {
    return { notFound: true }
  }

  try {
    const shortLinkValue = await getShortLinkValue(key)
    return {
      redirect: {
        destination: shortLinkValue,
        permanent: true
      }
    }
  } catch (error) {
    return { notFound: true }
  }
}

export default IdPage
