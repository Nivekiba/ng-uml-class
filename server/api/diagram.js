const router = require('express').Router();
const passport = require("passport")
const mongoose = require('mongoose');
 
const Diagram = mongoose.model('Diagram');
const Class = mongoose.model('Class');

var getToken = function (headers) {
    if (headers && headers.authorization) {
      var parted = headers.authorization.split(' ');
      if (parted.length === 2) {
        return parted[1];
      } else {
        return null;
      }
    } else {
      return null;
    }
  };

router.param('diagram', function (req, res, next, id) {
 
   if (!id.match(/^[0-9a-fA-F]{24}$/)) {
       return res.sendStatus(422);
   }
 
   Diagram.findById(id)
        .populate({
            path: 'classes',
            populate: {
                path: "properties"
            }
        })
        .populate({
            path: 'links',
            populate: {
                path: "properties"
            }
        })
        .populate({
            path: 'links',
            populate: {
                path: 'class1',
                populate: {
                    path: "properties"
                }
            }
        })
        .populate({
            path: 'links',
            populate: {
                path: 'class2',
                populate: {
                    path: "properties"
                }
            }
        })
       .then(function (diagram) {
           if (!diagram) { return res.sendStatus(404); }
 
           req.diagram = diagram;
 
           return next();
       });
});

router.get('/', passport.authenticate("jwt", { session: false }) ,(req, res) => {
    var token = getToken(req.headers)
    if(!token)
        return res.status(403).send({success: false, msg: 'Unauthorized.'});

    Diagram.find({user: req.user._id})
        .populate({
            path: 'classes',
            populate: {
                path: "properties"
            }
        })
        .populate({
            path: 'links',
            populate: {
                path: "properties"
            }
        })
        .populate({
            path: 'links',
            populate: {
                path: 'class1',
                populate: {
                    path: "properties"
                }
            }
        })
        .populate({
            path: 'links',
            populate: {
                path: 'class2',
                populate: {
                    path: "properties"
                }
            }
        })
        .then((diagrams) => {
            if (!diagrams) { return res.sendStatus(404); }
  
            return res.status(200).json({
                diagrams: diagrams.map((dia) => {
                    return dia.toDto();
                })
            });
        });
 });

 router.post('/', passport.authenticate("jwt", { session: false }) ,(req, res) => {
    var token = getToken(req.headers)
    if(!token)
        return res.status(403).send({success: false, msg: 'Unauthorized.'});
    
    if (!req.body.title) {
        res.sendStatus(422);
    }
  
    let diagram = new Diagram();
    diagram.title = req.body.title;
    diagram.user = req.user
  
    diagram.save().then(() => {
        res.json(diagram.toDto()).statusCode(201);
    })
  
 });

 router.put('/', (req, res) => {
    var token = getToken(req.headers)
    if(!token)
        return res.status(403).send({success: false, msg: 'Unauthorized.'});

    if (!req.body.id) {
        res.sendStatus(422);
    }
    Diagram.findById(req.body.id).then((diag) => {
        diag.title = req.body.title;
  
        diag.save().then(() => {
            res.status(200).json(diag.toDto());
        })
    })
 });

 router.delete('/:diagram', (req, res) => {
    var token = getToken(req.headers)
    if(!token)
        return res.status(403).send({success: false, msg: 'Unauthorized.'});
    
    req.diagram.remove().then(function () {
        return res.sendStatus(200);
    });
 });

module.exports = router;