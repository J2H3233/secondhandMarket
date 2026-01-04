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
import { sendChatMessage } from './services/chat.service.js';

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
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// EJS 뷰 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

app.use(expressLayouts);
app.set('layout', 'layout'); 

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

  // 방 입장 이벤트
  socket.on('join_room', (roomName: string) => {
    socket.join(roomName); // 소켓을 특정 방에 조인시킵니다.
    console.log(`User ${socket.id} joined room: ${roomName}`);
    
    // 방에 있는 다른 사람들에게 알림
    socket.to(roomName).emit('receive_message', { 
      user: 'admin', 
      message: `${socket.id}님이 입장하셨습니다.` 
    });
  });

    // 2. 메시지 전송
    socket.on('send_message', async (data) => {
        console.log('메시지 수신:', data);
        
        try {
            const tradeId = Number(data.room);
            const senderId = Number(data.user);
            const content = data.message || null;
            const imageUrl = data.image || undefined;

            console.log('메시지 저장 시도:', { tradeId, senderId, content: content?.substring(0, 50) });

            const savedMessage = await sendChatMessage(
                tradeId,
                senderId,
                content,
                'NORMAL',
                imageUrl
            );

            console.log('메시지 저장 성공:', savedMessage.id);

        
            io.to(data.room).emit('receive_message', {
                ...data,
                messageId: savedMessage.id,
                createdAt: savedMessage.created_at
            });
        } catch (error) {
            console.error('메시지 저장 오류:', error);
            io.to(data.room).emit('receive_message', data);
        }
    });

    // 상태 변경 요청 전송
    socket.on('send_status_request', (data) => {
        console.log('상태 변경 요청 수신 (서버):', data);
        socket.to(data.room).emit('receive_status_request', data);
        console.log('상태 변경 요청 전달 완료:', data.room);
    });

    // 상태 변경 요청 응답
    socket.on('status_request_response', (data) => {
        console.log('상태 변경 응답 수신 (서버):', data);
        socket.to(data.room).emit('status_request_response', data);
    });

  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});


httpServer.listen(PORT, () => {
  console.log(`서버 작동 중 ${PORT}`);
});

