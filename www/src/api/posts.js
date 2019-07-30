import axios from './axios'

export async function getPosts(count = 10, cursor, { safe } = { safe: false }) {
  try {
    return await axios.get('/api/posts', {
      params: {
        count,
        cursor
      }
    })
  } catch (err) {
    if (!safe) throw err
    return {
      data: {
        error: '서버에 문제가 생겼습니다.',
        posts: [],
        cursor: '',
        hasNext: false
      }
    }
  }
}

export async function createPost({ title, content, answer, verifier, tag }) {
  return axios.post('/api/posts', {
    title,
    content,
    tag,
    verifier: {
      id: verifier.id,
      answer: answer
    }
  })
}
