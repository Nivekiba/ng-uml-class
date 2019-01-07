var User = require('../models/user');
const router = require("express").Router();
const jwt = require("jsonwebtoken")

router.post('/signup', function(req, res) {
    console.log(req.body)
    if (!req.body.username || !req.body.password || !req.body.name || !req.body.sexe) {
      res.json({success: false, msg: 'Please fill all the blanks'});
    } else {
      var newUser = new User({
        username: req.body.username,
        password: req.body.password,
        name: req.body.name,
        sexe: req.body.sexe
      });
      // save the user
      newUser.save(function(err) {
        if (err) {
          return res.json({success: false, msg: 'Username already exists.'});
        }
        res.json({success: true, msg: 'Successful created new user.'});
      });
    }
  });

router.post('/signin', function(req, res) {
    User.findOne({
      username: req.body.username
    }, function(err, user) {
      if (err) throw err;
  
      if (!user) {
        res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
      } else {
        // check if password matches
        user.comparePassword(req.body.password, function (err, isMatch) {
          if (isMatch && !err) {
            // if user is found and password is right create a token
            var token = jwt.sign({id: user._id}, "my_secret");
            // return the information including token as JSON
            res.json({success: true, token: 'JWT ' + token});
          } else {
            res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
          }
        });
      }
    });
  });


module.exports = router;