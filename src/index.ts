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

// EJS 뷰 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

// 정적 파일 제공 설정
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

app.listen(PORT, () => {
  console.log(`서버 작동 중 ${PORT}`);
});
