document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');

    // --- Helper Functions ---

    // Converts exposure time (decimal) to a fraction string
    function formatExposureTime(exposure) {
        if (exposure >= 1) {
            return `${exposure}s`;
        }
        const fraction = 1 / exposure;
        return `1/${Math.round(fraction)}s`;
    }

    // Formats a Unix timestamp into a readable date
    function formatDate(timestamp) {
        if (!timestamp) return 'Unknown date';
        // Assuming the timestamp is in seconds, convert to milliseconds
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // SVG Icons
    const apertureIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-aperture"><circle cx="12" cy="12" r="10"></circle><line x1="14.31" y1="8" x2="20.05" y2="17.94"></line><line x1="9.69" y1="8" x2="21.17" y2="8"></line><line x1="7.38" y1="12" x2="13.12" y2="2.06"></line><line x1="9.69" y1="16" x2="3.95" y2="6.06"></line><line x1="14.31" y1="16" x2="2.83" y2="16"></line><line x1="16.62" y1="12" x2="10.88" y2="21.94"></line></svg>`;
    const isoIcon = `<strong>ISO</strong>`;


    fetch('/images')
        .then(response => response.json())
        .then(images => {
            images.forEach(image => {
                const item = document.createElement('div');
                item.className = 'grid-item';

                const img = document.createElement('img');
                img.src = `/uploads/${image.filename}`;

                const metadataDiv = document.createElement('div');
                metadataDiv.className = 'metadata';
                
                const { Model, ExposureTime, FNumber, ISO, DateTimeOriginal } = image.metadata;

                let metadataHTML = '';
                if (Model) {
                    metadataHTML += `<div class="meta-title">${Model}</div>`;
                }

                metadataHTML += '<div class="meta-details">';
                if (FNumber) {
                    metadataHTML += `<span class="meta-item">${apertureIcon} f/${FNumber}</span>`;
                }
                if (ExposureTime) {
                    metadataHTML += `<span class="meta-item">${formatExposureTime(ExposureTime)}</span>`;
                }
                if (ISO) {
                    metadataHTML += `<span class="meta-item">${isoIcon} ${ISO}</span>`;
                }
                metadataHTML += '</div>';
                
                if (DateTimeOriginal) {
                    metadataHTML += `<div class="meta-date">${formatDate(DateTimeOriginal)}</div>`;
                }

                metadataDiv.innerHTML = metadataHTML;

                item.appendChild(img);
                item.appendChild(metadataDiv);
                gallery.appendChild(item);
            });

            var grid = document.querySelector('.grid');
            var msnry = new Masonry( grid, {
            // options...
            itemSelector: '.grid-item',
            columnWidth: 0,
            });

            imagesLoaded( grid ).on( 'progress', function() {
                msnry.layout();
            });


            // Add a sizer element for Masonry
            const sizer = document.createElement('div');
            sizer.className = 'grid-sizer';
            gallery.prepend(sizer);
        });
});
