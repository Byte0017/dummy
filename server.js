// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/auth_demo', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// User schema
const userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ['student', 'admin'], required: true },
});

const User = mongoose.model('User', userSchema);

const JWT_SECRET = 'your_jwt_secret';
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your_email@gmail.com',
        pass: 'your_app_specific_password', // Use app password for Gmail
    },
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Signup Endpoint
app.post('/signup', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, role });
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login Endpoint (Send OTP)
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) throw new Error('User not found');
        if (!(await bcrypt.compare(password, user.password))) throw new Error('Invalid credentials');
        
        const otp = generateOTP();
        const token = jwt.sign({ email, otp }, JWT_SECRET, { expiresIn: '5m' });

        await transporter.sendMail({
            to: email,
            subject: 'Your Login OTP',
            html: `Your OTP is <b>${otp}</b>. Valid for 5 minutes.`,
        });

        res.json({ message: 'OTP sent to email', tempToken: token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Verify OTP Endpoint
app.post('/verify-otp', async (req, res) => {
    try {
        const { otp, tempToken } = req.body;
        const decoded = jwt.verify(tempToken, JWT_SECRET);
        
        if (decoded.otp !== otp) throw new Error('Invalid OTP');
        
        const user = await User.findOne({ email: decoded.email });
        const authToken = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token: authToken, role: user.role });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
