import AdmZip from 'adm-zip';

export default function(file, dest, overwrite = false) {
  return new Promise((resolve, reject) => {
    try {
      const zip = new AdmZip(file);
      zip.extractAllTo(dest, overwrite);
      resolve();
    }
    catch(err) {
      reject(err);
    }
  });
}