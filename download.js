//const fs = require('fs');
//const request = require('request');
import fs from 'fs';
import https from 'https';

//  https://stackoverflow.com/a/32134846/11878906
export default function(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const req = https.get(url);

    // verify response code
    req.on('response', res => {
      if (res.statusCode !== 200) {
        reject(new Error('Response status was ' + res.statusCode));
        return;
      }
      req.pipe(file);
    });

    // close() is async, call cb after close completes
    file.on('finish', () => {
      file.close(cb);
      resolve();
    });

    // check for request errors
    req.on('error', err => {
      fs.unlink(dest);
      reject(err);
    });

    file.on('error', err => { // Handle errors
      fs.unlink(dest); // Delete the file async. (But we don't check the result)
      reject(err);
    });
  });
}