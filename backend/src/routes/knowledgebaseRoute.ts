import { Router } from "express";
import multer from "multer";
import path from 'path';
import fs from 'fs';
import {userAuthenticate} from "../auth/authService";
import { addKnowledgebase, addKnowledgebaseSourceFile, addKnowledgebaseSourceText, addKnowledgebaseSourceUrl, deleteKnowledgebase, deleteKnowledgebaseSource, listKnowledgebases, listKnowledgebaseSources } from "../services/knowledgebase";

const router = Router();
/**
 * @swagger
 * /api/knowledgebase/add:
 *   post:
 *     summary: Create a new knowledgebase
 *     tags: [Knowledgebase]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               knowledgebaseName:
 *                 type: string
 *                 description: Name of the knowledgebase to create
 *             required:
 *               - knowledgebaseName
 *     responses:
 *       200:
 *         description: Knowledgebase created successfully
 *       400:
 *         description: Bad request - missing or invalid payload
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         description: Failed to create knowledgebase
 */

router.post('/add',userAuthenticate, async (req: any, res: any) => {
    try {
        const orgId = req.user;
        await addKnowledgebase(req.body.knowledgebaseName, orgId);
        res.json({ message: 'Knowledgebase created successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create knowledgebase' });
    }
})
/**
 * @swagger
 * /api/knowledgebase/delete:
 *   delete:
 *     summary: Delete an existing knowledgebase
 *     tags: [Knowledgebase]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               knowledgebaseName:
 *                 type: string
 *                 description: Name of the knowledgebase to delete
 *             required:
 *               - knowledgebaseName
 *     responses:
 *       200:
 *         description: Knowledgebase deleted successfully
 *       400:
 *         description: Bad request - missing or invalid payload
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         description: Failed to delete knowledgebase
 */

router.delete('/delete',userAuthenticate, async (req: any, res: any) => {
    try {
        const orgId = req.user;
        await deleteKnowledgebase(req.body.knowledgebaseName, orgId);
        return res.status(200).json({ message: 'Knowledgebase deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete knowledgebase' });
    }
})
/**
 * @swagger
 * /api/knowledgebase/list:
 *   get:
 *     summary: List all knowledgebases
 *     tags: [Knowledgebase]
 *     responses:
 *       200:
 *         description: Successfully listed knowledgebases
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   id:
 *                     type: string
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         description: Failed to list knowledgebases
 */

router.get('/list',userAuthenticate, async (req: any, res: any) => {
    try {
       const orgId = req.user;
        const knowledgebases = await listKnowledgebases(orgId);
        return res.status(200).json(knowledgebases);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to list knowledgebases' });
    }
})



// Update your multer configuration to preserve the original filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'tmp/uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Preserve the original filename, but sanitize it and add timestamp to avoid collisions
    const originalName = file.originalname;
    const sanitizedFilename = originalName
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special characters with underscores
      .replace(/\s+/g, '_'); // Replace spaces with underscores
    
    // Add timestamp to ensure uniqueness
    const timestamp = Date.now();
    const filename = `${timestamp}_${sanitizedFilename}`;
    
    cb(null, filename);
  }
});

// Or if you want to keep the original name exactly as is:
const storageSimple = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'tmp/uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Use the original filename directly
    cb(null, file.originalname);
  }
});

// Or with better collision handling:
const storageBetter = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'tmp/uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const originalName = path.parse(file.originalname);
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    
    const filename = `${originalName.name}${originalName.ext}`;
    
    cb(null, filename);
  }
});

const upload = multer({
  storage: storageBetter, // Choose the storage option you prefer
  fileFilter: (req, file, cb) => {
    // Your existing file filter logic
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, CSV, XLS, XLSX are allowed.'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024,
  }
});
/**
 * @swagger
 * /api/knowledgebase/source/addFile:
 *   post:
 *     summary: Upload a file and add it as a knowledgebase source
 *     tags: [Knowledgebase]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               knowledgebaseName:
 *                 type: string
 *                 description: Name of the target knowledgebase
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (field name must be "file")
 *             required:
 *               - knowledgebaseName
 *               - file
 *     responses:
 *       200:
 *         description: File uploaded and source added successfully
 *       400:
 *         description: Bad request - missing file or parameters
 *       401:
 *         description: Unauthorized - user not authenticated
 *       413:
 *         description: Payload Too Large - file exceeds configured size limits
 *       500:
 *         description: Failed to upload file
 */

