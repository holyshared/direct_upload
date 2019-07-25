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



function fetchUploadTo(url, payload) {
  const formData = Object.keys(payload.variables).reduce((fd, key) => {
    fd.append(key, payload.variables[key]);
    return fd;
  }, new FormData());

  const req = Object.assign({
    method: 'PUT',
    body: formData
  }, payload.options);

  return fetch(url, req);
}

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





function tryFetchUpload(payload, file) {
  const abortController = new AbortController();

  const url = payload.url;
  const fields = Object.assign({}, payload.fields);
  const variables = Object.assign(fields, { file: file });
  delete variables.url;

  const req = Object.assign({ variables: variables }, { options: { signal: abortController.signal } });

  timeout(abortController);

  return fetchUploadTo(url, req);
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
      return tryFetchUpload(json, file.files[0]);
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
      return tryFetchUpload(json, file.files[0]);
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
