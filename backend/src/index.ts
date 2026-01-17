import express from 'express';
import cors from 'cors';
import elevenLabsRoute from './routes/elevenlabsRoute';
import retellRoute from './routes/retellRoute';
import stripeRoute from './routes/stripeRoute';
import knowledgebase from './routes/knowledgebaseRoute'
import userRoute from './routes/userRoute';
import { setupSwagger } from './swagger';
import helloRoute from './routes/helloRoute';
import authRoute from './auth/authRoute';
import permRoute from "./routes/permissionRoute";
import orgRoute from "./routes/orgRoute";

const app = express();
const PORT = process.env.API_PORT as string;
const FURL = process.env.FRONTEND_URL as string;

app.use(
	cors({
		origin: FURL,
		methods: ["GET", "POST", "PUT", "DELETE"],
		credentials: true,
	})
);

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

app.listen(PORT, () => {
	console.log(`Server running on ${process.env.API_URL}`);
});
