const express = require('express');
const router = express.Router();
const {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  getCases,
  createCase,
  updateCase,
  deleteCase
} = require('../controllers/caseManagementController');
const { protect } = require('../../auth/middleware/authMiddleware');

// Client routes
router.route('/clients')
  .get(protect, getClients)
  .post(protect, createClient);

router.route('/clients/:id')
  .put(protect, updateClient)
  .delete(protect, deleteClient);

// Case routes
router.route('/cases')
  .get(protect, getCases)
  .post(protect, createCase);

router.route('/cases/:id')
  .put(protect, updateCase)
  .delete(protect, deleteCase);

module.exports = router;
