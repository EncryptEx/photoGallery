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
                    uploadStatus.textContent = 'Upload successful! Reloading...';
                    preview.innerHTML = '';
                    filesToUpload = [];
                    passwordInput.value = '';
                    setTimeout(() => {
                        location.reload();
                    }, 2000);
                } else {
                    uploadStatus.textContent = `Upload failed: ${data.message}`;
                }
            })
            .catch(err => {
                uploadStatus.textContent = `Upload error: ${err.message}`;
            });
    });

    async function loadImagesForManagement() {
        const response = await fetch('/images');
        const images = await response.json();
        const grid = document.getElementById('image-management-grid');
        grid.innerHTML = '';
        for (const image of images) {
            const item = document.createElement('div');
            item.className = 'image-item';
            item.innerHTML = `
                <img src="/uploads/${image.filename}" alt="${image.filename}" loading="lazy">
                <div class="image-overlay">
                    <button class="delete-btn" data-filename="${image.filename}">Delete</button>
                </div>
            `;
            grid.appendChild(item);
        }
    }

    document.getElementById('image-management-grid').addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const filename = e.target.dataset.filename;
            const password = passwordInput.value;
            if (!password) {
                alert('Please enter the password to delete images.');
                return;
            }

            if (confirm(`Are you sure you want to delete ${filename}?`)) {
                const response = await fetch(`/images/${filename}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ password })
                });
                const result = await response.json();
                if (result.success) {
                    alert('Image deleted successfully.');
                    loadImagesForManagement();
                } else {
                    alert(`Error: ${result.message}`);
                }
            }
        }
    });

    loadImagesForManagement();
});
