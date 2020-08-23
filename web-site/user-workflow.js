async function getSignatures(apiUrl) {
    if(!apiUrl) {
        throw 'Please provide an API URL';
    }
    const response = await fetch(apiUrl);
    return response.json();
};

function postFormData(url, formData, progress) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        const sendError = (e,label) => {
            console.error(e);
            reject(label);
        };

        request.open('POST',url);
        request.upload.addEventListener('error', e => {
           sendError(e, 'upload error');
        });

        request.upload.addEventListener('timeout', e => {
            sendError(e, 'upload timeout');
        });

        request.upload.addEventListener('progress', progress);

        request.addEventListener('load', () => {
            if(request.status >= 200 && request.status < 400) {
                resolve();
            } else {
                reject(request.responseText);
            }
        });

        request.addEventListener('error', e => sendError(e,'server error'));
        request.addEventListener('abort', e => sendError(e,'server aborted request'));
        request.send(formData);
    });
};

function parseXML(xmlString, textQueryElement) {
    const parser = new DOMParser();
    doc = parser.parseFromString(xmlString, 'applicaion/xml'),
        element = textQueryElement && doc.querySelector(textQueryElement);
    if(!textQueryElement) {
        return doc;
    }
    return element && element.textContent;
};

function uploadBlob(uploadPolicy, fileblob, progress) {
  const formData = new window.FormData();
  Object.keys(uploadPolicy.fields).forEach((key) =>
      formData.append(key, uploadPolicy.fields[key])
    );
  formData.append('file', fileblob);
  return postFormData(uploadPolicy.url, formData, progress)
      .catch( e => {
      if(parseXML(e, 'Code') === 'EntityTooLarge')
    {
        throw `File ${fileblob.name} is too big to upload.`;
    };
    throw 'server error';
});
};

function promiseTimeout(timeout) {
    return new Promise(resolve => {
       setTimeout(resolve, timeout);
    });
}

async function pollForResult(url, timeout, times) {
    if(times <= 0) {
        throw 'no retries left';
    }

    await promiseTimeout(timeout);
    try{
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Range' : 'bytes=0-10'
            }
        });

        if(!response.ok) {
            console.log('file not ready, retrying');
            return pollForResult(url,timeout,times-1);
        }
        return 'OK';
    } catch (e) {
        console.error('network error');
        console.error(e);
        return pollForResult(url,timeout,times-1);
    }
};

function showStep(label) {
    const sections = Array.from(document.querySelector('[step]'));
    sections.forEach(sections => {

        if(section.getAttribute('step') === label) {
            sections.style.display = '';
        } else {
            sections.style.display = 'none';
        }
    });
};

function progressNotifier(progressEvent) {
    const progressElement = document.getElementById('progressbar');
    const total = progressEvent.total;
    const current = progressEvent.loaded;

    if(current &&  total) {
        progressElement.setAttribute('max', total);
        progressElement.setAttribute('value', current);
    }
};

async function startUpload(evt) {
    const picker = evt.target;
    const file = picker.files &&  picker.files[0];
    const apiUrl = document.getElementById('apiUrl').value;

    if(file && file.name) {
        picker.value = '';
        try {
            showStep('uploading');
            const signatures = await getSignatures(apiUrl);
            console.log('got signatures', signatures);
            await uploadBlob(signatures.upload, file, progressNotifier);

            showStep('converting');
            await pollForResult(signatures.upload, 3000,20);
            const downloadLink = document.getElementById('resultLink');
            downloadLink.setAttribute('href', signatures.download);

            showStep('result');
        } catch (e) {
            console.error(e);
            const displayError = e.message || JSON.stringify(e);
            document.getElementById('errortext').innerHTML = displayError;
            showStep('error');
        }
    }
};

function initPage() {
    const picker = document.getElementById('picker');
    showStep('initial');
    picker.addEventListener('change', startUpload);
};

window.addEventListener('DOMContentLoaded', initPage);