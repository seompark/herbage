import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useCookies } from 'react-cookie'
import jwt from 'jsonwebtoken'
import AdminCard from '../src/components/AdminCard'
import AdminModal from '../src/components/AdminModal'
import { generateToken } from '../src/api/admin-token'
import useInfiniteScroll from '../src/hooks/useInfiniteScroll'

function A1P4CA({ isLoggedIn, postData }) {
  const [posts, setPosts] = useState(postData.posts)
  const [cursor, setCursor] = useState(postData.cursor)
  const [hasNext, setHasNext] = useState(postData.hasNext)
  const [cookies, setCookie, removeCookie] = useCookies(['token'])
  const [tokenData, setTokenData] = useState({})
  const [isFetching, setIsFetching] = useInfiniteScroll(async () => {}, {
    threshold: 500,
    hasNext
  })

  const [inputValue, setInputValue] = useState('')
  function handleLogin() {}

  useEffect(() => {
    if (!cookies.token) return
    try {
      const decodedToken = jwt.verify(cookies.token)
      setTokenData(decodedToken.payload)
    } catch (err) {}
  }, [cookies])

  return (
    <>
      {cookies.token ? (
        <div>
          <h1>어서오세요, {tokenData.name}</h1>
          {posts.map(v => (
            <AdminCard post={v} />
          ))}
          {!hasNext && <div className="info-text">마지막 글입니다.</div>}
          {isFetching && <div className="info-text">로딩 중...</div>}
        </div>
      ) : (
        <>
          <input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            type="password"
            placeholder="입력하세요"
          />
          <button onClick={handleLogin}>인증</button>
        </>
      )}
      <style jsx>{`
        .info-text {
          text-align: center;
          font-size: 14px;
          font-family: 'Spoqa Han Sans', sans-serif;
          color: #41adff;
        }
      `}</style>
      <AdminModal />
    </>
  )
}

A1P4CA.getInitialProps = async () => {
  return {
    isLoggedIn: true,
    postData: {}
  }
}

A1P4CA.propTypes = {
  postData: PropTypes.exact({
    posts: PropTypes.array.isRequired,
    cursor: PropTypes.string.isRequired,
    hasNext: PropTypes.bool
  }),
  isLoggedIn: PropTypes.bool
}

export default A1P4CA
