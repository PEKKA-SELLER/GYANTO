require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./db');
const User = require('../models/User');
const Product = require('../models/Product');

const seed = async () => {
  await connectDB();

  // Clear existing
  await User.deleteMany({});
  await Product.deleteMany({});

  // Create admin
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  const admin = await User.create({
    name: process.env.ADMIN_NAME,
    email: process.env.ADMIN_EMAIL,
    password: hashedPassword,
    role: 'admin',
  });

  console.log(`✅ Admin created: ${admin.email}`);

  // Create sample products
  const products = [
    {
      title: 'React Mastery Notes',
      description:
        'Comprehensive notes covering React hooks, context, performance optimisation, and advanced patterns. Perfect for interview prep and deep learning.',
      price: 99,
      coverImage: '/uploads/covers/sample-cover-1.jpg',
      pdfFile: '/uploads/pdfs/sample-1.pdf',
      isFree: false,
    },
    {
      title: 'DSA Complete Guide',
      description:
        'Data Structures & Algorithms from scratch to advanced — arrays, trees, graphs, DP with solved examples. 200+ pages.',
      price: 149,
      coverImage: '/uploads/covers/sample-cover-2.jpg',
      pdfFile: '/uploads/pdfs/sample-2.pdf',
      isFree: false,
    },
    {
      title: 'Free Git Cheatsheet',
      description:
        'A quick reference PDF covering all essential Git commands. Completely free!',
      price: 0,
      coverImage: '/uploads/covers/sample-cover-3.jpg',
      pdfFile: '/uploads/pdfs/sample-3.pdf',
      isFree: true,
    },
  ];

  await Product.insertMany(products);
  console.log(`✅ ${products.length} sample products created`);

  console.log('\n🎉 Seed complete!');
  console.log(`   Admin email:    ${process.env.ADMIN_EMAIL}`);
  console.log(`   Admin password: ${process.env.ADMIN_PASSWORD}`);
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
