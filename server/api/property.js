const router = require('express').Router();
const mongoose = require('mongoose');
 
const Property = mongoose.model('Property');
const Class = mongoose.model('Class');
const Link = mongoose.model('Link');

router.param('property', function (req, res, next, id) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.sendStatus(422);
    }
    Property.findById(id).then((property) => {
        if (!property) { return res.sendStatus(404); }
  
        req.property = property;
  
        return next();
    })
 });

 router.post('/', (req, res) => {
    if (!req.body.name || !req.body.type || !req.body.visibility || !req.body.params) {
        res.sendStatus(422);
        return
    }

    if( (req.body.classId && req.body.linkId) || (!req.body.classId && !req.body.linkId) ){
        res.sendStatus(422);
        return;
    }
    
    const ParModel = (req.body.classId)? Class : Link;
    const par_id = (req.body.classId)? req.body.classId : req.body.linkId;

    ParModel.findById(par_id).then((parent) => {
        if (!parent) { res.statusCode(404); }
  
        let prop = new Property();
        prop.name = req.body.name
        prop.type = req.body.type
        prop.visibility = req.body.visibility
        prop.params = req.body.params

        if(req.body.classId) {
            prop.class = parent
        } else {
            prop.link = parent
        }
  
        prop.save().then(() => {
  
            parent.properties.push(prop);
  
            parent.save().then(() => {
                res.status(201).json(prop.toDto());
            });
        }).catch((err) => {
            res.status(401).json({msg: "Unknow error"})
        })
    });
 });

 router.put('/', (req, res) => {
 
    if (req.body.type == undefined || req.body.name == undefined || !req.body.id) {
        res.sendStatus(422);
    }
  
    if (!req.body.id.match(/^[0-9a-fA-F]{24}$/)) {
        res.sendStatus(422);
    }
  
  
    Property.findById(req.body.id).then((prop) => {
        prop.type = req.body.type
        prop.name = req.body.name
        prop.visibility = req.body.visibility
        prop.params = req.body.params
  
        prop.save().then(() => {
            res.status(200).json(prop.toDto());
        })
    })
 })

 router.delete('/:property', (req, res) => {
    let prop = req.property;
  
    prop.remove().then(() => {
        res.sendStatus(200);
    });
 });

module.exports = router