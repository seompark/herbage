import { useState, useEffect } from 'react'
import Router from 'next/router'
import PropTypes from 'prop-types'
import Cookie from 'universal-cookie'
import { useCookies } from 'react-cookie'
import jwt from 'jsonwebtoken'
import { toast } from 'react-toastify'
import AdminCard from '../src/components/AdminCard'
import AdminModal from '../src/components/AdminModal'
import { generateToken } from '../src/api/admin-token'
import useInfiniteScroll from '../src/hooks/useInfiniteScroll'
import { getPosts } from '../src/api/posts'
import axios from '../src/api/axios'

function Login() {
  const [inputValue, setInputValue] = useState('')
  const [cookies, setCookie] = useCookies(['token'])

  useEffect(() => {
    if (!inputValue) return
    Router.push('/a1p4ca')
  }, [cookies])

  async function handleLogin() {
    try {
      const fetchedToken = await generateToken(inputValue)
      setCookie('token', fetchedToken.data.token, {
        path: '/',
        expires: new Date(jwt.decode(fetchedToken.data.token).exp * 1000)
      })
    } catch (err) {
      if (!err.response) {
        toast.error('네트워크 문제')
        return
      }

      switch (err.response.status) {
        case 401:
          toast.error('비밀번호가 틀렸습니다.')
          break
        default:
          toast.error('무언가 문제가 생겼습니다.')
          break
      }

      setInputValue('')
    }
  }

  return (
    <div>
      <input
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        type="password"
        placeholder="입력하세요"
      />
      <button onClick={handleLogin}>인증</button>
    </div>
  )
}

function Admin({ postData, userData }) {
  const [posts, setPosts] = useState(postData.posts)
  const [cursor, setCursor] = useState(postData.cursor)
  const [hasNext, setHasNext] = useState(postData.hasNext)
  const [isFetching, setIsFetching] = useInfiniteScroll(
    async () => {
      const fetchedPosts = await getPosts(20, cursor)
      setCursor(fetchedPosts.data.cursor)
      setHasNext(fetchedPosts.data.hasNext)
      setPosts([...posts, ...fetchedPosts.data.posts])
    },
    {
      threshold: 500,
      hasNext
    }
  )

  useEffect(() => {
    if (!isFetching) return
    setIsFetching(false)
  }, [posts])

  return (
    <div>
      <h1>Welcome, {userData.name}</h1>
      {posts.map(v => (
        <AdminCard post={v} />
      ))}
      {!hasNext && <div className="info-text">마지막 글입니다.</div>}
      {isFetching && <div className="info-text">로딩 중...</div>}
      <style jsx>{`
        .info-text {
          text-align: center;
          font-size: 14px;
          font-family: 'Spoqa Han Sans', sans-serif;
          color: #41adff;
        }
      `}</style>
      <AdminModal />
    </div>
  )
}

Admin.propTypes = {
  postData: PropTypes.exact({
    posts: PropTypes.array.isRequired,
    cursor: PropTypes.string.isRequired,
    hasNext: PropTypes.bool
  }),
  userData: PropTypes.object
}

function A1P4CA({ isLoginPage, postData, userData }) {
  return isLoginPage ? (
    <Login />
  ) : (
    <Admin postData={postData} userData={userData} />
  )
}

A1P4CA.getInitialProps = async ctx => {
  const cookies = new Cookie(ctx.req && ctx.req.headers.cookie)
  const token = cookies.get('token')

  const redirect = to => {
    if (process.browser) Router.push(to)
    else {
      ctx.res.writeHead(302, {
        Location: to
      })
      ctx.res.end()
    }
  }

  if (token && ctx.query.type === 'login') {
    redirect('/a1p4ca')
    return {
      isLoginPage: true
    }
  }

  if (!token && !ctx.query.type) {
    redirect('/a1p4ca/login')
    return {
      isLoginPage: false
    }
  }

  axios.defaults.headers['Authorization'] = `Bearer ${token}`

  const userData = jwt.decode(token)

  return {
    userData,
    postData: (await getPosts(20)).data,
    isLoginPage: false
  }
}

A1P4CA.propTypes = {
  postData: PropTypes.exact({
    posts: PropTypes.array.isRequired,
    cursor: PropTypes.string,
    hasNext: PropTypes.bool
  }),
  userData: PropTypes.object,
  isLoginPage: PropTypes.bool
}

export default A1P4CA
