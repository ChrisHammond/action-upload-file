const FormData = require('form-data');
const core = require('@actions/core');
const fs = require('fs');

const hostval = core.getInput('host');
const protocolval = core.getInput('https') === 'true' ? 'https:' : 'http:';
const pathval = core.getInput('path');
const filePathval = core.getInput('filePath');
const dataval = core.getInput('data');
const headersval = core.getInput('headers').split(':');


console.info('endpoint', hostval + pathval);
console.info('headers', headersval);

try {
  fs.existsSync(filePathval);
  console.info('File found', filePathval);
  
} catch (e) {
  return core.setFailed('ERROR: file not found: ' + filePathval);
}

const form = new FormData();
form.append('file', fs.createReadStream(filePathval));
form.append('data', dataval);

form.getLength(function (err, l) {
  console.info('Sending file, size:', l + 'b');
});

form.submit({
  host: hostval, 
  protocol: protocolval,
  path: pathval,
  headers: headersval}, function (err, res) {
  if (err) {
    console.error(err);
    return core.setFailed('Request failed');
  }

  console.info('Response', res.statusCode, res.statusMessage);

  if (res.statusCode >= 400 && res.statusCode < 600) {
    core.setFailed('Request failed');
  }
});
