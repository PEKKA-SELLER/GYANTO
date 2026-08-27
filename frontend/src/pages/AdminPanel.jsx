import { useEffect, useRef, useState } from 'react'
import api from '../api/axios'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const AdminPanel = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const fileRef = useRef(null)
  const coverRef = useRef(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    isFree: false,
  })
  const [pdfFile, setPdfFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)

  const fetchProducts = () => {
    api
      .get('/admin/products')
      .then((res) => setProducts(res.data.products))
      .catch(() => toast.error('Failed to load products.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const resetForm = () => {
    setForm({ title: '', description: '', price: '', isFree: false })
    setPdfFile(null)
    setCoverFile(null)
    if (fileRef.current) fileRef.current.value = ''
    if (coverRef.current) coverRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!pdfFile) return toast.error('Please select a PDF file.')

    const fd = new FormData()
    fd.append('title', form.title)
    fd.append('description', form.description)
    fd.append('price', form.isFree ? '0' : form.price)
    fd.append('isFree', form.isFree)
    fd.append('pdfFile', pdfFile)
    if (coverFile) fd.append('coverImage', coverFile)

    setSubmitting(true)
    try {
      await api.post('/admin/products', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Product created successfully! 🎉')
      resetForm()
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create product.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return
    setDeleting(id)
    try {
      await api.delete(`/admin/products/${id}`)
      toast.success('Product deleted.')
      setProducts((prev) => prev.filter((p) => p._id !== id))
    } catch {
      toast.error('Failed to delete product.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-white/40 text-sm">Logged in as <span className="text-brand-300">{user?.email}</span></p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Add Product Form */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 sticky top-20">
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Product
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Title *</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. React Mastery Notes"
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="What's included in this product..."
                  required
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    className={`w-10 h-5 rounded-full transition-colors relative ${form.isFree ? 'bg-emerald-500' : 'bg-dark-500'}`}
                    onClick={() => setForm((p) => ({ ...p, isFree: !p.isFree, price: !p.isFree ? '0' : p.price }))}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isFree ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm text-white/70">Free product</span>
                </label>
              </div>

              {!form.isFree && (
                <div>
                  <label className="label">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="99"
                    min="1"
                    required={!form.isFree}
                    className="input-field"
                  />
                </div>
              )}

              <div>
                <label className="label">Cover Image (optional)</label>
                <input
                  ref={coverRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setCoverFile(e.target.files[0])}
                  className="input-field text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-brand-600/30 file:text-brand-300 file:text-sm cursor-pointer"
                />
              </div>

              <div>
                <label className="label">PDF File *</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files[0])}
                  required
                  className="input-field text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-brand-600/30 file:text-brand-300 file:text-sm cursor-pointer"
                />
              </div>

              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  'Create Product'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Products list */}
        <div className="lg:col-span-3">
          <h2 className="text-xl font-bold text-white mb-5">
            All Products{' '}
            <span className="text-white/30 text-base font-normal">({products.length})</span>
          </h2>

          {loading ? (
            <Loader size="md" text="Loading products..." />
          ) : products.length === 0 ? (
            <div className="glass-card p-10 text-center text-white/40">
              No products yet. Add your first one!
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="glass-card p-4 flex items-center gap-4 hover:border-brand-600/30 transition-all"
                >
                  <div className="w-12 h-14 rounded-lg overflow-hidden bg-dark-700 flex-shrink-0 flex items-center justify-center">
                    {product.coverImage ? (
                      <img src={product.coverImage} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 text-brand-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{product.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {product.isFree || product.price === 0 ? (
                        <span className="badge-free">FREE</span>
                      ) : (
                        <span className="badge-paid">₹{product.price}</span>
                      )}
                      <span className="text-white/30 text-xs">
                        {new Date(product.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(product._id)}
                    disabled={deleting === product._id}
                    className="btn-danger text-xs"
                  >
                    {deleting === product._id ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
