const copyBtn = document.querySelector('#copy-btn');
const fileUrl = document.querySelector('#file-url');

copyBtn.addEventListener('click', () => {
    const text = fileUrl.value;
    navigator.clipboard.writeText(text);

    showStatus('Copied to clipboard');
});

function showStatus(message) {
    const status = document.querySelector('#copy-status');
    status.innerHTML = message;
    setTimeout(() => {
        status.textContent = '';
    }, 3000);
}

