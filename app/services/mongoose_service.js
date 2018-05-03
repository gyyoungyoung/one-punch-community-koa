const mongoose = require('mongoose');
const uri = 'mongodb://localhost/linhe';
mongoose.Promise = global.Promise;

mongoose.connect(uri);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function() {
  console.log('connected!');
})
