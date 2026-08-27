import { useState } from 'react'

const GuestCheckoutModal = ({ product, onConfirm, onClose }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setLoading(true)
    await onConfirm({ guestName: name.trim(), guestEmail: email.trim() })
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md p-6 rounded-2xl animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Quick Checkout</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-5">
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">{product.title}</p>
            <p className="text-brand-400 font-bold">
              {product.isFree || product.price === 0 ? 'Free' : `₹${product.price}`}
            </p>
          </div>
        </div>

        <p className="text-white/50 text-sm mb-4">
          Enter your details to receive your download link after payment.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input-field"
          />
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
          <button
            type="submit"
            disabled={loading || !name.trim() || !email.trim()}
            className="btn-primary w-full py-3 mt-1"
          >
            {loading ? 'Processing...' : product.isFree || product.price === 0 ? 'Get for Free' : `Pay ₹${product.price}`}
          </button>
        </form>
      </div>
    </div>
  )
}

export default GuestCheckoutModal
