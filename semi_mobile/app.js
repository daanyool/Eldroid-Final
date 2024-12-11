const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const http = require('http'); // Required for Socket.IO
const { Server } = require('socket.io'); // Import Socket.IO
const app = express();

const server = http.createServer(app); // Create an HTTP server for Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for simplicity
  },
});

// Configure multer for image upload
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp for unique filenames
    },
  }),
}).single('image'); // Expect 'image' field in the request

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/uploads', express.static('uploads')); // To serve static files like images

let accounts = []; // Array to store user accounts

app.post('/addAccount', (req, res) => {
  const { email, password, imageUrl } = req.body;

  if (email && password && imageUrl) {
    // Check if the account already exists
    const accountExists = accounts.some(account => account.email.toLowerCase().trim() === email.toLowerCase().trim());
    
    if (accountExists) {
      console.log('Duplicate account not added:', email);
      return res.status(409).send('Account with this email already exists'); // 409 Conflict
    }

    const newAccount = { email: email.trim(), password, imageUrl };
    accounts.push(newAccount);

    // Notify all clients about the new account
    io.emit('updateAccounts', accounts);

    console.log('New account added:', newAccount);
    res.status(201).send('Account added successfully');
  } else {
    res.status(400).send('Invalid account data');
  }
});

// Handle image upload
app.post('/uploadImage', upload, (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const imageUrl = `http://192.168.160.50:5000/uploads/${req.file.filename}`;
  res.status(200).json({ url: imageUrl });
});

app.get('/accounts', (req, res) => {
  res.send(accounts); // Return the list of accounts
});

app.put('/updateAccount/:email', (req, res) => {
  const { email } = req.params;
  const { newEmail, newPassword, newImageUrl } = req.body;

  const accountIndex = accounts.findIndex(account => account.email === email);
  if (accountIndex !== -1) {
    // Update account details
    accounts[accountIndex] = {
      email: newEmail || accounts[accountIndex].email,
      password: newPassword || accounts[accountIndex].password,
      imageUrl: newImageUrl || accounts[accountIndex].imageUrl,
    };

    // Notify all clients about the updated account list
    io.emit('updateAccounts', accounts);

    console.log('Account updated:', accounts[accountIndex]);
    res.status(200).send('Account updated successfully');
  } else {
    res.status(404).send('Account not found');
  }
});

// Add Socket.IO connection event
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Send the current account list to the newly connected client
  socket.emit('updateAccounts', accounts);

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Start the server with Socket.IO
server.listen(5000, () => {
  console.log('running at port 5000');
});
