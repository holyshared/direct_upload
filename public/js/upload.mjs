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

  console.log('fetchUploadTo---------');

  return fetch(url, req);
}

const timeoutAfter = (seconds) => (controller) => setTimeout(() => {
  controller.abort();
}, seconds * 1000);

const timeout = timeoutAfter(20);

function tryFetchUploadURL(payload) {
  const abortController = new AbortController();
  const req = Object.assign({ variables: payload || {} }, { options: { signal: abortController.signal } });

  timeout(abortController);

  return fetchUploadURL(req);
}

function tryFetchUpload(payload, file) {
  const abortController = new AbortController();

  const url = payload.url;
  const variables = Object.assign({ file: file }, payload);
  delete variables.url;

  const req = Object.assign({ variables: variables }, { options: { signal: abortController.signal } });

  timeout(abortController);

  return fetchUploadTo(url, req);
}

export function domContentLoaded() {
  const file = document.getElementById('file');
  file.addEventListener('change', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    tryFetchUploadURL().then((json) => {
      return tryFetchUpload(json, file.files[0]);
    }).catch((err) => {
      console.log('fetch error');
      console.log(err);
    });
  });
};
