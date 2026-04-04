import express from 'express';
import cors from 'cors';
import elevenLabsRoute from './routes/elevenlabsRoute.js';
import retellRoute from './routes/retellRoute.js';
import stripeRoute from './routes/stripeRoute.js';
import knowledgebase from './routes/knowledgebaseRoute.js'
import userRoute from './routes/userRoute.js';
import { setupSwagger } from './swagger.js';
import helloRoute from './routes/helloRoute.js';
import authRoute from './auth/authRoute.js';
import permRoute from "./routes/permissionRoute.js";
import orgRoute from "./routes/orgRoute.js";

const app = express();
const PORT = process.env.API_PORT as string || 8000;
const FURL = [
	process.env.FRONTEND_URL,
	'http://localhost:5173',
].filter(Boolean);

// const dynamicCors = (origin: string | undefined, callback: (arg0: null, arg1: boolean) => void) => {

// if (!origin)  
//     return callback(null, true);  

// if (FURL.includes(origin))  
//     return callback(null, true);  

// if (/\.netlify\.app$/.test(origin))  
//     return callback(null, true);  

// callback(null, false);  
// };

const corsOptions = {
  origin: function (origin: string | undefined, callback: (arg0: Error | null, arg1: boolean | undefined) => void) {
    if (!origin) return callback(null, true);
    
    if (origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }
    
    if (FURL.includes(origin) || origin.endsWith('.netlify.app')) {
      return callback(null, true);
    }

    if (/\.netlify\.app$/.test(origin))  
        return callback(null, true);  
    
    console.log('Blocked origin:', origin);
    callback(new Error('Not allowed by CORS'), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
// app.use(cors({
// 	origin: corsOptions,
// 	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
// 	credentials: true,
// }));

app.use(express.json());
app.use('/auth', authRoute);
app.use('/api/user',userRoute)
app.use('/api/elevenlabs', elevenLabsRoute);
app.use('/api/retell', retellRoute);
app.use('/api/stripe', stripeRoute);
app.use('/api/knowledgebase', knowledgebase);
app.use("/api/permissions", permRoute);
app.use("/api/organization", orgRoute);
app.use("/api", helloRoute);

setupSwagger(app);
if(process.env.NODE_ENV !== 'production') { setupSwagger(app); }

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: ${process.env.API_URL || `http://localhost:${PORT}`}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'not set'}`);
  console.log(`CORS enabled for: ${FURL.join(', ')}`);
});

app.use(express.json());