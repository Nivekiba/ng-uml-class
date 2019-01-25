const router = require('express').Router();
const mongoose = require('mongoose');
 
const Diagram = mongoose.model('Diagram');
const Link = mongoose.model('Link');
const Class = mongoose.model('Class');

router.param('class', function (req, res, next, id) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.sendStatus(422);
    }
    Link.findById(id).then((link) => {
        if (!link) { return res.sendStatus(404); }
  
        req.link = link;
  
        return next();
    })
 });

 router.post('/', (req, res) => {
    if (!req.body.diagramId || !req.body.name || !req.body.class1Id || !req.body.class2Id || !req.body.type || !req.body.card1 || !req.body.card2) {
        res.sendStatus(422);
        return;
    }
  
    if (!req.body.diagramId.match(/^[0-9a-fA-F]{24}$/)) {
        res.sendStatus(422);
        return;
    }
  
    Diagram.findById(req.body.diagramId).then((diag) => {
        if (!diag) { res.status(404).json({ msg: "Diagram not found"}); return;}
        console.log("====>",req.body.class1Id)
        Class.findById(req.body.class1Id).then((clas1) => {
            if (!clas1) { res.status(404).json({ msg: "Class 1 not found"}); return;}

            Class.findById(req.body.class2Id).then((clas2) => {
                if (!clas2) { res.status(404).json({ msg: "Class 2 not found"}); return;}

                let link = new Link();
                link.name = req.body.name;
                link.type = req.body.type;

                link.class1 = clas1;
                link.class2 = clas2;

                link.card1 = req.body.card1;
                link.card2 = req.body.card2;
                
                link.diagram = diag;
        
                link.save().then(() => {
        
                    diag.links.push(link);
        
                    diag.save().then(() => {
                        res.status(201).json(link.toDto());
                    });
                });
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
  
  
    Link.findById(req.body.id).then((link) => {
        link.type = req.body.type
        link.name = req.body.name
  
        link.save().then(() => {
            res.status(200).json(link.toDto());
        })
    })
 })

 router.delete('/:class', (req, res) => {
    let link = req.link;
  
    link.remove().then(() => {
        res.sendStatus(200);
    });
 });

module.exports = router