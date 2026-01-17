import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
import Stripe from "stripe";

//supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey || !supabaseServiceKey)
	throw new Error("Missing Supabase URL or Keys");
export const supabase = createClient(supabaseUrl, supabaseKey);

//stripe client

const stripeSecretKey =
	"sk_test_51RxYmORtokePTGRRma5pGB7WYKsYQ04z5zdYW3HUr69iYUVBIIIpogA6ZBXTeuSDvdoD1S0NipOpxvonSj8RVukf00x0dZT05P";

if (!stripeSecretKey) throw new Error("Missing Stripe Secret Key");
export const stripe = new Stripe(stripeSecretKey, {
	apiVersion: "2025-08-27.preview",
});
export const supabasePrivate = createClient(supabaseUrl, supabaseServiceKey);
