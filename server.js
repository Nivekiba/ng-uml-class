// Importing dependencies

import express from "express";
import path from "path";
import http from "http";
import bodyParser from "body-parser"
import mongoose, { mongo } from "mongoose"

mongoose.connect("mongodb://localhost/test_db", {useNewUrlParser: true});
mongoose.set("debug", true)
mongoose.set('useCreateIndex', true);

require("./server/models/task")
require("./server/models/todo")

require("./server/models/property")
require("./server/models/class")
require("./server/models/link")
require("./server/models/diagram")
require("./server/models/user")



const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}));
const api = require('./server/api/')
app.use('/api', api)

//Enable CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

const port = process.env.PORT || 3030;
app.set('port', port)

const server = http.createServer(app)

server.listen(port, () => console.log(`API listening at port: ${port}`))