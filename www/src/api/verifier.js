import axios from './axios'

export async function getVerifier () {
  const data = await axios.get('/api/verifier')
  return data
}
