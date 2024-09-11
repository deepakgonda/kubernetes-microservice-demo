const express = require('express');

const taskActions = require('../controllers/task-actions');
const verifyUser = require('../middleware/user-auth');

const router = express.Router();

router.get('/health', (req, res) => {
    return res.json({'ready': true}).status(200);
});

router.get('/tasks', verifyUser, taskActions.getTasks);

router.post('/tasks', verifyUser, taskActions.createTask);

router.delete('/tasks/:id', verifyUser, taskActions.deleteTask);

router.get('/logs', verifyUser, taskActions.getLogs);

module.exports = router;