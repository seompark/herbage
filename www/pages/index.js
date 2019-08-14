import { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import { toast } from 'react-toastify'
import Form from '../src/components/Form'
import Card from '../src/components/Card'
import ThemeContext from '../src/contexts/ThemeContext'
import { getVerifier } from '../src/api/verifier'
import { createPost, deletePost, getPosts, getPost } from '../src/api/posts'
import useInfiniteScroll from '../src/hooks/useInfiniteScroll'
import axios from '../src/api/axios'
import ManageModal from '../src/components/modals/ManageModal'

export default function Index({ postData, verifier }) {
  const [posts, setPosts] = useState(postData.posts.slice())
  const [cursor, setCursor] = useState(postData.cursor)
  const [theme, setTheme] = useContext(ThemeContext)
  const [hasNext, setHasNext] = useState(postData.hasNext)
  const [hash, setHash] = useState('')
  const [isFetching, setIsFetching] = useInfiniteScroll(
    async () => {
      try {
        const fetchedPosts = await getPosts(10, cursor)
        setCursor(fetchedPosts.data.cursor)
        setHasNext(fetchedPosts.data.hasNext)
        setPosts([...posts, ...fetchedPosts.data.posts])
      } catch (err) {
        toast.error('새 글을 불러오던 도중 문제가 생겼습니다.')
        setIsFetching(false) // allows retry
      }
    },
    {
      threshold: 500,
      hasNext
    }
  )
  const [modal, setModal] = useState({
    delete: null
  })

  useEffect(() => {
    if (!isFetching) return
    setIsFetching(false)
  }, [posts])
  useEffect(() => {
    delete axios.defaults.headers.common['Authorization']
  }, [])

  const handleError = err => {
    if (!err.response) {
      toast.error('네트워크에 문제가 있습니다.')
      return
    }

    switch (err.response.status) {
      case 451:
        toast.error('인증에 실패했습니다.')
        break
      case 400:
        toast.error('잘못된 값을 보냈습니다.')
        break
      case 404:
        toast.error('존재하지 않는 글입니다.')
        break
      default:
        toast.error('서버에 문제가 생겼습니다.')
        break
    }
  }
  const handleModal = (modalName, content = null) => {
    const newState = {
      ...modal
    }
    newState[modalName] = content
    setModal(newState)
  }
  const handleSubmit = async (data, reset) => {
    try {
      const post = await createPost(data)
      await setHash(post.hash)
      reset()
      toast.success('성공적으로 제출했습니다.')
    } catch (err) {
      handleError(err)
    }
  }
  const handleManage = async (hash, post, reset) => {
    if (!post) {
      try {
        return await getPost(hash)
      } catch (err) {
        handleError(err)
        return
      }
    }
    try {
      await deletePost(hash)
      reset()
      toast.success('제보가 삭제되었습니다.')
    } catch (err) {
      handleError(err)
    }
  }

  return (
    <>
      <div className="nav">
        <h1>
          디<span style={{ fontSize: 14 }}>미고</span>대
          <span style={{ fontSize: 14 }}>나무</span>숲
        </h1>
        <div className="nav-items">
          <a onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? '밝은' : '어두운'} 테마
          </a>
          <a onClick={() => handleModal('delete', {})}>제보 관리</a>
        </div>
      </div>
      <Form onSubmit={handleSubmit} verifier={verifier} />
      {hash && (
        <div className="hash card">
          {`제보한 글의 수정 및 삭제를 위해서 다음 해시코드를 반드시 저장해주세요.\n${hash}`}
        </div>
      )}
      {posts && posts.map(post => <Card post={post} key={post.id} />)}
      {postData.error && (
        <div className="info info--error">{postData.error}</div>
      )}
      {!postData.error && isFetching && <div className="info">로딩 중...</div>}
      {!postData.error && !hasNext && (
        <div className="info">마지막 글입니다.</div>
      )}
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
          margin-bottom: 2rem;
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

        .info {
          text-align: center;
          font-size: 14px;
          font-family: 'Spoqa Han Sans', sans-serif;
          color: #41adff;
        }

        .info.info--error {
          color: #eb4034;
        }

        .hash {
          color: #ffab40;
          margin-top: 1rem;
          margin-bottom: 1rem;
          padding: 2rem;
          border-radius: 7.5px;
          word-break: break-word;
        }
      `}</style>
      <ManageModal
        content={modal.delete}
        modalHandler={handleModal}
        onSubmit={handleManage}
      />
    </>
  )
}

Index.getInitialProps = async ctx => {
  delete axios.defaults.headers.common['Authorization']

  const fetchPosts = getPosts(15, undefined, { safe: true })
  const fetchVerifier = getVerifier({ safe: true })

  const postData = (await fetchPosts).data
  const verifier = (await fetchVerifier).data
  return {
    postData,
    verifier
  }
}

Index.propTypes = {
  postData: PropTypes.exact({
    posts: PropTypes.array.isRequired,
    cursor: PropTypes.string.isRequired,
    hasNext: PropTypes.bool.isRequired,
    error: PropTypes.string
  }),
  verifier: PropTypes.exact({
    id: PropTypes.string.isRequired,
    question: PropTypes.string.isRequired,
    error: PropTypes.string
  })
}
