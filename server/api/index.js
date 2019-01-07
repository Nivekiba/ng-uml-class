var router = require('express').Router();
var passport = require('passport');

var config_passport = require("../config/passport");
config_passport(passport);

var todo_r = require('./todo')
var task_r = require('./task')
var user_r = require('./user')
var diagram_r = require('./diagram')

router.use('/todo', todo_r);
router.use('/todo/task', task_r);
router.use('/user', user_r);
router.use('/diagram', diagram_r);

router.use('/class', require("./class"))
router.use('/link', require("./link"))
router.use('/property', require("./property"))

router.get("/logout", function(req, res){
    console.log(req.user)
    req.logout();
    res.send({success: true})
})

module.exports = router