import { Router } from "express";
import {userAuthenticate} from "../auth/authService";
import { supabase } from '../auth/authClient';
import { createClient } from '@supabase/supabase-js';
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // NOT the anon key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const router = Router();

/**
* @swagger
* tags:
*    name: User
*    description: Endpoints for User information
*/

/**
* @swagger
* /api/user/information:
*   get:
*     summary: Get the List of calls for a specific agent
*     tags: [User]
*     responses:
*       200:
*         description: Successfully fetched user information
*       500:
*         description: Failed to fetch user infromation
*/
router.get('/information', userAuthenticate, async (req: any, res: any) => {
    const userId = req.user;
    const { data, error } = await supabase
    .from('_UserDetails')
    .select('*')
    .eq('userId',userId);
    if (error){
        res.json({error: "Unable to retrieve data"});
    } else {
        res.json(data[0]);
    }
})



/**
 * @swagger
 * /api/user/updateInformation:
 *   put:
 *     summary: Update user information
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               firstname:
 *                 type: string
 *                 example: "John"
 *               lastname:
 *                 type: string
 *                 example: "Doe"
 *               businessName:
 *                 type: string
 *                 example: "Acme Inc."
 *               subscription:
 *                 type: string
 *                 enum: [free, pro, enterprise]
 *                 example: "pro"
 *     responses:
 *       200:
 *         description: Successfully updated user information
 *       500:
 *         description: Failed to update user information
 */
router.put('/updateInformation', userAuthenticate, async (req: any, res: any) => {
    interface form {
        email?: string;
        firstname?: string;
        lastname?: string;
        businessName?: string;
        subscription?: string;
        useCase?: string;
    }
    const userId = req.user;
    const newEmail = req.body.email;
    const newFirstname = req.body.firstname;
    const newLastname = req.body.lastname;
    const newBusinessName = req.body.businessName;
    const newSubscription = req.body.subscription;
    const useCase = req.body.useCase;
    let updateForm: form = {};


    //Supabase will update the column if the json has the existing key, I also assume it will update even if the key has a Null value
    if (newEmail) updateForm.email = newEmail;
    if (newFirstname) updateForm.firstname = newFirstname
    if (newLastname) updateForm.lastname = newLastname;
    if (newBusinessName) updateForm.businessName = newBusinessName;
    if (newSubscription) updateForm.subscription = newSubscription;
    if (useCase) updateForm.useCase = useCase;

    const {error } = await supabase
    .from('_UserDetails')
    .update(updateForm)
    .eq('userId',userId);

    if (error){
        res.json({error: "Unable to retrieve data"});
    } else {
        res.json({status: "success"});
    }
})

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'tmp/logos/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `logo_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * @swagger
 * /api/user/uploadLogo:
 *   post:
 *     summary: Upload a logo for the authenticated user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logo_url:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: No file uploaded or invalid file
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Failed to upload logo
 */
router.post('/uploadLogo', userAuthenticate, upload.single('logo'), async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No logo file uploaded' });
    }

    const userId = req.user;
    const file = req.file;

    // Read file into buffer
    const fileBuffer = fs.readFileSync(file.path);
    
    // Use simple path: userId/filename (matches RLS policy)
    const fileExt = path.extname(file.originalname);
    const fileName = `logo_${Date.now()}${fileExt}`;
    const storagePath = `${userId}/${fileName}`;

    const { data: storageData, error: storageError } = await supabaseAdmin.storage
        .from('_UserLogos')
        .upload(storagePath, fileBuffer, {
            contentType: file.mimetype,
            cacheControl: '3600',
            upsert: true,
            duplex: 'half'
        });

      

    if (storageError) {
      console.error('Supabase storage error:', storageError);
      fs.unlinkSync(file.path);
      return res.status(500).json({ 
        error: `Storage error: ${storageError.message}` 
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('_UserLogos')
      .getPublicUrl(storagePath);

    const logoUrl = urlData.publicUrl;

    // Update user details in database
    const { error: updateError } = await supabase
      .from('_UserDetails')
      .upsert({
        userId: userId,
        logo_url: logoUrl
      }, {
        onConflict: 'userId'
      });

    if (updateError) {
      console.error('Database update error:', updateError);
      fs.unlinkSync(file.path);
      return res.status(500).json({ error: 'Failed to update user logo in database' });
    }

    // Clean up temp file
    fs.unlinkSync(file.path);

    return res.status(200).json({
      logo_url: logoUrl,
      message: 'Logo uploaded successfully'
    });

  } catch (error: any) {
    console.error('Logo upload error:', error);
    
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({ 
      error: `Failed to upload logo: ${error.message || 'Unknown error'}` 
    });
  }
});

