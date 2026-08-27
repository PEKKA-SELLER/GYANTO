import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
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

const ProductDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [purchased, setPurchased] = useState(() => !!localStorage.getItem(`dl_token_${id}`))
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [downloadToken, setDownloadToken] = useState(() => 
    localStorage.getItem(`dl_token_${id}`) || null
  )
  const [purchased, setPurchased] = useState(() => !!localStorage.getItem(`dl_token_${id}`))

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/products/${id}`)
        setProduct(res.data.product)

        if (user) {
          const checkRes = await api.get(`/download/purchases/check/${id}`)
          setPurchased(checkRes.data.purchased)
        }
      } catch {
        toast.error('Product not found.')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, user, navigate])

  const handleBuy = () => {
    if (user) {
      processBuy({ guestName: user.name, guestEmail: user.email })
    } else {
      setShowModal(true)
    }
  }

  const processBuy = async ({ guestName, guestEmail }) => {
    setShowModal(false)
    setPurchasing(true)
    try {
      const res = await api.post('/payment/create-order', {
        productId: id,
        guestName,
        guestEmail,
      })
      if (res.data.free) {
        const token = res.data.downloadToken
        localStorage.setItem(`dl_token_${id}`, token)
        setDownloadToken(token)
        setPurchased(true)
        return toast.success('Free product unlocked!')
      }

      const loaded = await loadRazorpay()
      if (!loaded) return toast.error('Failed to load Razorpay.')

      const options = {
        key: res.data.keyId,
        amount: res.data.amount,
        currency: res.data.currency,
        name: 'HelpDost',
        description: product.title,
        order_id: res.data.orderId,
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/payment/verify', {
              ...response,
              productId: id,
              guestName,
              guestEmail,
            })
            const token = verifyRes.data.downloadToken
            localStorage.setItem(`dl_token_${id}`, token)
            setDownloadToken(token)
            setPurchased(true)
            toast.success('Payment successful! 🎉')
          } catch {
            toast.error('Payment verification failed.')
          }
        },
        prefill: { name: guestName, email: guestEmail },
        theme: { color: '#6470f3' },
      }
      new window.Razorpay(options).open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed.')
    } finally {
      setPurchasing(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const dlPath = downloadToken
        ? `/download/${id}?token=${downloadToken}`
        : `/download/${id}`
      const res = await api.get(dlPath, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${product.title}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Download started!')
    } catch {
      toast.error('Download failed. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return <Loader size="lg" />
  if (!product) return null

  return (
    <>
    {showModal && (
      <GuestCheckoutModal
        product={product}
        onConfirm={processBuy}
        onClose={() => setShowModal(false)}
      />
    )}
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 group"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Browse
      </button>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Cover */}
        <div className="lg:col-span-2">
          <div className="glass-card overflow-hidden rounded-2xl aspect-[3/4] flex items-center justify-center bg-dark-700">
            {product.coverImage ? (
              <img src={product.coverImage} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-3 text-white/20">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-sm">No Cover</span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {product.isFree || product.price === 0 ? (
                <span className="badge-free">FREE</span>
              ) : (
                <span className="badge-paid">PAID</span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{product.title}</h1>
            <p className="text-white/60 text-base leading-relaxed">{product.description}</p>
          </div>

          {/* Price box */}
          <div className="glass-card p-6 flex items-center justify-between">
            <div>
              <p className="text-white/40 text-sm">Price</p>
              <p className="text-4xl font-bold text-white mt-1">
                {product.isFree || product.price === 0 ? (
                  <span className="text-emerald-400">Free</span>
                ) : (
                  <>₹{product.price}</>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-white/50 text-sm">Instant Download</span>
            </div>
          </div>

          {/* Action */}
          {purchased ? (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn-primary w-full text-base py-4"
            >
              {downloading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Downloading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleBuy}
              disabled={purchasing}
              className="btn-primary w-full text-base py-4"
            >
              {purchasing ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </>
              ) : product.isFree || product.price === 0 ? (
                'Get for Free'
              ) : (
                `Buy for ₹${product.price}`
              )}
            </button>
          )}

          {/* Features */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '📄', text: 'PDF Format' },
              { icon: '♾️', text: 'Lifetime Access' },
              { icon: '📱', text: 'Mobile Friendly' },
              { icon: '🔒', text: 'Secure Purchase' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-2 text-white/50 text-sm">
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default ProductDetail
