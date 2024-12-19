import { spawn } from 'child_process';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import cron from 'node-cron';

dotenv.config();


// Function to create a backup
const createBackup = () => {
    const backupDir = './backups';
    const dumpFileName = path.join(backupDir, `${Math.round(Date.now() / 1000)}.dump.sql`);
    const writeStream = fs.createWriteStream(dumpFileName);

    const dump = spawn('mysqldump', [
        '-h', process.env.dev_host || '',
        '-u', process.env.dev_user || '',
        `-p${process.env.dev_password || ''}`,
        process.env.dev_database || ''
    ]);

    dump.stdout.pipe(writeStream);

    dump.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
    });

    dump.on('close', (code) => {
        if (code === 0) {
            console.log(`Backup successful: ${dumpFileName}`);
        } else {
            console.log(`Backup failed with exit code ${code}`);
        }
    });
};
// Schedule a cron job to run the backup at a specific interval
// change the interval to be every minute
cron.schedule('* * * * *', () => {
    console.log('Starting scheduled backup...');
    createBackup();
});

console.log('Cron job scheduled for database backup.');

export default createBackup;
