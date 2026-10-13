// Base API service layer
export const api = {
  get: async (url) => {
    console.log(`[API GET] ${url}`)
    return { data: [] }
  },
  post: async (url, data) => {
    console.log(`[API POST] ${url}`, data)
    return { data }
  },
  put: async (url, data) => {
    console.log(`[API PUT] ${url}`, data)
    return { data }
  },
  delete: async (url) => {
    console.log(`[API DELETE] ${url}`)
    return { success: true }
  },
}

export default api

