const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const disk = require('diskusage');

const app = express();
const port = 80;

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const originalName = file.originalname;
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext); // Get the filename without extension
    const uniqueSuffix = Date.now() % 10000; // Adding a 4-digit number for uniqueness
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }
  res.json({ success: true, message: 'File uploaded successfully.' });
});

app.get('/files', async (req, res) => {
  try {
    const files = await fs.readdir('./uploads');
    res.json(files.map(name => ({ name })));
  } catch (error) {
    console.error('Error reading files:', error);
    res.status(500).json({ error: 'An error occurred while fetching files.' });
  }
});

app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  res.download(filePath, filename, (error) => {
    if (error) {
      console.error('Error downloading file:', error);
      res.status(404).send('File not found.');
    }
  });
});

app.delete('/delete/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    await fs.unlink(filePath);
    res.json({ success: true, message: 'File deleted successfully.' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ success: false, error: 'An error occurred while deleting the file.' });
  }
});

app.get('/disk-space', async (req, res) => {
    try {
      const diskInfo = await disk.check(__dirname);
      const availableSpaceGB = diskInfo.available / (1024 * 1024 * 1024); // Convert bytes to GB
      const totalSpaceGB = diskInfo.total / (1024 * 1024 * 1024); // Convert bytes to GB
      
      const uploadFolder = path.join(__dirname, 'uploads');
      const files = await fs.readdir(uploadFolder);
      let spaceTakenBytes = 0;
  
      for (const file of files) {
        const filePath = path.join(uploadFolder, file);
        const fileStats = await fs.stat(filePath);
        spaceTakenBytes += fileStats.size;
      }
  
      const spaceTakenGB = spaceTakenBytes / (1024 * 1024 * 1024); // Convert bytes to GB
      const roundedAvailableSpace = Math.round(availableSpaceGB * 100) / 100;
      const roundedTotalSpace = Math.round(totalSpaceGB * 100) / 100;
      const roundedSpaceTaken = Math.round(spaceTakenGB * 100) / 100;
  
      res.json({
        available: roundedAvailableSpace,
        total: roundedTotalSpace,
        taken: roundedSpaceTaken,
      });
    } catch (error) {
      console.error('Error checking disk space:', error);
      res.status(500).json({ error: 'An error occurred while checking disk space.' });
    }
  });
  
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
