const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

const headers = () => ({
  'Content-Type': 'application/json',
})

export const get = async (path) => {
  const response = await fetch(`${apiBase}${path}`, { headers: headers() })
  return response.json()
}

export const post = async (path, body) => {
  const response = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  })
  return response.json()
}

export const put = async (path, body) => {
  const response = await fetch(`${apiBase}${path}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  })
  return response.json()
}

export const del = async (path) => {
  const response = await fetch(`${apiBase}${path}`, {
    method: 'DELETE',
    headers: headers(),
  })
  return response.json()
}

export const patch = async (path, body) => {
  const response = await fetch(`${apiBase}${path}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(body),
  })
  return response.json()
}
