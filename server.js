var express = require('express');
var cors = require("cors");
var bodyParser = require("body-parser");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

// app.use(cors);

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


var localport = 3001;

const mongoUser = process.env.xMONGOUSER || "messageuser";
const mongoPwd = process.env.xMONGOPWD || "m3ssag3us3r";
const dbURL = process.env.DBURL || "ds129393.mlab.com:29393/messages";

console.log("user",mongoUser);
console.log("pwd", mongoPwd);
console.log("url",dbURL);

const dburl = `mongodb://${mongoUser}:${mongoPwd}@${dbURL}`

const port = process.env.PORT || localport;


var Message = mongoose.model("Message", {
    name: String,
    message: String
})

app.get("/messages", (req,res) => {
    Message.find({}, (err, messages) => {
        if (err) {console.log("get error", err);
        sendStatus(500);
    }
        res.send(messages);
    })
})

// need to use body parser to decode JSON and url encoded body from browser
app.post("/messages", (req,res) => {
    var message = new Message(req.body);

    message.save((err) => {
        if (err){
            console.log('post error',err)
            sendStatus(500);
        }
        io.emit('message', req.body)
        res.sendStatus(200);
    })
})

io.on('connection', (socket) => {
    console.log("user has connected");
})

mongoose.connect(dburl, 
                { useNewUrlParser: true }, 
                (err) => { console.log('mongo db connection made with error:', err)}
)

var server = http.listen(port, () => {
    console.log("Server is listening on port", port);
});