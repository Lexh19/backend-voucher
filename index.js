const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;
const SECRET_KEY = 'adghwgdaamsdwjdhbfdsamhuwadn'; 

require('dotenv').config()


app.use(bodyParser.json());

// Helper function untuk autentikasi token JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Registrasi user
app.post('/api/register', async (req, res) => {
  const { username, password, email, nama } = req.body;

  // Memastikan semua field yang dibutuhkan tersedia
  if (!username || !password || !email || !nama) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Meng-hash password sebelum disimpan ke database
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

    // Respons jika registrasi berhasil
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
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ userId: user.id }, SECRET_KEY);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid email or password' });
  }
});

// Logout (token management should be handled on client side)
app.post('/api/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

// Get all vouchers
app.get('/api/vouchers', authenticateToken, async (req, res) => {
  try {
    const vouchers = await prisma.voucher.findMany();
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new voucher
app.post('/api/vouchers', authenticateToken, async (req, res) => {
  const { nama, foto, kategori, status } = req.body;

  try {
    const newVoucher = await prisma.voucher.create({
      data: {
        nama,
        foto,
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
app.delete('/api/vouchers/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.voucher.delete({ where: { id: parseInt(id, 10) } });
    res.json({ message: 'Voucher deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Voucher not found' });
  }
});

// Claim a voucher
app.post('/api/vouchers/:id/claim', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const voucherClaim = await prisma.voucher_claim.create({
      data: {
        id_Voucher: parseInt(id, 10),
      },
    });
    res.json(voucherClaim);
  } catch (error) {
    res.status(400).json({ error: 'Voucher not found or already claimed' });
  }
});

// Get voucher purchase history
app.get('/api/vouchers/history', authenticateToken, async (req, res) => {
  try {
    const claims = await prisma.voucher_claim.findMany({
      include: { voucher: true },
    });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
