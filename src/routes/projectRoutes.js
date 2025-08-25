const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const projectCtrl = require('../controllers/ProjectController');

router.use(auth);
router.get('/:orgId', projectCtrl.listProjects);
router.post('/:orgId', projectCtrl.createProject);

module.exports = router;


