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

function fetchUploadURL(payload) {
  const req = Object.assign(withHeaders(payload.variables), payload.options);
  return fetch('/upload', req).then((response) => {
    return response.json();
  });
}

function fetchUploadTo(url, payload) {
  const formData = Object.keys(payload.variables).reduce((fd, key) => {
    fd.append(key, payload.variables[key]);
    return fd;
  }, new FormData());

  const req = Object.assign({
    method: 'POST',
    body: formData
  }, payload.options);

  return fetch(url, req);
}

const timeoutAfter = (seconds) => (controller) => setTimeout(() => {
  controller.abort();
}, seconds * 1000);

const timeout = timeoutAfter(60);

function tryFetchUploadURL(payload) {
  const abortController = new AbortController();
  const req = Object.assign({ variables: payload || {} }, { options: { signal: abortController.signal } });

  timeout(abortController);

  return fetchUploadURL(req);
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

export function domContentLoaded() {
  const message = document.getElementById('message');

  const file = document.getElementById('file');
  file.addEventListener('change', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    message.innerText = 'Preparing to upload';

    tryFetchUploadURL().then((json) => {
      message.innerText = 'Uploading';
      return tryFetchUpload(json, file.files[0]);
    }).then(() => {
      message.innerText = 'Uploaded';
    }).catch((err) => {
      console.log('fetch error');
      console.log(err.message);
    });
  });
};
