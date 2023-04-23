const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const moment = require('moment');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost/your-database-name', { useNewUrlParser: true, useUnifiedTopology: true });

const RecordSchema = new mongoose.Schema({
  temperature: Number,
  batteryLevel: Number,
  timeStamp: String,
});

const Record = mongoose.model('Record', RecordSchema);

// Express middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/records', (req, res) => {
  Record.find().sort({ _id: -1 }).limit(20).exec((err, records) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    return res.json(records.reverse());
  });
});

app.get('/records/:startDate/:endDate', (req, res) => {
  const startDate = moment(req.params.startDate, 'DD-MM-YYYYTHH:mm:ss.SSSZ').toDate();
  const endDate = moment(req.params.endDate, 'DD-MM-YYYYTHH:mm:ss.SSSZ').toDate();

  Record.find({
    timeStamp: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ _id: -1 }).exec((err, records) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    if (records.length === 0) {
      return res.status(404).json({ message: 'No records found' });
    }
    return res.json(records.reverse());
  });
});

// Socket.io
io.on('connection', socket => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start server
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
