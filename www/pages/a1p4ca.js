import { useState, useEffect } from 'react'
import Router from 'next/router'
import PropTypes from 'prop-types'
import Cookie from 'universal-cookie'
import { useCookies } from 'react-cookie'
import jwt from 'jsonwebtoken'
import { toast } from 'react-toastify'
import AdminCard from '../src/components/AdminCard'
import AcceptModal from '../src/components/modals/AcceptModal'
import RejectModal from '../src/components/modals/RejectModal'
import ModifyModal from '../src/components/modals/ModifyModal'
import { generateToken } from '../src/api/admin-token'
import useInfiniteScroll from '../src/hooks/useInfiniteScroll'
import {
  getPosts,
  acceptPost,
  rejectPost,
  modifyPost,
  deletePost
} from '../src/api/posts'
import axios from '../src/api/axios'
import { ACCEPTED, REJECTED, PENDING, DELETED } from '../src/utils/post-status'

function Login() {
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const setCookie = useCookies(['token'])[1]

  async function handleSubmit(e) {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    try {
      const fetchedToken = await generateToken(inputValue)
      setCookie('token', fetchedToken.data.token, {
        path: '/',
        expires: new Date(jwt.decode(fetchedToken.data.token).exp * 1000)
      })
      Router.push('/a1p4ca')
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
          toast.error('문제가 생겼습니다.')
          break
      }
      setInputValue('')
      setIsLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          type="password"
          placeholder="입력하세요"
        />
        <button type="submit">{isLoading ? '인증 중...' : '로그인'}</button>
      </form>
      <style jsx>{`
        form {
          padding: 2rem;
          border-radius: 7.5px;
        }
      `}</style>
    </>
  )
}

