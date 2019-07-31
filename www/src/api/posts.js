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

export async function acceptPost({ id, fbLink }) {
  try {
    return (await axios.patch(`/api/posts/${id}`, {
      status: 'ACCEPTED',
      fbLink
    })).data
  } catch (err) {
    return {}
  }
}

export async function rejectPost({ id, reason }) {
  try {
    return (await axios.patch(`/api/posts/${id}`, {
      status: 'REJECTED',
      reason
    })).data
  } catch (err) {
    return {}
  }
}

export async function modifyPost(post) {
  try {
    return (await axios.patch(`/api/posts/${post.id}`, post)).data
  } catch (err) {
    return {}
  }
}

export async function getNewNumber() {
  try {
    return (await axios.get('/api/posts/new-number')).data.newNumber
  } catch (err) {
    return -1
  }
}
