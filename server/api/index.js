var router = require('express').Router();

var todo_r = require('./todo')
var task_r = require('./task')

router.use('/todo', todo_r);
router.use('/todo/task', task_r);

module.exports = router