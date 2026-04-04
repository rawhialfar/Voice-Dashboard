import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
import Stripe from "stripe";

//supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey || !supabaseServiceKey)
	throw new Error("Missing Supabase URL or Keys");
export const supabase = createClient(supabaseUrl, supabaseKey);


if (!stripeSecretKey) throw new Error("Missing Stripe Secret Key");
export const stripe = new Stripe(stripeSecretKey);
export const supabasePrivate = createClient(supabaseUrl, supabaseServiceKey);
