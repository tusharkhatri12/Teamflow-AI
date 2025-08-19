// backend/routes/boardRoutes.js
const express = require('express');
const router = express.Router();
const boardCtrl = require('../controllers/BoardController');
const auth = require('../middleware/auth');

// Board per org
router.use(auth);

router.get('/:orgId', boardCtrl.getBoardByOrg);
router.post('/', boardCtrl.createBoard); // { orgId, name }

// columns & tasks
router.post('/:boardId/column', boardCtrl.addColumn);
router.post('/:boardId/task', boardCtrl.addTask);
router.put('/:boardId/task/:taskId', boardCtrl.updateTask);
router.delete('/:boardId/task/:taskId', boardCtrl.deleteTask);
// task comments
router.post('/:boardId/task/:taskId/comments', boardCtrl.addComment);
router.delete('/:boardId/task/:taskId/comments/:commentId', boardCtrl.deleteComment);

// move task
router.post('/:boardId/move', boardCtrl.moveTask);

// reorder columns
router.put('/:boardId/columns/reorder', boardCtrl.reorderColumns);

// sprints
router.post('/:boardId/sprints', boardCtrl.createSprint);
router.get('/:boardId/sprints', boardCtrl.listSprints);
router.patch('/:boardId/sprints/:sprintId', boardCtrl.updateSprint);

module.exports = router;
