const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors');
const syncHistory = require('./controllers/syncHistory');
const syncTrade = require('./controllers/syncTrade');

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// Define Routes
app.use('/api/account', require('./routes/api/account'));
app.use('/api/subscriber', require('./routes/api/subscriber'));
app.use('/api/strategy', require('./routes/api/strategy'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/history', require('./routes/api/history'));
app.use('/api/trade', require('./routes/api/trade'));
app.use('/api/settings', require('./routes/api/setting'));

// Serve static assets in production
// if (process.env.NODE_ENV === 'production') {
//   // Set static folder
//   app.use(express.static('client/build'));

//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
//   });
// }

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '45.8.22.219';

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
// app.listen(PORT, HOST, () => console.log(`Server started on port ${PORT} and on host ${HOST}`));

// setInterval(() => {
//   syncHistory();
//   syncTrade();
// }, 60000 * 5);

// syncTrade();
// syncHistory();
