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

    // 2. 메시지 전송 (DB에 저장 후 브로드캐스트)
    socket.on('send_message', async (data) => {
        // data: { room, user, userName, message, image }
        console.log('메시지 수신:', data);
        
        try {
            const tradeId = Number(data.room);
            const senderId = Number(data.user);
            const content = data.message || null;
            const imageUrl = data.image || undefined;

            console.log('메시지 저장 시도:', { tradeId, senderId, content: content?.substring(0, 50) });

            // DB에 메시지 저장
            const savedMessage = await sendChatMessage(
                tradeId,
                senderId,
                content,
                'NORMAL',
                imageUrl
            );

            console.log('메시지 저장 성공:', savedMessage.id);

            // 저장된 메시지 ID와 함께 브로드캐스트
            io.to(data.room).emit('receive_message', {
                ...data,
                messageId: savedMessage.id,
                createdAt: savedMessage.created_at
            });
        } catch (error) {
            console.error('메시지 저장 오류:', error);
            // 저장 실패해도 일단 브로드캐스트 (UX 유지)
            io.to(data.room).emit('receive_message', data);
        }
    });

    // 3. 상태 변경 요청 전송 (통합)
    socket.on('send_status_request', (data) => {
        // data: { room, user, userName, messageId, requestedStatus, currentStatus, regionName, addressDetail, amount }
        console.log('상태 변경 요청 수신 (서버):', data);
        socket.to(data.room).emit('receive_status_request', data);
        console.log('상태 변경 요청 전달 완료:', data.room);
    });

    // 4. 상태 변경 요청 응답 (통합)
    socket.on('status_request_response', (data) => {
        // data: { room, messageId, approved, newStatus }
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
