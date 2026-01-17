import { Request, Response, NextFunction } from "express";
import { stripe } from "../auth/authClient";
import { supabase } from "./authClient";

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;


const getOrgIdFromUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from("_UserDetails")
    .select("orgId")
    .eq("userId", userId)
    .single();
  
  if (error) {
    console.log("Error fetching user details:", error);
    return userId;
  }
  
  return data?.orgId || userId;
}

export const userAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  const { data: { session }, error } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  if (!accessToken) return res.status(401).json({ error: "Missing or invalid Authorization header" });
  try {
    const userId = session.user.id;
    const orgOrUserId = await getOrgIdFromUserId(userId);
    
    (req as any).user = orgOrUserId; 
    (req as any).userId = userId; 
    
    next();
  } catch (err) {
    console.error("Authentication error:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
};




export const getAllAgentsFromUserRetell = async (userId: string) => {
	return await supabase.from("_UserAgentRetell").select().eq("userId", userId);
};

export const createCustomerAndAssociateId = async (email: string,businessName: string,userId: string) => {
	//creating the customer
	const customer = await stripe.customers.create({
		name: businessName,
		email: email,
	});
  
	//making the connection in supabase
	const { error } = await supabase
		.from("_UserToStripeCustomers")
		.insert({ orgId: userId, userId: userId, customerId: customer.id });

	if (error) {throw error;}
};
