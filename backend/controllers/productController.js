const path = require('path');
const Product = require('../models/Product');
const Purchase = require('../models/Purchase');

// @route   GET /api/products
// @access  Public
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().select('-pdfFile').sort('-createdAt');
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('-pdfFile');
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found.' });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @route   POST /api/admin/products
// @access  Admin
const createProduct = async (req, res) => {
  try {
    const { title, description, price, isFree } = req.body;

    if (!title || !description || price === undefined) {
      return res
        .status(400)
        .json({ success: false, message: 'Title, description, and price are required.' });
    }

    if (!req.files || !req.files.pdfFile) {
      return res
        .status(400)
        .json({ success: false, message: 'PDF file is required.' });
    }

    const pdfPath = `/uploads/pdfs/${req.files.pdfFile[0].filename}`;
    const coverPath = req.files.coverImage
      ? `/uploads/covers/${req.files.coverImage[0].filename}`
      : '';

    const product = await Product.create({
      title,
      description,
      price: Number(price),
      isFree: isFree === 'true' || Number(price) === 0,
      coverImage: coverPath,
      pdfFile: pdfPath,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @route   DELETE /api/admin/products/:id
// @access  Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found.' });
    }
    res.status(200).json({ success: true, message: 'Product deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @route   GET /api/admin/products
// @access  Admin
const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find().sort('-createdAt');
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  deleteProduct,
  getAllProductsAdmin,
};
