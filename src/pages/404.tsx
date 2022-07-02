import Link from 'next/link'

const NotFoundPage = () => {
  return (
    <div>
      <h1>Not Found</h1>
      <br />
      <Link href="/">
        <a>
          <button tabIndex={-1}>Go back home</button>
        </a>
      </Link>
    </div>
  )
}

export default NotFoundPage
