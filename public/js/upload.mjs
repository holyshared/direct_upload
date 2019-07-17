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

const timeoutAfter = (seconds) => (controller) => setTimeout(() => {
  console.log('abort---');
  controller.abort();
}, seconds * 1000);

const timeout = timeoutAfter(1);

function tryFetchUploadURL(payload) {
  const abortController = new AbortController();
  const req = Object.assign({ variables: payload || {} }, { options: { signal: abortController.signal } });

  timeout(abortController);

  return fetchUploadURL(req);
}

export function domContentLoaded() {
  const file = document.getElementById('file');
  file.addEventListener('change', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    tryFetchUploadURL().then((json) => {
      console.log(json);
    }).catch((err) => {
      console.log('fetch error');
      console.log(err);
    });
  });
};
