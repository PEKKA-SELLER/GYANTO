import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import AdminRoute from './components/AdminRoute'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import ProductDetail from './pages/ProductDetail'
import AdminPanel from './pages/AdminPanel'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* ── Public Routes (No Login Required) ── */}
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetail />} />

              {/* ── Admin Only Routes ── */}
              {/* /login is only for admin to sign in */}
              <Route path="/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                }
              />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="border-t border-white/5 py-6 mt-12">
            <div className="max-w-7xl mx-auto px-4 text-center text-white/20 text-sm">
              © {new Date().getFullYear()} HelpDost. All rights reserved.
            </div>
          </footer>
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1c35',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#6470f3', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
