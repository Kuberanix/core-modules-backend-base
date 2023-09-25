import './config/envresolver.js';
import express from 'express';
import cors from 'cors';
import userroutes from '#userroutes';
const server = express();
server.use(cors());
server.use(express.json());
const PORT = 5000 || process.env.PORT;

server.use('/api/users', userroutes);
server.listen(PORT, () => console.log('Listening to port: ', PORT));
