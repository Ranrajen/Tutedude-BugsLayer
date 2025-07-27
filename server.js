const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/bulkbuy', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// User schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String, // 'vendor' or 'supplier'
});

const User = mongoose.model('User', userSchema);

// Register endpoint
app.post('/api/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!email.endsWith('@gmail.com')) {
        return res.status(400).json({ error: 'Email must be a @gmail.com address' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = new User({ name, email, password: hashedPassword, role });
        await user.save();
        res.status(201).json({ message: 'User registered' });
    } catch (err) {
        res.status(400).json({ error: 'Email already exists' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, role: user.role }, 'secretkey');
    res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
});

// Get profile endpoint
app.get('/api/profile', async (req, res) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'No token' });
    try {
        const decoded = jwt.verify(auth.split(' ')[1], 'secretkey');
        const user = await User.findById(decoded.userId).select('-password');
        res.json(user);
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Update profile endpoint
app.put('/api/profile', async (req, res) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'No token' });
    try {
        const decoded = jwt.verify(auth.split(' ')[1], 'secretkey');
        const { name } = req.body;
        const user = await User.findByIdAndUpdate(decoded.userId, { name }, { new: true }).select('-password');
        res.json(user);
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Simple root endpoint
app.get('/', (req, res) => {
    res.send('BulkBuy backend is running!');
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));


// ...existing code...

const groupSchema = new mongoose.Schema({
    name: String,
    category: String,
    description: String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, default: 'Active' }
});

const Group = mongoose.model('Group', groupSchema);


// Create a new group
app.post('/api/groups', async (req, res) => {
    const { name, category, description } = req.body;
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'No token' });
    try {
        const decoded = jwt.verify(auth.split(' ')[1], 'secretkey');
        const group = new Group({
            name,
            category,
            description,
            members: [decoded.userId],
            createdBy: decoded.userId
        });
        await group.save();
        res.status(201).json(group);
    } catch (err) {
        res.status(400).json({ error: 'Could not create group' });
    }
});

// Get all groups (with member info)
app.get('/api/groups', async (req, res) => {
    const groups = await Group.find().populate('members', 'name email');
    res.json(groups);
});

// Join a group
app.post('/api/groups/:id/join', async (req, res) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'No token' });
    try {
        const decoded = jwt.verify(auth.split(' ')[1], 'secretkey');
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found' });
        if (!group.members.includes(decoded.userId)) {
            group.members.push(decoded.userId);
            await group.save();
        }
        res.json(group);
    } catch {
        res.status(400).json({ error: 'Could not join group' });
    }
});

// Leave a group
app.post('/api/groups/:id/leave', async (req, res) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'No token' });
    try {
        const decoded = jwt.verify(auth.split(' ')[1], 'secretkey');
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found' });
        group.members = group.members.filter(
            memberId => memberId.toString() !== decoded.userId
        );
        await group.save();
        res.json(group);
    } catch {
        res.status(400).json({ error: 'Could not leave group' });
    }
});