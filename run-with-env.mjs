
import { config } from 'dotenv';
import { exec } from 'child_process';

config();

const child = exec('node fix-settings.mjs', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});
