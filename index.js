const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const uploadVoucher = require('./middlewares/storage')
const pathfotoVoucher = path.join(__dirname, './public')
const authToken = require('./middlewares/auth.js')

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;
const baseURL = process.env.BASEURL || "http://localhost:3000/api"
const SECRET_KEY = 'adghwgdaamsdwjdhbfdsamhuwadn';


require('dotenv').config();

// Middleware
app.use(bodyParser.json());
const corsOption = {
  origin: "*",
  credentials: true,
};
app.use(cors(corsOption));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/api/file/:filename', (req, res) => {
  const filePath = path.join(pathfotoVoucher, req.params.filename)
  res.sendFile(filePath)
})

// Registrasi user
app.post('/api/register', async (req, res) => {
  const { username, password, email, nama } = req.body;

  if (!username || !password || !email || !nama) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        nama,
      },
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      const token = jwt.sign({ userId: user.id }, SECRET_KEY);
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout (token management should be handled on client side)
app.post('/api/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

// Get all vouchers
app.get('/api/vouchers', authToken, async (req, res) => {
  try {
    const vouchers = await prisma.voucher.findMany();
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const upload = uploadVoucher
// Create a new voucher
app.post('/api/vouchers', upload.single("file"),  authToken, async (req, res) => {
  const { nama, kategori, status } = req.body;
  const fileName = req.file.filename

  try {
    const newVoucher = await prisma.voucher.create({
      data: {
        nama,
        foto : `${baseURL}/file/${fileName}`,
        kategori,
        status,
      },
    });
    res.json(newVoucher);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



// Delete a voucher
app.delete('/api/vouchers/:id', authToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.voucher.delete({ where: { id: parseInt(id, 10) } });
    res.json({ message: 'Voucher deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Voucher not found' });
  }
});

// Claim a voucher
app.post('/api/vouchers/:id/claim', authToken, async (req, res) => {
  const { id } = req.params;
  console.log(`Received request to claim voucher with ID: ${id}`); // Logging di backend

  try {
    const existingVoucher = await prisma.voucher.findUnique({ where: { id: parseInt(id, 10) } });

    if (!existingVoucher) {
      return res.status(400).json({ error: 'Voucher not found' });
    }

    const voucherClaim = await prisma.voucher_claim.create({
      data: {
        id_Voucher: parseInt(id, 10),
        id_User: req.user.userId, // Associate claim with the authenticated user
      },
    });

    res.json(voucherClaim);
  } catch (error) {
    console.error('Error claiming voucher:', error.message);
    res.status(400).json({ error: error.message });
  }
});


// Get voucher purchase history
app.get('/api/vouchers/history', authToken, async (req, res) => {
  try {
    const claims = await prisma.voucher_claim.findMany({
      where: { id_User: req.user.userId }, // Filter by the authenticated user
      include: { voucher: true },
    });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/vouchers/history/:id', authToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const userId = req.user.userId;

    // Menghapus klaim voucher tertentu berdasarkan ID klaim dan ID pengguna yang diautentikasi
    const deletedClaim = await prisma.voucher_claim.deleteMany({
      where: { 
        id: parseInt(id),  // ID klaim voucher
        id_User: userId    // ID pengguna
      }
    });

    if (deletedClaim.count > 0) {
      res.json({ message: 'Klaim voucher berhasil dihapus.' });
    } else {
      res.status(404).json({ message: 'Klaim voucher tidak ditemukan atau tidak memiliki akses.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Middleware untuk menangani rute yang tidak ditemukan (404 Not Found)
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Middleware untuk penanganan error global
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
