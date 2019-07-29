import axios from './axios'

export function generateToken(password) {
  return axios.post('/api/a1p4ca', {
    password
  })
}
