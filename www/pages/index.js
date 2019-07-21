import { useContext } from 'react'
import { toast } from 'react-toastify'
import Form from '../src/components/Form'
import Card from '../src/components/Card'
import ThemeContext from '../src/contexts/ThemeContext'
import { getVerifier } from '../src/api/verifier'
import { getPosts, createPost } from '../src/api/posts'

export default function Index ({ posts, cursor, hasNext, verifier }) {
  const [theme, setTheme] = useContext(ThemeContext)

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
        디<span style={{ fontSize: 14 }}>미고</span>대<span style={{ fontSize: 14 }}>나무</span>숲 Beta
        <button
          style={{ fontSize: 16, float: 'right' }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >{theme === 'dark' ? '밝은' : '어두운'} 테마</button>
      </h1>
      <Form onSubmit={handleSubmit} verifier={verifier} />
      {posts && posts.map(post => (
        <Card
          post={post}
          key={post.id} />
      ))}
      <style jsx>{`
        h1 {
          margin-bottom: 3rem;
        }
      `}</style>
    </>
  )
}

Index.getInitialProps = async ctx => {
  const posts = await getPosts()
  const verifier = await getVerifier()

  return {
    posts: posts.data.posts,
    cursor: posts.data.cursor,
    hasNext: posts.data.hasNext,
    verifier: verifier.data
  }
}
