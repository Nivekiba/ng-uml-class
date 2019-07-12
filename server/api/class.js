const router = require('express').Router();
const mongoose = require('mongoose');
 
const Diagram = mongoose.model('Diagram');
const Class = mongoose.model('Class');

router.param('class', function (req, res, next, id) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.sendStatus(422);
    }
    Class.findById(id).populate("properties").then((clas) => {
        if (!clas) { return res.sendStatus(404); }
  
        req.class = clas;
  
        return next();
    })
 });

 router.post('/', (req, res) => {
    if (!req.body.diagramId || !req.body.name || !req.body.type) {
        res.sendStatus(422);
        return;
    }
  
    if (!req.body.diagramId.match(/^[0-9a-fA-F]{24}$/)) {
        res.sendStatus(422);
        return;
    }
  
    Diagram.findById(req.body.diagramId).then((diag) => {
        if (!diag) { res.statusCode(404); }
  
        let clas = new Class();
        clas.name = req.body.name;
        clas.type = req.body.type;
        clas.diagram = diag;
  
        clas.save().then(() => {
  
            diag.classes.push(clas);
  
            diag.save().then(() => {
                res.status(201).json(clas.toDto());
            });
        });
    });
 });

 router.put('/', (req, res) => {
 
    if (req.body.type == undefined || req.body.name == undefined || !req.body.id) {
        res.sendStatus(422);
    }
  
    if (!req.body.id.match(/^[0-9a-fA-F]{24}$/)) {
        res.sendStatus(422);
    }
  
  
    Class.findById(req.body.id).populate("properties").then((clas) => {
        clas.type = req.body.type
        clas.name = req.body.name
  
        clas.save().then(() => {
            res.status(200).json(clas.toDto());
        })
    })
 })

 router.delete('/:class', (req, res) => {
    let clas = req.class;
  
    clas.remove().then(() => {
        res.sendStatus(200);
    });
 });

module.exports = router