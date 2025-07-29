const express = require('express');
const router = express.Router();
const { 
  createOrganization, 
  joinOrganization, 
  getOrganizationDetails, 
  inviteMember, 
  removeMember, 
  getOrganizationMembers, 
  getJoinCode,
  changeRole
} = require('../controllers/OrganizationController');
const authMiddleware = require('../middleware/auth');

router.post('/create', authMiddleware, createOrganization);
router.post('/join', authMiddleware, joinOrganization);
router.post('/invite', authMiddleware, inviteMember);
router.post('/remove-member', authMiddleware, removeMember);
router.get('/members', authMiddleware, getOrganizationMembers);
router.get('/join-code', authMiddleware, getJoinCode);
router.post('/change-role', authMiddleware, changeRole);
router.get('/test', authMiddleware, (req, res) => {
  res.json({ 
    message: 'Auth working', 
    user: req.user,
    userOrg: req.user.organization 
  });
});
router.get('/:orgId', authMiddleware, getOrganizationDetails);

module.exports = router;
