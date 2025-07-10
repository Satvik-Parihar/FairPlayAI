// // Import routes
// const reportsRouter = require('./routers/reports');

// // Use routes
// app.use('/reports', reportsRouter);const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const { createProxyMiddleware } = require('http-proxy-middleware');

// const app = express();

// // MongoDB Connection
// mongoose.connect('mongodb://localhost:27017/fairness_audit', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log('Connected to MongoDB'))
// .catch(err => console.error('MongoDB connection error:', err));

// // Middleware
// app.use(cors());
// app.use(express.json());

// // API Proxy to Django
// app.use('/api', createProxyMiddleware({
//   target: 'http://localhost:8000',
//   changeOrigin: true,
//   pathRewrite: {
//     '^/api': '',
//   },
// }));

// // Routes would be included here (from routers/ folder)
// // Example: app.use('/reports', require('./routers/reports'));

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Import routes
const reportsRouter = require('./routers/reports');
// const authRouter = require('./routers/auth'); // If you're using it

const app = express(); // ✅ This must come BEFORE app.use()

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/fairness_audit', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Proxy Django requests
app.use('/api/django', createProxyMiddleware({
  target: 'http://localhost:8000',
  changeOrigin: true,
  pathRewrite: {
    '^/api/django': '',
  },
}));

// Use custom routes
app.use('/api/reports', reportsRouter);
// app.use('/api/auth', authRouter); // optional

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
