import { useEffect, useState } from 'react'
import api from '../api/axios'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { user } = useAuth()
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(null)

  useEffect(() => {
    api
      .get('/download/purchases/my')
      .then((res) => setPurchases(res.data.purchases))
      .catch(() => toast.error('Failed to load purchases.'))
      .finally(() => setLoading(false))
  }, [])

  const handleDownload = async (purchase) => {
    const productId = purchase.product._id
    setDownloading(productId)
    try {
      const res = await api.get(`/download/${productId}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${purchase.product.title}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Download started! 📥')
    } catch {
      toast.error('Download failed. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">My Library</h1>
        <p className="text-white/50">
          Welcome back, <span className="text-brand-300 font-medium">{user?.name}</span>! Here are all your purchases.
        </p>
      </div>

      {loading ? (
        <Loader size="lg" text="Loading your library..." />
      ) : purchases.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-bold text-white mb-2">No purchases yet</h2>
          <p className="text-white/40 mb-6">
            Browse our collection and buy your first notes or ebook!
          </p>
          <Link to="/" className="btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {purchases.map((purchase) => {
            const product = purchase.product
            return (
              <div
                key={purchase._id}
                className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-brand-600/40 transition-all duration-300"
              >
                {/* Cover thumbnail */}
                <div className="w-16 h-20 rounded-lg overflow-hidden bg-dark-700 flex-shrink-0 flex items-center justify-center">
                  {product.coverImage ? (
                    <img
                      src={product.coverImage}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-8 h-8 text-brand-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-lg truncate">{product.title}</h3>
                  <p className="text-white/40 text-sm mt-0.5 line-clamp-1">{product.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-white/30">
                      Purchased: {new Date(purchase.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                    {purchase.amount > 0 ? (
                      <span className="badge-paid">₹{purchase.amount}</span>
                    ) : (
                      <span className="badge-free">FREE</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Link
                    to={`/product/${product._id}`}
                    className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDownload(purchase)}
                    disabled={downloading === product._id}
                    className="btn-primary text-sm py-2.5 px-5"
                  >
                    {downloading === product._id ? (
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Downloading...
                      </span>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Dashboard
