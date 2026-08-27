const express = require('express');
const router = express.Router();
const {
  createProduct,
  deleteProduct,
  getAllProductsAdmin,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { uploadProductFiles } = require('../middleware/uploadMiddleware');

router.use(protect, adminOnly);

router.get('/products', getAllProductsAdmin);
router.post('/products', uploadProductFiles, createProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
