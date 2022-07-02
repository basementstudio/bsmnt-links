import * as React from 'react'
import useSWR from 'swr'

import { siteURL } from '~/lib/constants'
import { formatError } from '~/lib/utils'

import { Page } from './_app'

export type LSLink = {
  key: string
  value: string
}

const HomePage: Page = () => {
  const [error, setError] = React.useState('')
  const [successData, setSuccessData] =
    React.useState<{ key: string; value: string }>()
  const [loading, setLoading] = React.useState(false)

  const { data: myShortLinks, mutate } = useSWR<LSLink[]>(
    'my-bsmnt-links',
    () => {
      const myBsmntLinksLS = window.localStorage.getItem('my-bsmnt-links')
      if (myBsmntLinksLS) {
        return JSON.parse(myBsmntLinksLS) as LSLink[]
      }
      return []
    }
  )

  React.useEffect(() => {
    if (successData) {
      const alreadyExists = myShortLinks?.some(
        ({ key }) => key === successData.key
      )
      if (alreadyExists) return
      localStorage.setItem(
        'my-bsmnt-links',
        JSON.stringify([successData, ...(myShortLinks ?? [])])
      )
      mutate([successData, ...(myShortLinks ?? [])])
    }
  }, [mutate, myShortLinks, successData])

  const handleSubmit: React.FormEventHandler<HTMLFormElement> =
    React.useCallback(async (e) => {
      e.preventDefault()
      const formEl = e.currentTarget
      setLoading(true)
      try {
        const res = await fetch('/api/shorten', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: formEl.url.value,
            suggestion: formEl.suggestion.value
          })
        })

        const { error, successData } = await res.json()

        if (error) {
          setError(error)
          setSuccessData(undefined)
        }
        if (successData) {
          setError('')
          setSuccessData(successData)
        }

        formEl.reset()
      } catch (error) {
        setError(formatError(error).message)
        setSuccessData(undefined)
      } finally {
        setLoading(false)
      }
    }, [])

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
      {successData && (
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
              href={siteURL.href + successData.key}
              target="_blank"
              rel="noopener"
            >
              {siteURL.href + successData.key}
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
                .writeText(siteURL.href + successData.key)
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
      <form onSubmit={handleSubmit}>
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
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Shorten'}
        </button>
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
