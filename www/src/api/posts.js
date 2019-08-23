import axios from './axios'
import { PENDING } from '../utils/post-status'

export async function getPosts(
  count = 10,
  cursor,
  status = PENDING,
  { safe } = { safe: false }
) {
  try {
    return await axios.get('/api/posts', {
      params: {
        count,
        cursor,
        status
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
  return (await axios.post('/api/posts', {
    title,
    content,
    tag,
    verifier: {
      id: verifier.id,
      answer: answer
    }
  })).data
}

export async function getPost(hash) {
  return (await axios.get(`/api/posts/${hash}`)).data
}

export async function acceptPost({ id, fbLink }) {
  return (await axios.patch(`/api/posts/${id}`, {
    status: 'ACCEPTED',
    fbLink
  })).data
}

export async function rejectPost({ id, reason }) {
  return (await axios.patch(`/api/posts/${id}`, {
    status: 'REJECTED',
    reason
  })).data
}

export async function modifyPost(post) {
  return (await axios.patch(`/api/posts/${post.id}`, post)).data
}

export async function deletePost(arg) {
  await axios.delete(`/api/posts/${arg}`)
}

export async function getNewNumber() {
  return (await axios.get('/api/posts/number')).data.newNumber
}
