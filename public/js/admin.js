document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const photoInput = document.getElementById('photo-input');
    const preview = document.getElementById('preview');
    const uploadForm = document.getElementById('upload-form');
    const passwordInput = document.getElementById('password');
    const uploadStatus = document.getElementById('upload-status');
    let filesToUpload = [];

    dropZone.addEventListener('click', () => photoInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    photoInput.addEventListener('change', () => {
        const files = photoInput.files;
        handleFiles(files);
    });

    function handleFiles(files) {
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                filesToUpload.push(file);
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'preview-item';
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    imgContainer.appendChild(img);
                    preview.appendChild(imgContainer);
                };
                reader.readAsDataURL(file);
            }
        }
    }

    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = passwordInput.value;
        if (!password) {
            alert('Password is required.');
            return;
        }

        if (filesToUpload.length === 0) {
            alert('Please select photos to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('password', password);
        filesToUpload.forEach(file => {
            formData.append('photos', file);
        });

        uploadStatus.textContent = 'Uploading...';

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                uploadStatus.textContent = 'Upload successful! Redirecting...';
                preview.innerHTML = '';
                filesToUpload = [];
                passwordInput.value = '';
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                uploadStatus.textContent = `Upload failed: ${data.message}`;
            }
        })
        .catch(err => {
            uploadStatus.textContent = `Upload error: ${err.message}`;
        });
    });
});
