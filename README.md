# HelpDost 📚

> Buy and download premium notes & ebooks (PDFs) with Razorpay payment integration.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT (httpOnly cookie + localStorage fallback) |
| Payments | Razorpay (test mode) |
| File Storage | Local `/uploads` folder |

---

## Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) or a MongoDB Atlas URI
- Razorpay test account (free at [razorpay.com](https://razorpay.com))

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env — fill in your Razorpay test keys
npm install
npm run seed        # Creates admin user + sample products
npm run dev         # Starts on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev         # Starts on http://localhost:5173
```

### 4. Default Admin Credentials
| Field | Value |
|---|---|
| Email | admin@helpdost.com |
| Password | Admin@123 |

---

## Environment Variables (backend/.env)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `RAZORPAY_KEY_ID` | Razorpay test Key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay test Key Secret |
| `CLIENT_URL` | Frontend URL for CORS |

---

## Razorpay Setup

1. Create a free account at [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Go to **Settings → API Keys → Test Mode**
3. Generate a key pair and copy Key ID + Secret into `backend/.env`
4. Test payment card: `4111 1111 1111 1111`, any future expiry, any CVV

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register |
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/logout` | Private | Logout |
| GET | `/api/auth/me` | Private | Get current user |
| GET | `/api/products` | Public | List all products |
| GET | `/api/products/:id` | Public | Product detail |
| POST | `/api/payment/create-order` | Private | Create Razorpay order |
| POST | `/api/payment/verify` | Private | Verify & record purchase |
| GET | `/api/download/:productId` | Private | Stream PDF securely |
| GET | `/api/download/purchases/my` | Private | My purchases |
| GET | `/api/download/purchases/check/:id` | Private | Check if purchased |
| GET | `/api/admin/products` | Admin | All products |
| POST | `/api/admin/products` | Admin | Create product |
| DELETE | `/api/admin/products/:id` | Admin | Delete product |

---

## Security Design

- **PDFs are never served as static files** — only through `/api/download/:id` which verifies JWT + Purchase record
- **Cover images** are served as public static (not sensitive)
- **Razorpay signature** is verified server-side using HMAC-SHA256 before creating any purchase record
- **Password hashing**: bcryptjs with 12 rounds
- **JWT**: httpOnly cookie (prevents XSS) + Authorization header fallback

---

## Folder Structure

```
helpdost/
├── backend/
│   ├── config/          db.js, seeder.js
│   ├── controllers/     authController, productController, paymentController, downloadController
│   ├── middleware/       authMiddleware, uploadMiddleware
│   ├── models/          User, Product, Purchase
│   ├── routes/          authRoutes, productRoutes, paymentRoutes, downloadRoutes, adminRoutes
│   ├── uploads/         covers/ (public), pdfs/ (private — never served statically)
│   └── server.js
└── frontend/
    └── src/
        ├── api/         axios.js
        ├── components/  Navbar, ProductCard, ProtectedRoute, AdminRoute, Loader
        ├── context/     AuthContext
        └── pages/       Home, Login, Signup, ProductDetail, Dashboard, AdminPanel
```
