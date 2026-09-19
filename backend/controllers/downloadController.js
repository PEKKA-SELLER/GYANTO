const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Purchase = require('../models/Purchase');

// @route   GET /api/download/:productId?token=xxx  (guest)  OR with JWT (logged-in)
// @access  Public with valid token OR Private
const downloadPdf = async (req, res) => {
  try {
    const { productId } = req.params;
    const { token } = req.query;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    let hasPurchased = false;

    if (product.isFree || product.price === 0) {
      hasPurchased = true;
    } else if (token) {
      // Guest download via token
      const purchase = await Purchase.findOne({ product: productId, downloadToken: token, status: 'completed' });
      hasPurchased = !!purchase;
    } else if (req.user) {
      const purchase = await Purchase.findOne({ user: req.user._id, product: productId, status: 'completed' });
      hasPurchased = !!purchase;
    }

    if (!hasPurchased) {
      return res.status(403).json({ success: false, message: 'Access denied. Please purchase this product first.' });
    }

    if (!product.pdfFile) {
      return res.status(404).json({ success: false, message: 'PDF file not found.' });
    }

    // Stream the file directly through the backend so the browser downloads it with exact filename & headers
    const https = require('https');
    const http = require('http');

    const cleanFilename = `${(product.title || 'ebook').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_')}.pdf`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}"`);
    res.setHeader('Content-Type', 'application/pdf');

    const client = product.pdfFile.startsWith('https') ? https : http;
    client.get(product.pdfFile, (streamRes) => {
      // If Cloudinary redirected or failed
      if (streamRes.statusCode >= 300 && streamRes.statusCode < 400 && streamRes.headers.location) {
        const redirectClient = streamRes.headers.location.startsWith('https') ? https : http;
        redirectClient.get(streamRes.headers.location, (finalRes) => {
          finalRes.pipe(res);
        }).on('error', () => {
          if (!res.headersSent) res.redirect(product.pdfFile);
        });
        return;
      }

      if (streamRes.statusCode !== 200) {
        // Fallback to direct redirect if status not 200
        return res.redirect(product.pdfFile);
      }

      streamRes.pipe(res);
    }).on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) res.redirect(product.pdfFile);
    });
  } catch (error) {
    console.error('Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Server error.' });
    }
  }
};

// @route   GET /api/purchases/my
// @access  Private
const getMyPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({
      user: req.user._id,
      status: 'completed',
    })
      .populate('product', '-pdfFile')
      .sort('-createdAt');

    res.status(200).json({ success: true, purchases });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @route   GET /api/purchases/check/:productId
// @access  Private
const checkPurchase = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).select('price isFree');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.isFree || product.price === 0) {
      return res.status(200).json({ success: true, purchased: true, free: true });
    }

    const purchase = await Purchase.findOne({
      user: req.user._id,
      product: productId,
      status: 'completed',
    });

    res.status(200).json({ success: true, purchased: !!purchase });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { downloadPdf, getMyPurchases, checkPurchase };
