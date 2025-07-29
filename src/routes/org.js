const express = require('express');
const router = express.Router();
const {
  createOrganization,
  joinOrganization,
  getOrganizationDetails,
  inviteMember,
  removeMember,
  getOrganizationMembers,
  getJoinCode
} = require('../controllers/OrganizationController');
const authMiddleware = require('../middleware/auth');

router.post('/create', authMiddleware, createOrganization);
router.post('/join', authMiddleware, joinOrganization);
router.get('/:orgId', authMiddleware, getOrganizationDetails);
router.post('/invite', authMiddleware, inviteMember);
router.post('/remove-member', authMiddleware, removeMember);
router.get('/members', authMiddleware, getOrganizationMembers);
router.get('/join-code', authMiddleware, getJoinCode);

module.exports = router;
