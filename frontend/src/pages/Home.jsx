import { useEffect, useState } from 'react'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import GuestCheckoutModal from '../components/GuestCheckoutModal'

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

const Home = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(null)
  const [search, setSearch] = useState('')
  const [modalProduct, setModalProduct] = useState(null)

  useEffect(() => {
    api
      .get('/products')
      .then((res) => setProducts(res.data.products))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

  const handleBuy = (product) => {
    if (user) {
      processBuy(product, { guestName: user.name, guestEmail: user.email })
    } else {
      setModalProduct(product)
    }
  }

  const processBuy = async (product, { guestName, guestEmail }) => {
    setModalProduct(null)
    setPurchasing(product._id)
    try {
      const res = await api.post('/payment/create-order', { productId: product._id, guestName, guestEmail })
      if (res.data.free) {
        toast.success('🎉 Free product unlocked!')
        return
      }
      const loaded = await loadRazorpay()
      if (!loaded) return toast.error('Failed to load Razorpay.')
      const options = {
        key: res.data.keyId,
        amount: res.data.amount,
        currency: res.data.currency,
        name: 'HelpDost',
        description: res.data.productName,
        order_id: res.data.orderId,
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/payment/verify', {
              ...response,
              productId: product._id,
              guestName,
              guestEmail,
            })
            toast.success('🎉 Payment successful!')
            navigate(`/product/${product._id}?token=${verifyRes.data.downloadToken}`)
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed.')
          }
        },
        prefill: { name: guestName, email: guestEmail },
        theme: { color: '#6470f3' },
        modal: { ondismiss: () => toast('Payment cancelled.', { icon: '⚠️' }) },
      }
      new window.Razorpay(options).open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment.')
    } finally {
      setPurchasing(null)
    }
  }

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {modalProduct && (
        <GuestCheckoutModal
          product={modalProduct}
          onConfirm={(info) => processBuy(modalProduct, info)}
          onClose={() => setModalProduct(null)}
        />
      )}
      {/* Hero */}
      <div className="text-center mb-14 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-900/50 border border-brand-700/40 text-brand-300 text-sm font-medium mb-5">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-slow" />
          Premium Study Material
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
          Master Any Subject{' '}
          <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
            Faster
          </span>
        </h1>
        <p className="text-white/50 text-lg max-w-xl mx-auto mb-8">
          Expertly crafted notes and ebooks. Buy once, download forever. Study smarter.
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes, ebooks..."
            className="input-field pl-12"
          />
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        {[
          { label: 'Products', value: products.length },
          { label: 'Students', value: '500+' },
          { label: 'Satisfaction', value: '98%' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-white/40 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Products grid */}
      {loading ? (
        <Loader size="lg" text="Loading products..." />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-white/40 text-lg">No products found{search ? ` for "${search}"` : ''}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onBuy={handleBuy}
              purchasing={purchasing}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Home
