import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { generateEbookController } from './controllers/scraperController.js';
import { FOLDER_NAME } from './cts.js';

const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/generate-ebook', generateEbookController);

app.get('/api/download-ebook', async (req, res) => {
  try {
    const file = path.join(FOLDER_NAME, 'newBook.epub');
    
    // Check if file exists
    await fs.access(file);
    
    // Send file to download
    res.download(file, 'newBook.epub', async (err) => {
      if (err) {
        console.error('Download error:', err);
        return;
      }
      
      try {
        await fs.rm(FOLDER_NAME, { recursive: true, force: true });
        console.log(`✅ Folder ${FOLDER_NAME} deleted`);
      } catch (deleteErr) {
        console.error('Delete error:', deleteErr);
      }
    });
    
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})