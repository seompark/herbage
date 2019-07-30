import axios from './axios'

export async function getVerifier({ safe } = { safe: false }) {
  try {
    return await axios.get('/api/verifier')
  } catch (err) {
    if (!safe) throw err
    return {
      data: {
        error: '서버에 문제가 생겼습니다.',
        id: '',
        question: ''
      }
    }
  }
}