/**
 * @swagger
 * /api/user/logo:
 *   delete:
 *     summary: Delete user's logo
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Logo deleted successfully
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Failed to delete logo
 */
router.delete('/logo', userAuthenticate, async (req: any, res: any) => {
  try {
    const userId = req.user;
    
    // First get current logo URL
    const { data: userData, error: fetchError } = await supabase
      .from('_UserDetails')
      .select('logo_url')
      .eq('userId', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching user logo:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch user logo' });
    }

    if (userData?.logo_url) {
      try {
        const logoUrl = userData.logo_url;
        const pathMatch = logoUrl.match(/logos\/.*/);
        
        if (pathMatch) {
          const logoPath = pathMatch[0];
          
          const { error: deleteError } = await supabase.storage
            .from('_UserLogos')
            .remove([logoPath]);

          if (deleteError) {
            console.error('Error deleting logo from storage:', deleteError);
          }
        }
      } catch (storageError) {
        console.error('Error in logo deletion from storage:', storageError);
      }
    }

    const { error: updateError } = await supabase
      .from('_UserDetails')
      .update({
        logo_url: null,
        logo_updated_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('userId', userId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return res.status(500).json({ error: 'Failed to remove logo from database' });
    }

    return res.status(200).json({ 
      message: 'Logo deleted successfully' 
    });

  } catch (error: any) {
    console.error('Logo deletion error:', error);
    return res.status(500).json({ 
      error: `Failed to delete logo: ${error.message || 'Unknown error'}` 
    });
  }
});

/**
 * @swagger
 * /api/user/logoUrl:
 *   put:
 *     summary: Update logo URL directly (for external uploads)
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               logo_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logo URL updated successfully
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Failed to update logo URL
 */
router.put('/logoUrl', userAuthenticate, async (req: any, res: any) => {
  try {
    const userId = req.user;
    const { logo_url } = req.body;

    if (!logo_url) {
      return res.status(400).json({ error: 'logo_url is required' });
    }

    const { error: updateError } = await supabase
      .from('_UserDetails')
      .upsert({
        userId: userId,
        logo_url: logo_url,
        logo_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'userId'
      });

    if (updateError) {
      console.error('Database update error:', updateError);
      return res.status(500).json({ error: 'Failed to update logo URL' });
    }

    return res.status(200).json({
      logo_url: logo_url,
      message: 'Logo URL updated successfully'
    });

  } catch (error: any) {
    console.error('Logo URL update error:', error);
    return res.status(500).json({ 
      error: `Failed to update logo URL: ${error.message || 'Unknown error'}` 
    });
  }
});

/**
 * @swagger
 * /api/user/getSignedLogoUrl:
 *   post:
 *     summary: Get signed URL for direct client-side upload
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileName:
 *                 type: string
 *               fileType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Signed URL generated successfully
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Failed to generate signed URL
 */
router.post('/getSignedLogoUrl', userAuthenticate, async (req: any, res: any) => {
  try {
    const userId = req.user;
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'fileName and fileType are required' });
    }

    const finalFileName = `logos/${userId}/${Date.now()}_${fileName}`;
    
    // Generate signed URL for upload
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('_UserLogos')
      .createSignedUploadUrl(finalFileName);

    if (signedUrlError) {
      console.error('Signed URL generation error:', signedUrlError);
      return res.status(500).json({ error: 'Failed to generate signed URL' });
    }

    // Get public URL for after upload
    const { data: publicUrlData } = supabase.storage
      .from('_UserLogos')
      .getPublicUrl(finalFileName);

    return res.status(200).json({
      signedUrl: signedUrlData.signedUrl,
      token: signedUrlData.token,
      path: finalFileName,
      publicUrl: publicUrlData.publicUrl,
      message: 'Signed URL generated successfully'
    });

  } catch (error: any) {
    console.error('Signed URL generation error:', error);
    return res.status(500).json({ 
      error: `Failed to generate signed URL: ${error.message || 'Unknown error'}` 
    });
  }
});

export default router;