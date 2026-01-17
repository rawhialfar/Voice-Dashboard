// For testing only
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const stripeSecretKey = import.meta.env.STRIPE_PUBLISHABLE_KEY;

if (!stripeSecretKey) throw new Error('Missing Stripe Secret Key');
export const stripe = new Stripe(stripeSecretKey);