import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach token from localStorage as fallback if cookie doesn't work
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('helpdost_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401s globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('helpdost_token')
      localStorage.removeItem('helpdost_user')
    }
    return Promise.reject(err)
  }
)

export default api
