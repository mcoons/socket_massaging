var express = require('express');
var bodyParser = require("body-parser");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var dburl = "mongodb://messageuser:m3ssag3us3r@ds129393.mlab.com:29393/messages"
var localport = 3001;

var Message = mongoose.model("Message", {
    name: String,
    message: String

})


app.get("/messages", (req,res) => {
    Message.find({}, (err, messages) => {
        res.send(messages);
    })
})

// need to use body parser to decode JSON and url encoded body from browser
app.post("/messages", (req,res) => {
    var message = new Message(req.body);

    message.save((err) => {
        if (err)
            sendStatus(500);

        io.emit('message', req.body)
        res.sendStatus(200);
    })
})

io.on('connection', (socket) => {
    console.log("user has connected");
})

mongoose.connect(dburl, { useNewUrlParser: true }, (err) => {
    console.log('mongo db connection', err)
})

var server = http.listen(localport, () => {
    console.log("Server is listening on port", server.address().port);
});