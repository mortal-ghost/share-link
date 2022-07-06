const dropZone = document.querySelector('.drop-zone');
const fileInput = document.querySelector('#file-input');
const browseBtn = document.querySelector('#browse-btn');
const toast = document.querySelector('.toast');
const progressContainer = document.querySelector('.progress-container');
const progressPercent = document.querySelector('#progress-percent');
const progressBar = document.querySelector('.progress-bar');
const bgProgress = document.querySelector('.bg-progress');
const fileURL = document.querySelector('#file-url');
const statusText = document.querySelector('.status');
const copyURLBtn = document.querySelector('#copy-btn');
const emailForm = document.querySelector('#email-form');
const sharingContainer = document.querySelector('.sharing-container');
const fileForm = document.querySelector('#file-form');

const maxAllowedSize = 1024 * 1024 * 100; // 100MB

const uploadURL = `${baseURL}/api/files/`;
const emailURL = `${baseURL}/api/files/send/`;

browseBtn.addEventListener('click', () => {
    fileInput.click();
});

dropZone.addEventListener('drag', (e) => {
    e.preventDefault();

    const files = e.dataTransfer.files;

    console.log(files[0].name);

    if (files.length == 1) {
        if (files[0].size < maxAllowedSize) {
            fileInput.files = files;
            uploadFile();
        } else {
            showToast('File size is too big');
        }
    } else if (files.length > 1) {
        showToast('Only one file can be uploaded at a time');
    } 
    dropZone.classList.remove("dragged");
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add("dragged");
});

dropZone.addEventListener('dragleave', (e) => {
    dropZone.classList.remove("dragged");
});

fileInput.addEventListener('change', () => {
    if (fileInput.files[0].size > maxAllowedSize) {
        fileInput.value = "";
        return showToast('File size is too big');
    } 
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    uploadFile(formData);
});

fileInput.addEventListener('click', () => {
    fileURL.select();
});

copyURLBtn.addEventListener('click', () => {
    fileURL.select();
    navigator.clipboard.writeText(fileURL.value);
    showToast('URL copied to clipboard');
});

function uploadFile(formData) {
    progressContainer.style.display = "block";

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
        let percent = Math.round((e.loaded / e.total) * 100);
        let scaleX = `scaleX(${percent / 100})`;
        progressPercent.innerText = percent;
        progressBar.style.transform = scaleX;
        bgProgress.style.transform = scaleX;
    }

    xhr.onerror = () => {
        showToast(`Error uploading file ${xhr.status}`);
        fileInput.value = "";
    }

    xhr.onreadystatechange = () => {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            if (xhr.status == 200) {
                showToast('File uploaded successfully');
                onFileUploaded(xhr.responseText);
            } else {
                showToast(`Error uploading file ${xhr.status}`);
                progressContainer.style.display = "none";
                fileInput.value = "";
            }
        }
    }

    xhr.open('POST', uploadURL, true);
    xhr.send(formData);
}

function onFileUploaded(file) {
    fileInput.value = "";
    statusText.innerText = "Uploaded";

    emailForm[2].removeAttribute("disabled");
    emailForm[2].innerText = "Send";

    progressContainer.style.display = "none";

    const { file: url } = JSON.parse(file);
    console.log(url);
    sharingContainer.style.display = "block";
    fileURL.value = url;
}

emailForm.addEventListener('submit', (e) => {
    e.preventDefault();

    emailForm[2].setAttribute("disabled", "true");
    emailForm[2].innerText = "Sending...";

    const url = fileURL.value;

    const formData = {
        uuid: url.split('/').splice(-1, 1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value,
    };

    fetch(emailURL, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
            'Content-Type': 'application/json',
        }
    }).then((res) => {
        res.json();
    }).then((data) => {
        if (data.success) {
            showToast('Email sent successfully');
            sharingContainer.style.display = "none";
        } else {
            showToast(data.message);
            emailForm[2].removeAttribute("disabled");
            emailForm[2].innerText = "Send";
        }
    });
});

let toastTimeout;
function showToast(message) {
    clearTimeout(toastTimeout);
    toast.innerText = message;
    toast.classList.add("show");
    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}