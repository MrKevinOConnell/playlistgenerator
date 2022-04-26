const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const PORT = process.env.PORT || 8888;
const application = express();


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