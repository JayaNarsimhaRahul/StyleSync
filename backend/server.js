require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start the HTTP server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 StyleSync API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n⚠️  ${signal} received. Closing HTTP server...`);
    server.close(() => {
      console.log('✅ HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('💥 Unhandled Rejection:', err.message);
    server.close(() => process.exit(1));
  });
});
