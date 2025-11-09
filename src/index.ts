import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import apiRouter from './routers/apiRouters/index.js';
import ssrRouter from './routers/ssrRouters/index.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerOptions from './config/swagger.config.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3000;

// Swagger 설정
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

app.listen(PORT, () => {
  console.log(`서버 작동 중 ${PORT}`);
});
