import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { useState } from 'react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-dark-900/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow group-hover:shadow-[0_0_20px_rgba(100,112,243,0.6)] transition-shadow">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Help<span className="text-brand-400">Dost</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-white/70 hover:text-white transition-colors text-sm font-medium"
            >
              Browse
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="text-white/70 hover:text-brand-400 transition-colors text-sm font-medium"
              >
                Admin Panel
              </Link>
            )}
          </div>

          {/* Auth buttons — only shown for logged-in admin */}
          <div className="hidden md:flex items-center gap-3">
            {user && user.role === 'admin' ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-brand-gradient flex items-center justify-center text-xs font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-white/80 font-medium">{user.name}</span>
                </div>
                <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4">
                  Logout
                </button>
              </div>
            ) : null}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white/70 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-dark-800/95 backdrop-blur-xl px-4 py-4 space-y-3 animate-fade-in">
          <Link to="/" onClick={() => setMenuOpen(false)} className="block text-white/70 hover:text-white py-2">
            Browse
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setMenuOpen(false)} className="block text-white/70 hover:text-white py-2">
              Admin Panel
            </Link>
          )}
          {user && user.role === 'admin' && (
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <button onClick={handleLogout} className="btn-secondary text-sm">
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
