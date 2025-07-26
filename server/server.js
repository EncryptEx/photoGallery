import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import exifParser from 'exif-parser';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
const UPLOAD_PASSWORD = process.env.UPLOAD_PASSWORD;
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOADS_DIR)){
    fs.mkdirSync(UPLOADS_DIR);
}

if (!UPLOAD_PASSWORD) {
    console.error("UPLOAD_PASSWORD environment variable not set. Please create a .env file in the server directory with UPLOAD_PASSWORD=your_password");
    process.exit(1);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.get('/images', async (req, res) => {
  try {
    const files = await fs.promises.readdir(UPLOADS_DIR);
    const imageInfo = await Promise.all(files.map(async (file) => {

      // Check if the file is an image, capital unsensitive

      if (!/\.(jpg|jpeg|png|gif)$/i.test(file.toLowerCase())) {
        return null; // Skip non-image files
      }

      const filePath = path.join(UPLOADS_DIR, file);
      const data = await fs.promises.readFile(filePath);
      let metadata = {};
      try {
        const parser = exifParser.create(data);
        metadata = parser.parse();
      } catch (err) {
        console.error(`Could not parse EXIF data for ${file}:`, err);
      }
      return {
        filename: file,
        metadata: {
          Make: metadata.tags?.Make,
          Model: metadata.tags?.Model,
          ExposureTime: metadata.tags?.ExposureTime,
          FNumber: metadata.tags?.FNumber,
          ISO: metadata.tags?.ISO,
          DateTimeOriginal: metadata.tags?.DateTimeOriginal,
        }
      };
    }));

    // Filter out null values (non-image files)
    const filteredImages = imageInfo.filter(info => info !== null);

    res.json(filteredImages);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.post('/upload', upload.array('photos'), (req, res) => {
    const { password } = req.body;

    if (password !== UPLOAD_PASSWORD) {
        return res.status(401).json({ success: false, message: 'Invalid password.' });
    }

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded.' });
    }
    
    res.json({ success: true, message: 'Files uploaded successfully.' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
