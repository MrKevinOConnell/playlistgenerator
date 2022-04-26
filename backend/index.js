const express = require('express');
const cors = require('cors');
require('dotenv').config();
const PORT = process.env.PORT || 8888;
const application = express();
const path = require('path');

application.use(express.json());
application.use(express.urlencoded({ extended: true}));
application.use(cors());

const AuthRoutes = require('./routes/authRoutes.js');
application.use('/api', cors(), AuthRoutes);
const publicPath = path.join(__dirname, '../playlist/build', 'index.html');

application.use(express.static(path.resolve(__dirname, "./../playlist/build")));

application.listen(PORT, () => {
  console.log(`Server started on port ${PORT}:)`);
});