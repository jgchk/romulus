import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const Home: NextPage = () => {
  const router = useRouter()

  useEffect(() => {
    void router.push({ pathname: '/genres' })
  }, [router])

  return <div />
}

export default Home
