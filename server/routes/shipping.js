const express = require('express');
const router = express.Router();

// @route   GET /api/shipping
// @desc    Basic shipping route placeholder
// @access  Public
router.get('/', (req, res) => {
  res.json({ message: 'Shipping API is working' });
});

// @route   POST /api/shipping
// @desc    Create a shipping record
// @access  Public
router.post('/', (req, res) => {
  const { shipping_id, item_name, destination } = req.body;
  console.log('Received shipping data:', { shipping_id, item_name, destination });
  res.status(201).json({ message: 'Shipping record received successfully' });
});

module.exports = router;
