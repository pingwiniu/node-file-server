const fileInput = document.getElementById('file-input');
const fileList = document.querySelector('.file-list');
const uploadprogress = document.querySelector('.upload-progress-bar');

const settingsToggleBtn1 = document.getElementById("settings-toggle-1");
const settingsToggleBtn2 = document.getElementById("settings-toggle-2");
const fileContainer = document.querySelector(".file-container");
const settingsContainer = document.querySelector(".settings-container");

const progressBar = document.querySelector(".progress-bar");
const spaceTakenSpan = document.querySelector(".taken");
const spaceAvailableSpan = document.querySelector(".available");



fetch('/files')
.then(response => response.json())
.then(files => {
    files.forEach(file => {
        const listItem = document.createElement('li');
        listItem.className = 'file-list-item';

        const ext = file.name.split('.').pop().toLowerCase();
        const fileIcon = document.createElement('span');
        fileIcon.className = 'file-icon';
        
        const fileIcons = {
            txt: '<i class="fas fa-file-alt"></i>',
            jpg: '<i class="fas fa-image"></i>',
            jpeg: '<i class="fas fa-image"></i>',
            png: '<i class="fas fa-image"></i>',
            pdf: '<i class="fas fa-file-pdf"></i>',
            doc: '<i class="fas fa-file-word"></i>',
            docx: '<i class="fas fa-file-word"></i>',
            xls: '<i class="fas fa-file-excel"></i>',
            xlsx: '<i class="fas fa-file-excel"></i>',
            ppt: '<i class="fas fa-file-powerpoint"></i>',
            pptx: '<i class="fas fa-file-powerpoint"></i>',
            mp3: '<i class="fas fa-file-audio"></i>',
            wav: '<i class="fas fa-file-audio"></i>',
            mp4: '<i class="fas fa-file-video"></i>',
            avi: '<i class="fas fa-file-video"></i>',
            exe: '<i class="fas fa-cogs"></i>',
            // Add more file extensions and icons as needed
        };

        fileIcon.innerHTML = fileIcons[ext] || '<i class="fas fa-file"></i>';
        
        const fileName = document.createElement('span');
        fileName.className = 'file-name';
        fileName.textContent = file.name;

        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'download-btn';
        downloadBtn.innerHTML = '<i class="fas fa-download"></i>';
        downloadBtn.addEventListener('click', () => {
            window.location.href = `/download/${encodeURIComponent(file.name)}`;
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt" data-file-name="' + file.name + '" ></i>';
        deleteBtn.dataset.fileName = file.name;

        listItem.appendChild(fileIcon);
        listItem.appendChild(fileName);
        listItem.appendChild(downloadBtn);
        listItem.appendChild(deleteBtn);

        fileList.appendChild(listItem);
    });
})
.catch(error => {
    console.error('Error fetching files:', error);
});

function uploadFile() {
    const file = fileInput.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;
                uploadprogress.style.width = percentComplete + '%';
            }
        });

        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    location.reload();
                } else {
                    console.error('Error uploading file:', xhr.statusText);
                }
            }
        };

        xhr.open('POST', '/upload');
        xhr.send(formData);
    }
}

fileList.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-btn') || event.target.classList.contains('fa-trash-alt')) {
        const fileName = event.target.dataset.fileName;
        if (confirm(`Are you sure you want to delete "${fileName}"?`)) {
            fetch(`/delete/${encodeURIComponent(fileName)}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                } else {
                    console.error('Error deleting file:', data.error);
                }
            })
            .catch(error => {
                console.error('Error deleting file:', error);
            });
        }
    }
});

settingsToggleBtn1.addEventListener("click", () => {
    if (fileContainer.style.display === "none") {
        fileContainer.style.display = "block";
        settingsContainer.style.display = "none";
    } else {
        fileContainer.style.display = "none";
        settingsContainer.style.display = "block";
    }
});

settingsToggleBtn2.addEventListener("click", () => {
    if (fileContainer.style.display === "none") {
        fileContainer.style.display = "block";
        settingsContainer.style.display = "none";
    } else {
        fileContainer.style.display = "none";
        settingsContainer.style.display = "block";
    }
});




async function fetchDiskSpace() {
    try {
        const response = await fetch("/disk-space");
        const data = await response.json();
        
        const availablePercentage = (data.taken / data.available) * 100;
        
        progressBar.style.width = `${availablePercentage}%`;

        spaceTakenSpan.textContent = `${(data.taken).toFixed(2)} GB`;
        spaceAvailableSpan.textContent = `${data.available.toFixed(2)} GB`;
    } catch (error) {
        console.error("Error fetching disk space:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchDiskSpace();
});
