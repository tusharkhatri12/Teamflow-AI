const express = require('express');
const router = express.Router();
const {
  createOrganization,
  joinOrganization,
  getOrganizationDetails,
  inviteMember,
  removeMember
} = require('../controllers/OrganizationController');
const authMiddleware = require('../middleware/auth');

router.post('/create', authMiddleware, createOrganization);
router.post('/join', authMiddleware, joinOrganization);
router.get('/:orgId', authMiddleware, getOrganizationDetails);
router.post('/invite', authMiddleware, inviteMember);
router.post('/remove-member', authMiddleware, removeMember);

module.exports = router;
