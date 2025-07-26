document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');

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
                
                let metadataHTML = '';
                for (const key in image.metadata) {
                    if (image.metadata[key]) {
                        metadataHTML += `<strong>${key}:</strong> ${image.metadata[key]}<br>`;
                    }
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
