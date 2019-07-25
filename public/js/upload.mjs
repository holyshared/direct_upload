/**
 *
 */

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
};

const withHeaders = (payload) => [options, { body: JSON.stringify(payload) }].reduce((acc, values) => Object.assign(acc, values), {});


const timeoutAfter = (seconds) => (controller) => setTimeout(() => {
  controller.abort();
}, seconds * 1000);

const timeout = timeoutAfter(60);



function presignedURLForRandomKey(payload) {
  const abortController = new AbortController();
  const req = Object.assign(payload || {}, { signal: abortController.signal });

  timeout(abortController);

  return fetch('/upload', withHeaders(req)).then((response) => {
    return response.json();
  });
}


function presignedURLForSameKey(payload) {
  const abortController = new AbortController();
  const req = Object.assign(payload || {}, { signal: abortController.signal });

  timeout(abortController);

  return fetch('/upload_same_key', withHeaders(req)).then((response) => {
    return response.json();
  });
}





function uploadFile(payload, file) {
  const abortController = new AbortController();

  const url = payload.url;
  const fields = Object.assign({}, payload.fields);
  const variables = Object.assign(fields, { file: file });
  delete variables.url;

  timeout(abortController);

  const formData = Object.keys(variables).reduce((fd, key) => {
    fd.append(key, variables[key]);
    return fd;
  }, new FormData());

  const req = {
    method: 'POST',
    body: formData,
    signal: abortController.signal
  };

  return fetch(url, req);
}


function uploadFileForPut(payload, file) {
  const abortController = new AbortController();
  const url = payload.url;

  timeout(abortController);

  const req = {
    method: 'PUT',
    body: file,
    signal: abortController.signal,
    headers: {
      'Content-Type': file.type
    }
  };
  return fetch(url, req);
}


function mountForRandomKeyFileUpload() {
  const message = document.getElementById('message');
  const file = document.getElementById('file');

  file.addEventListener('change', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    message.innerText = 'Preparing to upload';

    presignedURLForRandomKey().then((json) => {
      message.innerText = 'Uploading';
      return uploadFile(json, file.files[0]);
    }).then(() => {
      message.innerText = 'Uploaded';
    }).catch((err) => {
      console.log('fetch error');
      console.log(err.message);
    });
  });
}



function mountForSameKeyFileUpload() {
  const sameMessage = document.getElementById('same_message');
  const sameFile = document.getElementById('same_file');

  sameFile.addEventListener('change', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    sameMessage.innerText = 'Preparing to upload';

    presignedURLForSameKey().then((json) => {
      sameMessage.innerText = 'Uploading';
      return uploadFileForPut(json, sameFile.files[0]);
    }).then(() => {
      sameMessage.innerText = 'Uploaded';
    }).catch((err) => {
      console.log('fetch error');
      console.log(err.message);
    });
  });
}



export function domContentLoaded() {
  mountForRandomKeyFileUpload();
  mountForSameKeyFileUpload();
};
