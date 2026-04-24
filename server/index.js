const express = require('express');
const app = express();

app.use(express.json());

const shippingRoutes = require('./routes/shipping');
const PORT = 3020;

app.use('/api/shipping', shippingRoutes);

app.get('/api', (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
