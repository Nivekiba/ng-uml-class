const router = require('express').Router();
const mongoose = require('mongoose');
 
const Todo = mongoose.model('Todo');
const Task = mongoose.model('Task');

router.param('task', function (req, res, next, id) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.sendStatus(422);
    }
    Task.findById(id).then((task) => {
        if (!task) { return res.sendStatus(404); }
  
        req.task = task;
  
        return next();
    })
 });

 router.post('/', (req, res) => {
    if (!req.body.todoId || !req.body.content) {
        res.sendStatus(422);
    }
  
    if (!req.body.todoId.match(/^[0-9a-fA-F]{24}$/)) {
        res.sendStatus(422);
    }
  
    Todo.findById(req.body.todoId).then((todo) => {
        if (!todo) { res.statusCode(404); }
  
        let task = new Task();
        task.content = req.body.content;
        task.state = false;
        task.todo = todo;
  
        task.save().then(() => {
  
            todo.tasks.push(task);
  
            todo.save().then(() => {
                res.json(task.toDto()).statusCode(201);
            });
        });
    });
 });

 router.put('/', (req, res) => {
 
    if (req.body.state == undefined || !req.body.id) {
        res.sendStatus(422);
    }
  
    if (!req.body.id.match(/^[0-9a-fA-F]{24}$/)) {
        res.sendStatus(422);
    }
  
  
    Task.findById(req.body.id).then((task) => {
        task.state = req.body.state;
  
        task.save().then(() => {
            res.json(task.toDto()).statusCode(200);
        })
    })
 })

 router.delete('/:task', (req, res) => {
    let task = req.task;
  
    task.remove().then(() => {
        res.sendStatus(200);
    });
 });

module.exports = router