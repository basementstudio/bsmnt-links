import { useRouter } from 'next/router'
import * as React from 'react'
import useSWR from 'swr'

import { siteURL } from '~/lib/constants'

import { Page } from './_app'

type LSLink = {
  key: string
  value: string
}

const HomePage: Page = () => {
  const router = useRouter()
  const { error, success: successData } = router.query

  const { data: myShortLinks, mutate } = useSWR<LSLink[]>('/api/user', () => {
    const myBsmntLinksLS = window.localStorage.getItem('my-bsmnt-links')
    if (myBsmntLinksLS) {
      return JSON.parse(myBsmntLinksLS) as LSLink[]
    }
    return []
  })

  const parsedSuccessData = React.useMemo(() => {
    if (typeof successData !== 'string') return
    try {
      const parsed = JSON.parse(successData)

      return {
        key: parsed.key,
        value: parsed.value
      }
    } catch (error) {
      return
    }
  }, [successData])

  React.useEffect(() => {
    if (parsedSuccessData) {
      const alreadyExists = myShortLinks?.some(
        ({ key }) => key === parsedSuccessData.key
      )
      if (alreadyExists) return
      localStorage.setItem(
        'my-bsmnt-links',
        JSON.stringify([parsedSuccessData, ...(myShortLinks ?? [])])
      )
      mutate([parsedSuccessData, ...(myShortLinks ?? [])])
    }
  }, [mutate, myShortLinks, parsedSuccessData])

  return (
    <div>
      <h1>bsmnt URL Shortener</h1>
      <br />
      <p>
        <i>Shorten your URL!</i>
        <br />
        <br />
        Make something like{' '}
        <code>
          <small>
            https://basementstudio.notion.site/basement-joins-forces-with-the-DigitalPal-team-379b0b454b63405296d0dea4ee0917d9
          </small>
        </code>{' '}
        look like{' '}
        <code>
          <small>{siteURL.href}sd1plm</small>
        </code>
        .
      </p>
      <br />
      {parsedSuccessData && (
        <blockquote
          style={{
            position: 'relative',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between'
          }}
        >
          <span>
            <span style={{ userSelect: 'none' }}>
              <b>Success:</b> Created short link:{' '}
            </span>
            <a
              href={siteURL.href + parsedSuccessData.key}
              target="_blank"
              rel="noopener"
            >
              {siteURL.href + parsedSuccessData.key}
            </a>
          </span>
          <button
            type="button"
            style={{
              userSelect: 'none',
              paddingTop: 3,
              paddingBottom: 3
            }}
            onClick={() => {
              window.navigator.clipboard
                .writeText(siteURL.href + parsedSuccessData.key)
                .catch((e) => {
                  console.error(e)
                })
            }}
          >
            Copy
          </button>
        </blockquote>
      )}
      {error && (
        <blockquote>
          <b>Error:</b> {error}
        </blockquote>
      )}
      <br />
      <form action="/api/new" method="POST">
        <h2>Enter a new URL to shorten</h2>
        <fieldset>
          <label htmlFor="url">
            URL <i>*</i>
          </label>
          <br />
          <input type="text" name="url" id="url" required />
          <br />
          <small>The URL you want to shorten.</small>
          <br />
          <br />
          <label htmlFor="suggestion">Suggestion</label>
          <br />
          <input
            type="text"
            name="suggestion"
            id="suggestion"
            autoComplete="off"
          />
          <br />
          <small>A suggestion for us to use as the ID.</small>
        </fieldset>
        <button type="submit">Shorten</button>
      </form>
      {myShortLinks && (
        <>
          <br />
          <h2>My bsmnt links:</h2>
          <table>
            <thead>
              <tr>
                <th>Original</th>
                <th>Short Link</th>
              </tr>
            </thead>
            <tbody>
              {myShortLinks.map(({ key, value }) => (
                <tr key={key}>
                  <td>
                    <a href={value} target="_blank" rel="noopener">
                      {value}
                    </a>
                  </td>
                  <td>
                    <a href={siteURL.href + key} target="_blank" rel="noopener">
                      {siteURL.href + key}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

export default HomePage
