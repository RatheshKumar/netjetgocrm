// modules/erp/routes/index.js
const express = require('express');
const router = express.Router();
const productService = require('../services/product.service');
const { authenticate } = require('../../shared/middleware/auth.middleware');

router.get('/products', authenticate, async (req, res) => {
  try {
    const products = await productService.listProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/products', authenticate, async (req, res) => {
  try {
    const result = await productService.addProduct(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
