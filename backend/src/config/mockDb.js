const bcrypt = require('bcryptjs');

let mockUsers = [
  {
    _id: '60d0fe4f5311236168a10001',
    email: 'customer@homehero.com',
    phone: '+919999999991',
    passwordHash: '', // Will be initialized
    role: 'customer',
    firstName: 'Amit',
    lastName: 'Sharma',
    isVerified: true
  },
  {
    _id: '60d0fe4f5311236168a10002',
    email: 'provider@homehero.com',
    phone: '+919999999992',
    passwordHash: '', // Will be initialized
    role: 'provider',
    firstName: 'Marcus',
    lastName: 'Aurelius',
    isVerified: true
  },
  {
    _id: '60d0fe4f5311236168a10003',
    email: 'admin@homehero.com',
    phone: '+919999999993',
    passwordHash: '', // Will be initialized
    role: 'admin',
    firstName: 'System',
    lastName: 'Admin',
    isVerified: true
  }
];

// Initialize password hashes
const init = async () => {
  const hash = await bcrypt.hash('password123', 10);
  mockUsers.forEach(u => {
    if (!u.passwordHash) u.passwordHash = hash;
  });
};
init();

module.exports = {
  getUsers: () => mockUsers,
  findUserByEmail: (email) => mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase()),
  findUserById: (id) => mockUsers.find(u => u._id.toString() === id.toString()),
  findUserByPhone: (phone) => mockUsers.find(u => u.phone === phone),
  createUser: async (userData) => {
    const hash = await bcrypt.hash(userData.passwordHash, 10);
    const newUser = {
      _id: 'mock_user_' + Date.now(),
      ...userData,
      passwordHash: hash
    };
    mockUsers.push(newUser);
    return newUser;
  },
  saveUser: (user) => {
    const idx = mockUsers.findIndex(u => u._id.toString() === user._id.toString());
    if (idx !== -1) {
      mockUsers[idx] = user;
    }
  }
};
