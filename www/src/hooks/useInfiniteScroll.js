import { useState, useEffect } from 'react'

const useInfiniteScroll = (callback, { threshold = 500, hasNext }) => {
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!isFetching) return
    callback()
  }, [isFetching])

  function handleScroll() {
    if (!hasNext) return

    const scrollHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    )
    const scrollTop = Math.max(
      document.documentElement.scrollTop,
      document.body.scrollTop
    )
    const clientHeight = document.documentElement.clientHeight
    if (scrollTop + clientHeight <= scrollHeight - threshold || isFetching)
      return

    setIsFetching(true)
  }

  return [isFetching, setIsFetching]
}

export default useInfiniteScroll
