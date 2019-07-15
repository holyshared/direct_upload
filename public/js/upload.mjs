/**
 *
 */

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
};

const withOptions = (payload) => [options, { body: JSON.stringify(payload) }].reduce((acc, values) => Object.assign(acc, values), {});

function fetchUploadURL(payload) {
  return fetch('/upload', withOptions(payload)).then((response) => {
    return response.json();
  });
}

export function domContentLoaded() {
  const file = document.getElementById('file');
  file.addEventListener('change', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    fetchUploadURL().then((json) => {
      console.log(json);
    });
  });
};
