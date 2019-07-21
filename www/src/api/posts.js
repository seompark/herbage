import axios from './axios'

export async function getPosts (count = 10, cursor) {
  return axios.get('/api/posts', {
    params: {
      count,
      cursor
    }
  })
}

export async function createPost ({ title, content, answer, verifier, tag }) {
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