function Admin({ postData, userData }) {
  // eslint-disable-next-line
  const [cookies, setCookie, removeCookie] = useCookies(['token'])

  const [posts, setPosts] = useState(postData.posts)
  const [cursor, setCursor] = useState(postData.cursor)
  const [hasNext, setHasNext] = useState(postData.hasNext)
  const [statusFilter, setStatusFilter] = useState(PENDING)

  const fetch = async () => {
    const fetchedPosts = await getPosts(20, cursor, statusFilter)
    setCursor(fetchedPosts.data.cursor)
    setHasNext(fetchedPosts.data.hasNext)
    setPosts([...posts, ...fetchedPosts.data.posts])
  }

  const [isFetching, setIsFetching] = useInfiniteScroll(fetch, {
    threshold: 500,
    hasNext
  })
  const [modal, setModal] = useState({
    accept: null,
    reject: null,
    modify: null,
    filter: null
  })

  useEffect(() => {
    if (!isFetching || posts.length === 0) return
    setIsFetching(false)
  }, [posts])

  useEffect(() => {
    const token = cookies.token
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }, [])

  useEffect(() => {
    fetch()
  }, [statusFilter])

  const filter = async status => {
    setPosts([])
    setCursor()
    setStatusFilter(status)
  }

  const handleModal = (modalName, content = null) => {
    const newState = {
      ...modal
    }
    newState[modalName] = content
    setModal(newState)
  }

  const logout = () => {
    delete axios.defaults.headers.common['Authorization']
    removeCookie('token', {
      path: '/'
    })
    Router.push('/')
  }

  const updatePosts = (id, data) => {
    const updatedPosts = posts.map(post => {
      return post.id === id ? data : post
    })
    setPosts(updatedPosts)
  }

  const handleError = err => {
    if (!err.response) {
      toast.error('네트워크에 문제가 있습니다.')
      return
    }

    switch (err.response.status) {
      case 400:
        toast.error('잘못된 값을 보냈습니다.')
        break
      case 451:
        toast.error('이미 승인된 제보입니다.')
        break
      default:
        toast.error('서버에 문제가 생겼습니다.')
        break
    }
  }

  const handleAccept = async (data, reset) => {
    try {
      const newData = await acceptPost(data)
      updatePosts(data.id, newData)
      reset()
      handleModal('accept')
      toast.success('성공적으로 승인되었습니다.')
    } catch (err) {
      handleError(err)
    }
  }

  const handleReject = async (data, reset) => {
    try {
      const newData = await rejectPost(data)
      updatePosts(data.id, newData)
      reset()
      handleModal('reject')
      toast.success('성공적으로 거부되었습니다.')
    } catch (err) {
      handleError(err)
    }
  }

  const handleModify = async (data, reset) => {
    try {
      const newData = await modifyPost(data)
      updatePosts(data.id, newData)
      reset()
      handleModal('modify')
      toast.success('성공적으로 수정되었습니다.')
    } catch (err) {
      handleError(err)
    }
  }

  const handleDelete = async post => {
    try {
      await deletePost(post._id)
      const newPosts = posts.filter(p => {
        return post._id !== p._id
      })
      setPosts(newPosts)
      toast.success('성공적으로 삭제되었습니다.')
    } catch (err) {
      handleError(err)
    }
  }

  return (
    <div>
      <div className="nav">
        <h1>Welcome, {userData.name}</h1>
        <div className="nav-items">
          <a onClick={logout}>로그아웃</a>
        </div>
      </div>
      <div onChange={event => filter(event.target.value)}>
        <input type="radio" name="status-filter" value={ACCEPTED} />
        승인
        <input
          type="radio"
          name="status-filter"
          value={PENDING}
          defaultChecked
        />
        대기
        <input type="radio" name="status-filter" value={REJECTED} />
        거부
        <input type="radio" name="status-filter" value={DELETED} />
        삭제
      </div>
      <br />
      {posts.map((v, i) => (
        <AdminCard
          post={v}
          key={`card-${i}`}
          modalHandler={handleModal}
          deleteHandler={handleDelete}
        />
      ))}
      {postData.error && (
        <div className="info info--error">{postData.error}</div>
      )}
      {!postData.error && !hasNext && (
        <div className="info">마지막 글입니다.</div>
      )}
      {!postData.error && isFetching && <div className="info">로딩 중...</div>}
      <style jsx>{`
        h1 {
          display: inline;
          margin: 0;
          font-family: 'Spoqa Han Sans', sans-serif;
        }

        h1 > span {
          font-family: 'Spoqa Han Sans', sans-serif;
        }

        .nav {
          font-family: 'Spoqa Han Sans', sans-serif;
          display: flex;
          justify-content: space-between;
        }

        .nav-items {
          margin: auto 0;
        }

        .nav a {
          font-size: 18px;
          font-family: 'Spoqa Han Sans', sans-serif;
          text-decoration: none;
          margin-left: 2rem;
          cursor: pointer;
        }

        @media screen and (max-width: 600px) {
          h1 {
            font-size: 1.8em;
          }

          .nav a {
            font-size: 14px;
            margin-left: 1rem;
          }
        }

        button {
          font-family: 'Spoqa Han Sans', sans-serif;
        }

        .info {
          text-align: center;
          font-size: 14px;
          font-family: 'Spoqa Han Sans', sans-serif;
          color: #41adff;
        }

        .info.info--error {
          color: #eb4034;
        }

        .icon-filter {
          cursor: pointer;
          float: right;
          opacity: 0.7;
          font-size: x-large;
        }
      `}</style>
      {modal.accept && (
        <AcceptModal
          post={modal.accept}
          modalHandler={handleModal}
          onSubmit={handleAccept}
        />
      )}
      <RejectModal
        post={modal.reject}
        modalHandler={handleModal}
        onSubmit={handleReject}
      />
      <ModifyModal
        post={modal.modify}
        modalHandler={handleModal}
        onSubmit={handleModify}
      />
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

  // 토큰이 있는데 로그인 페이지에 접근
  if (token && ctx.query.type === 'login') {
    redirect('/a1p4ca')
    return
  }

  // 정상적인 로그인 페이지 접근
  if (ctx.query.type === 'login') {
    return {
      isLoginPage: true
    }
  }

  // 토큰이 없는데 관리자 페이지 접근
  if (!token && !ctx.query.type) {
    redirect('/a1p4ca/login')
    return
  }

  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

  try {
    const postData = await getPosts(15, null, PENDING)
    const userData = jwt.decode(token)

    return {
      userData,
      postData: postData.data
    }
  } catch (err) {
    if (!err.response) {
      return {
        postData: {
          posts: [],
          error: '네트워크에 문제가 있음'
        }
      }
    }

    switch (err.response.status) {
      case 401:
        toast.error('토큰이 만료됨!')
        cookies.remove('token')
        redirect('/a1p4ca/login')
        break
      default:
        toast.error('잘못됨!')
        cookies.remove('token')
        redirect('/a1p4ca/login')
        break
    }
  }
}

A1P4CA.propTypes = {
  postData: PropTypes.shape({
    posts: PropTypes.array.isRequired,
    cursor: PropTypes.string,
    hasNext: PropTypes.bool,
    error: PropTypes.string
  }),
  userData: PropTypes.object,
  isLoginPage: PropTypes.bool
}

export default A1P4CA
