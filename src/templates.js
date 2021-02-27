import https from 'https';
import download from 'download';

/**
 * Downloads a json file from github. Parses the json and return the template url corresponding to @param name. If key is not found in object, the default template is returned.
 * The advantage is we don't have to host and maintain a separate backend. The downside is extra bytes being fetched
 * @param {String} name template name
 */
const getFromRepo = name => {
  return new Promise((resolve, reject) => {
    try {
      // We keep this file in a separate repo. This may be necessary if we use github action to publish the current project.
      const url = 'https://raw.githubusercontent.com/chasscepts/templates/master/templates.json';
      download(url)
        .then(buffer => {
          // We know this will work because we created the file. If file is corrupted and it throws we catch and reject.
          const templates = JSON.parse(buffer.toString('utf8'));
          // templates is a key - value pair of template name and it's repo url
          // if there is no template with key name, we return the default template. templates.default must not be empty.
          const template = templates[name] || templates.default;
          resolve(template);
        })
        .catch(err => reject(err));
    }
    catch(err) {
      reject(err);
    }
  });
}

/**
 * Sends an api request to retrieve the template url corresponding to @param name. The upside is we can change the we store our templates and it also saves few bytes. The downside is we have to host the backend. If our app has a home page (not on github) we should consider this approach.
 * @param {String} name template name
 */
const getFromApi = name => {
  return new Promise((resolve, reject) => {
    const url = `${/* our endpoint */''}/${name}`;
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
        // Implementation assumes that backend will resolve template from the name passed and return the url of the template repo.
        const template = Buffer.concat(data).toString();
        resolve(template);
      });
    });

    // check for request errors
    req.on('error', err => {
      reject(err);
    });
  });
}

export default function(name) {
  //return getFromApi(name);
  return getFromRepo(name);
}