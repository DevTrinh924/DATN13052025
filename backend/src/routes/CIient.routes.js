
const express = require('express');
const router = express.Router();
const clientController = require("../controllers/Client.controller");
const upload = require('../utils/upload');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Public routes
router.post('/login', clientController.login);
router.post('/register', upload.single('avatar'), clientController.register);

// Protected routes
router.get('/me', authMiddleware, clientController.getCurrentUser);
router.get('/', authMiddleware, clientController.getAllClients);
router.get('/:id', authMiddleware, clientController.getClientById);
router.post('/', authMiddleware, upload.single('avatar'), clientController.createClient);
router.put('/:id', authMiddleware, upload.single('avatar'), clientController.updateClient);
router.delete('/:id', authMiddleware, clientController.deleteClient);

module.exports = router;