import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import apiRouter from './routers/apiRouters/index.js';
import ssrRouter from './routers/ssrRouters/index.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerOptions from './config/swagger.config.js';
import session from 'express-session';
import { errorHandler } from './middlewares/errorHandler.js';
import { responseHandler } from './middlewares/responseHandler.js';
import expressLayouts from 'express-ejs-layouts';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();

app.use(cors());
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET || 'no_key', 
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 1000 * 60 * 60 * 24 
    }
}));
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // 실제 배포 시에는 프론트엔드 도메인으로 제한해야 합니다.
    methods: ["GET", "POST"]
  }
});

// EJS 뷰 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

// EJS 레이아웃 설정
app.use(expressLayouts);
app.set('layout', 'layout'); // layout.ejs 파일을 기본 레이아웃으로 설정

// 정적 파일 제공 설정
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')) as any);
app.use(express.static(path.join(process.cwd(), 'public')) as any);

app.use(responseHandler as any);

const PORT = process.env.PORT || 3000;

const swagger = swaggerJsdoc(swaggerOptions);

app.use(
    '/api-docs', 
    swaggerUi.serve, 
    swaggerUi.setup(swagger, { explorer: true }) 
);

//라우터 설정
// API 라우터
app.use('/api', apiRouter);

// SSR 라우터
app.use('/', ssrRouter);

app.use(errorHandler as any);

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // 1. 방 입장 이벤트 ('join_room')
  socket.on('join_room', (roomName: string) => {
    socket.join(roomName); // 소켓을 특정 방에 조인시킵니다.
    console.log(`User ${socket.id} joined room: ${roomName}`);
    
    // (선택사항) 방에 있는 다른 사람들에게 알림
    socket.to(roomName).emit('receive_message', { 
      user: 'admin', 
      message: `${socket.id}님이 입장하셨습니다.` 
    });
  });

    // 1. 상태 변경 요청 수신
    socket.on('request_status_change', (data) => {
        // data: { room, user, userName, status, timestamp }
        // 같은 방의 다른 사용자에게 전송
        socket.to(data.room).emit('receive_status_change_request', data);
    });

    // 2. 상태 변경 응답 수신
    socket.on('respond_status_change', (data) => {
        // data: { room, requestId, accepted, status, user }
        // 요청자에게 응답 전송
        socket.to(data.room).emit('status_change_response', data);
    });

    // 3. 메시지 전송 시 userName 포함
    socket.on('send_message', (data) => {
        // data: { room, user, userName, message, image }
        io.to(data.room).emit('receive_message', data);
    });

  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});


httpServer.listen(PORT, () => {
  console.log(`서버 작동 중 ${PORT}`);
});
