const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Session setup
const session = require('express-session')({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
});
app.use(session);

const sharedsession = require("express-socket.io-session");
io.use(sharedsession(session, {autoSave:true}));
//

// Init static files
app.use('/public', express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

// Middleware for POST data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Service init
const RoomService = require('./services/RoomService');
const roomService = new RoomService();

//
// Routing
//

//
// Http
//
app.get('/', (req, res) => {
    res.render('menu_page');
});

app.post('/chat_create', (req, res) => {
    req.session.user_name = req.body.user_name;
    req.session.user_color = req.body.color;
    req.session.chat_name = req.body.chat_name;

    roomService.create_room(req.body.chat_name, req.body.user_name).then(() => {
        res.redirect('/chat/' + req.body.chat_name);
    }).catch(err => {
        if (err.code === 'SQLITE_CONSTRAINT'){
            res.status(400).send('400 trying to save/create room with existing name');
        }
        else{
            // SLITE_ERROR
            res.status(500).send('500 internal server error while working with db');
        }
    });

});

app.post('/chat_join', (req, res) => {
    req.session.user_name = req.body.user_name;
    req.session.user_color = req.body.color;
    req.session.chat_name = req.body.chat_name;

    roomService.join_room(req.body.chat_name, req.body.user_name).then(() => {
        res.redirect('/chat/' + req.body.chat_name);
    }).catch(err => {
        console.log(err);
    });
});

app.get('/chat/:chat_name', (req, res) => {
    // If post data has been sent (and saved)
    if (req.session.user_color !== undefined){
        let context = {
            user_name: req.session.user_name,
            user_color: req.session.user_color,
            chat_name: req.session.chat_name
        };
        res.render('chat', context);
    }
    else{
        res.send('404 have to create chat through form.');
    }
});
//

//
// Ajax
//
app.post('/check_room_avail', (req, res) => {
    roomService.check_room_avail(req.body.chat_name, req.body.user_name).then((avail_val) => {
        res.json({avail: avail_val});
    });
});
//

//
// Sockets
//
io.on('connection', socket => {
    socket.on("joinRoom", (callback) => {
        log_msg = 'Joining room: ' + socket.handshake.session.chat_name; 

        socket.join(socket.handshake.session.chat_name);
        callback();

        socket.to(socket.handshake.session.chat_name).emit('roomJoined', socket.handshake.session.user_name);
    });

    socket.on('message', (data) => {
        socket.in(socket.handshake.session.chat_name).emit('message', data);
    })

    socket.on('disconnect', () => {
        socket.in(socket.handshake.session.chat_name).emit('logoff', socket.handshake.session.user_name);

        roomService.update_on_disconnect(socket.handshake.session.chat_name, socket.handshake.session.user_name);
    });
});
//

const port = process.env.PORT || 3000
server.listen(port, () => {
    console.log('listening on *:3000');
});