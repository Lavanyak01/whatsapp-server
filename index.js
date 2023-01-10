const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const {notFound} = require('./middleware/errorMiddleware');
const cors = require('cors');
const app = express();

dotenv.config();
app.use(express.json());

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log('Connected to MongoDB'))
.catch((err)=> console.log(err));

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

app.use(notFound);

const PORT = process.env.PORT;

const server = app.listen(PORT, ()=>{
    console.log(`Server started on Port ${PORT}`)
});

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: 'https://whatsapp-8q1e.onrender.com',
        credentials: true,
    },
});

io.on("connection", (socket)=> {
    console.log('connected to socket.io');

    socket.on('setup', (userData) => {
        socket.join(userData._id);
        socket.emit('connected');
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room:"+ room);
    });

    socket.on('new message', (newMessageReceived) => {
        var chat = newMessageReceived.chat;

        if(!chat.users) return console.log('chat.users not defined');

        chat.users.forEach(user => {
            if(user._id === newMessageReceived.sender._id) return;

            socket.in(user._id).emit("message received", newMessageReceived);
        });
    });

    socket.off("setup", ()=> {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
});
