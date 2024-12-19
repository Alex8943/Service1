import express from 'express';
import { testDBConnection } from './db_service/db_connection';
import logger from './other_services/winstonLogger';
import createBackup from './db_service/backup';
import reviewRouter from './routes/reviewRouter';
import cors from 'cors';
const app = express();
app.use(cors());

app.use(express.json()); // for parsing application/json

//testDBConnection();
//createBackup();

app.use(reviewRouter);

process.on('SIGINT', () => {
    logger.end();
    console.log('See ya later silly');
    process.exit(0);
  });

app.listen(3001, () => {
    console.log("Server1 is running on port 3001");
})

