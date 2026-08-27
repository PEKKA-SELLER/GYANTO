import { Link } from 'react-router-dom'

const ProductCard = ({ product, onBuy, purchasing }) => {
  const coverUrl = product.coverImage
    ? product.coverImage
    : null

  return (
    <div className="glass-card overflow-hidden group hover:border-brand-600/40 hover:shadow-glow transition-all duration-300 flex flex-col animate-fade-in">
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden bg-dark-700">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-900 to-dark-700">
            <svg className="w-16 h-16 text-brand-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
        {/* Price badge overlay */}
        <div className="absolute top-3 right-3">
          {product.isFree || product.price === 0 ? (
            <span className="badge-free">FREE</span>
          ) : (
            <span className="badge-paid">₹{product.price}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-white text-lg leading-tight mb-2 group-hover:text-brand-300 transition-colors line-clamp-2">
          {product.title}
        </h3>
        <p className="text-white/50 text-sm leading-relaxed flex-1 line-clamp-3 mb-4">
          {product.description}
        </p>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
          <span className="text-2xl font-bold text-white">
            {product.isFree || product.price === 0 ? (
              <span className="text-emerald-400">Free</span>
            ) : (
              <>
                <span className="text-sm text-white/40 font-normal">₹</span>
                {product.price}
              </>
            )}
          </span>
          <div className="flex gap-2">
            <Link
              to={`/product/${product._id}`}
              className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium py-2 px-3 rounded-lg hover:bg-brand-900/30"
            >
              Details
            </Link>
            <button
              onClick={() => onBuy && onBuy(product)}
              disabled={purchasing === product._id}
              className="btn-primary text-sm py-2 px-4"
            >
              {purchasing === product._id ? (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </span>
              ) : product.isFree || product.price === 0 ? (
                'Get Free'
              ) : (
                'Buy Now'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
