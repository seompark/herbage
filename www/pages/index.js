import { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import { toast } from 'react-toastify'
import Form from '../src/components/Form'
import Card from '../src/components/Card'
import ThemeContext from '../src/contexts/ThemeContext'
import { getVerifier } from '../src/api/verifier'
import { createPost, getPosts } from '../src/api/posts'
import useInfiniteScroll from '../src/hooks/useInfiniteScroll'
import axios from '../src/api/axios'

export default function Index({ postData, verifier }) {
  const [posts, setPosts] = useState(postData.posts.slice())
  const [cursor, setCursor] = useState(postData.cursor)
  const [hasNext, setHasNext] = useState(postData.hasNext)
  const [theme, setTheme] = useContext(ThemeContext)
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

  useEffect(() => {
    if (!isFetching) return
    setIsFetching(false)
  }, [posts])
  useEffect(() => {
    axios.defaults.headers.common['Authorization'] = ``
  }, [isFetching])

  const handleSubmit = async (data, reset) => {
    try {
      await createPost(data)
      reset()
      toast.success('성공적으로 제출했습니다.')
    } catch (err) {
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
        default:
          toast.error('서버에 문제가 생겼습니다.')
          break
      }
    }
  }

  return (
    <>
      <h1>
        디<span style={{ fontSize: 14 }}>미고</span>대
        <span style={{ fontSize: 14 }}>나무</span>숲
        <button
          style={{ fontSize: 16, float: 'right' }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? '밝은' : '어두운'} 테마
        </button>
      </h1>
      <Form onSubmit={handleSubmit} verifier={verifier} />
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
          font-family: 'Spoqa Han Sans', sans-serif;
          margin-bottom: 2rem;
        }

        h1 > span {
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
      `}</style>
    </>
  )
}

Index.getInitialProps = async ctx => {
  delete axios.defaults.headers['Authorization']

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
