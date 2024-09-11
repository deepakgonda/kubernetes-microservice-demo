const express = require('express');

const userActions = require('../controllers/user-actions');

const router = express.Router();

router.get('/health', (req, res) => {
    return res.json({'ready': true}).status(200);
});


router.post('/signup', userActions.createUser);

router.post('/login', userActions.verifyUser);

router.get('/logs', userActions.getLogs);

module.exports = router;