router.post('/source/addFile', userAuthenticate, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        // This path will now include the original filename
        const path = req.file.path;
        const knowledgebaseName = req.body.knowledgebaseName;
        
        await addKnowledgebaseSourceFile(knowledgebaseName, path);
        
        return res.status(200).json({ 
            message: 'File uploaded successfully',
            originalFilename: req.file.originalname,
            storedFilename: req.file.filename,
            path: req.file.path
        });
    } catch (error) {
        console.error('File upload error:', error);
        return res.status(500).json({ error: 'Failed to upload file' });
    }
});
/**
 * @swagger
 * /api/knowledgebase/source/addText:
 *   post:
 *     summary: Add a text source to a knowledgebase
 *     tags: [Knowledgebase]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               knowledgebaseName:
 *                 type: string
 *                 description: Name of the target knowledgebase
 *               title:
 *                 type: string
 *                 description: Title for the text source
 *               text:
 *                 type: string
 *                 description: Text content to add
 *             required:
 *               - knowledgebaseName
 *               - title
 *               - text
 *     responses:
 *       200:
 *         description: Knowledgebase text source added successfully
 *       400:
 *         description: Bad request - missing or invalid payload
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         description: Failed to add knowledgebase source
 */

router.post('/source/addText',userAuthenticate, async (req, res) => {
    try {
        await addKnowledgebaseSourceText(req.body.knowledgebaseName, req.body.title, req.body.text);
        return res.status(200).json({ message: 'Knowledgebase source added successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to add knowledgebase source' });
    }
}) 
/**
 * @swagger
 * /api/knowledgebase/source/addUrl:
 *   post:
 *     summary: Add a URL source to a knowledgebase (Retell will fetch and ingest the URL)
 *     tags: [Knowledgebase]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               knowledgebaseName:
 *                 type: string
 *                 description: Name of the target knowledgebase
 *               url:
 *                 type: string
 *                 description: Public URL to fetch and ingest
 *             required:
 *               - knowledgebaseName
 *               - url
 *     responses:
 *       200:
 *         description: Knowledgebase URL source added successfully
 *       400:
 *         description: Bad request - missing or invalid payload
 *       401:
 *         description: Unauthorized - user not authenticated
 *       422:
 *         description: Unprocessable Entity - URL could not be fetched or is not supported
 *       500:
 *         description: Failed to add knowledgebase source
 */

router.post('/source/addUrl',userAuthenticate, async (req, res) => {
    try {
        await addKnowledgebaseSourceUrl(req.body.knowledgebaseName, req.body.url);
        return res.status(200).json({ message: 'Knowledgebase source added successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to add knowledgebase source' });
    }
})  

/**
 * @swagger
 * /api/knowledgebase/source/delete:
 *   delete:
 *     summary: Delete a knowledgebase source (file, text, or url) from a knowledgebase
 *     tags: [Knowledgebase]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               knowledgebaseName:
 *                 type: string
 *                 description: Name of the knowledgebase
 *               type:
 *                 type: string
 *                 description: Source type ('file' | 'text' | 'url')
 *               sourceName:
 *                 type: string
 *                 description: Identifier or name of the source to remove (e.g., filename or title)
 *             required:
 *               - knowledgebaseName
 *               - type
 *               - sourceName
 *     responses:
 *       200:
 *         description: Knowledgebase source deleted successfully
 *       400:
 *         description: Bad request - missing or invalid payload
 *       401:
 *         description: Unauthorized - user not authenticated
 *       404:
 *         description: Source not found
 *       500:
 *         description: Failed to delete knowledgebase source
 */

router.delete('/source/delete',userAuthenticate, async (req, res) => {
    try {
        await deleteKnowledgebaseSource(req.body.knowledgebaseName, req.body.type, req.body.sourceName);
        return res.status(200).json({ message: 'Knowledgebase source deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete knowledgebase source' });
    }
})

/**
 * @swagger
 * /api/knowledgebase/source/list:
 *   get:
 *     summary: List all sources for a given knowledgebase
 *     tags: [Knowledgebase]
 *     parameters:
 *       - in: query
 *         name: knowledgebaseName
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the knowledgebase to list sources for
 *     responses:
 *       200:
 *         description: Successfully fetched knowledgebase sources
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 knowledgebaseSources:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       title:
 *                         type: string
 *                       file_name:
 *                         type: string
 *                       file_url:
 *                         type: string
 *                       url:
 *                         type: string
 *       400:
 *         description: Bad request - missing query parameter
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         description: Failed to list knowledgebase sources
 */

router.get('/source/list',userAuthenticate, async (req, res) => {
    try {
        const knowledgebaseSources = await listKnowledgebaseSources(req.query.knowledgebaseName as string);
        return res.status(200).json({ knowledgebaseSources });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to list knowledgebase sources' });
    }
})





export default router;