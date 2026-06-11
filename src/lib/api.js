import axios from 'axios'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL}/api/v1`

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('admin_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  }

  const res = await axios(`${API_BASE}${path}`, { ...options, headers, data: options.body, validateStatus: () => true })
  const data = res.data

  if (res.status !== 200 && res.status !== 201) {
    throw new Error(data.message || 'Something went wrong')
  }

  return data
}

// Auth
export const adminLogin = (email, password) =>
  request('/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) })

// Dashboard
export const getDashboard = () => request('/admin/dashboard')

// Categories
export const getCategories = () => request('/catalog/categories')
export const createCategory = (body) => request('/catalog/categories', { method: 'POST', body: JSON.stringify(body) })
export const updateCategory = (id, body) => request(`/catalog/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) })
export const deleteCategory = (id) => request(`/catalog/categories/${id}`, { method: 'DELETE' })

// Products
export const getProducts = (categoryId) => request(`/catalog/products${categoryId ? `?categoryId=${categoryId}` : ''}`)
export const getProduct = (id) => request(`/catalog/products/${id}`)
export const createProduct = (body) => request('/catalog/products', { method: 'POST', body: JSON.stringify(body) })
export const updateProduct = (id, body) => request(`/catalog/products/${id}`, { method: 'PUT', body: JSON.stringify(body) })
export const deleteProduct = (id) => request(`/catalog/products/${id}`, { method: 'DELETE' })

// Variants
export const createVariant = (body) => request('/catalog/variants', { method: 'POST', body: JSON.stringify(body) })
export const updateVariant = (id, body) => request(`/catalog/variants/${id}`, { method: 'PUT', body: JSON.stringify(body) })
export const deleteVariant = (id) => request(`/catalog/variants/${id}`, { method: 'DELETE' })

// Addons
export const getAddons = () => request('/catalog/addons')
export const createAddon = (body) => request('/catalog/addons', { method: 'POST', body: JSON.stringify(body) })
export const updateAddon = (id, body) => request(`/catalog/addons/${id}`, { method: 'PUT', body: JSON.stringify(body) })
export const deleteAddon = (id) => request(`/catalog/addons/${id}`, { method: 'DELETE' })

// Orders
export const getOrders = () => request('/orders')
export const updateOrderStatus = (id, status) => request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
export const assignDeliveryBoy = (id, deliveryBoyId) => request(`/orders/${id}/assign`, { method: 'PUT', body: JSON.stringify({ deliveryBoyId }) })

// Delivery Boys
export const getDeliveryBoys = () => request('/delivery-boy')
export const createDeliveryBoy = (body) => request('/delivery-boy', { method: 'POST', body: JSON.stringify(body) })
export const updateDeliveryBoy = (id, body) => request(`/delivery-boy/${id}`, { method: 'PUT', body: JSON.stringify(body) })
export const deleteDeliveryBoy = (id) => request(`/delivery-boy/${id}`, { method: 'DELETE' })

// Settings
export const getSettings = () => request('/settings')
export const updateSettings = (body) => request('/settings', { method: 'PUT', body: JSON.stringify(body) })
