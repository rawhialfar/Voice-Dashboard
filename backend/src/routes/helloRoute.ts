import { Router } from "express";
 
const router = Router();

/**
* @swagger
* tags:
*    name: Default
*    description: Default Template
*/

/**
* @swagger
* /api/hello:
*   get:
*     summary: Get a Hello Message
*     tags: [Default]
*     responses:
*       200:
*         description: Successfully fetched Message
*       500:
*         description: Failed to fetch Message
*/
router.get('/hello', async(req, res) => {
    res.json({ 
        message: "Hello from backend!",
        time: new Date(),
        version: '1.0.0',  
    });
});

export default router;