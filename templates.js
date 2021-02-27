/**
 * We use a json file to store a dictionary of the names of our templates and their corresponding url.
 * The json file should be external to this project as we don't want to create a new version of our package each time we add a new template. 
 * We will fetch the json file, get the url corresponding to the passed in template name and return it. The advantage is that we can host the file on GitHub.
 * Alternatively, We can make an api request that will do all this and return the appropriate url. The disadvantage is that we have to host a backend to handle the api requests.
 */

import https from 'https';
import fetch from 'net';
import { resolve } from 'path';

/**
 * 
 * @param {String} url the url to fetch
 */
const getUrl = url => {
  return new Promise((resolve, reject) => {
    const req = https.get(url);

    // verify response code
    req.on('response', res => {
      if (res.statusCode !== 200) {
        reject('Response status was ' + res.statusCode);
        return;
      }
      const data = [];
      req.on('data', (chunk) => {
        data.push(chunk);
      }).on('end', () => {
        resolve(Buffer.concat(data).toString());
      });
    });

    // check for request errors
    req.on('error', err => {
      fs.unlink(dest);
      reject(err);
    });
  });
}

//  We are not using this
const getLocal = name => {
  return new Promise((resolve, reject) => {
    try{
      const fs = require('fs');
      const text = fs.readFileSync('templates.json', 'utf8');
      const json = JSON.parse(text);
      resolve(json[name] || json.default);
    }
    catch(err) {
      reject(err);
    }
  })
}

const getExternal = name => {
  return new Promise((resolve, reject) => {
    const url = ''; //where our 
    getUrl(url).then(content => {
      //if(this were an api call, content is already the template url so)
      // resolve(content);
      //else
      try{
        const json = JSON.parse(content);
        resolve(json[name] || json.default);
      }
      catch(err) {
        reject(err);
      }
    }).catch(err => {
      reject(err);
    })
  });
}

export default function(name) {
  return getLocal(name);
  //return getExternal(name);
}