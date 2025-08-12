import { Server } from "socket.io";


const io = new Server(8000, {
    cors: {
        origin: "*"
    }
});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();



io.on('connection', socket => {
    console.log(`user connected ${socket.id}`);

    socket.on('join-room', (data) => {
        const { email, room } = data;
        emailToSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);
        socket.join(room);
        io.to(room).emit('user:joined', { email, id: socket.id });
        io.to(socket.id).emit('join-room', data);
    });


    socket.on('offer-created', ({ offer, to }) => {
        // console.log("We get offer for First time from User A to Signalling Server", offer, 'AND', to);

        io.to(to).emit('offer-received', { offer, from: socket.id });
    });

    socket.on('answer-created', ({ answer, to }) => {
        // console.log("We get answer from User B to Signalling Server", answer, 'AND', to);

        io.to(to).emit('answer-received', { answer, from: socket.id });
    });
});


