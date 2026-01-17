import { Router } from "express";
import { userAuthenticate } from "../auth/authService";
import { supabase } from "../auth/authClient";

const router = Router();
function maxUsersinOrg(subscription: string): number {
	switch (subscription.toLowerCase()) {
		case "Knight Plan":
			return 3;
		case "Queen Plan":
			return 10;
		case "King Plan":
			return 100;
		case "Emperor Plan":
			return 500;
		default:
			return 3;
	}
}

/**
 * @swagger
 * /api/organization/list:
 *   get:
 *     summary: fetches all user details (email, firstname, lastname) in currently authenticated user's organization (except admin).
 *     tags: [Organization]
 *     responses:
 *       200:
 *         description: Successfully fetched Message
 *       500:
 *         description: Failed to fetch Message
 */
router.get("/list", userAuthenticate, async (req: any, res: any) => {
	try {
		const userId = req.user;
		// get organization id
		const { data: orgId, error: orgIdError } = await supabase
			.from("_UserDetails")
			.select("orgId")
			.eq("userId", userId)
			.single();

		// fetch non-admin org users
		const { data: orgData, error: orgDataError } = await supabase.rpc(
			"get_organization",
			{ org: orgId?.orgId }
		);

		res.json({ orgUsers: orgData });
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch org users" });
	}
});

/**
 * @swagger
 * /api/organization/details:
 *   get:
 *     summary: Fetches organization details for the currently authenticated user
 *     tags: [Organization]
 *     responses:
 *       200:
 *         description: Successfully fetched organization details
 *       500:
 *         description: Failed to fetch organization details
 */
router.get("/details", userAuthenticate, async (req: any, res: any) => {
	try {
		const userId = req.user;

		// Get user's orgId
		const { data: userData, error: userError } = await supabase
			.from("_UserDetails")
			.select("orgId")
			.eq("userId", userId)
			.single();

		// Get organization details
		const { data: orgData, error: orgError } = await supabase
			.from("_OrganizationDetails")
			.select("businessName, subscription, numberOfUsers, maxUsers")
			.eq("orgId", userData?.orgId)
			.single();

		res.json({
			name: orgData?.businessName,
			subscription: orgData?.subscription,
			memberCount: orgData?.numberOfUsers,
			maxMembers: orgData?.maxUsers,
		});
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch organization details" });
	}
});

/** * @swagger
 * /api/organization/update:
 *   post:
 *     summary: Updates organization details for the currently authenticated user
 *     tags: [Organization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessName:
 *                 type: string
 *                 example: Genovation
 *               subscription:
 *                 type: string
 *                 example: Queen Plan
 *     responses:
 *       200:
 *         description: Successfully updated organization details for the currently authenticated user
 *       500:
 *         description: Failed to update organization details for the currently authenticated user
 */
router.post("/update", userAuthenticate, async (req: any, res: any) => {
	try {
		const userId = req.user;
		const { businessName, subscription } = req.body;

		// Get user's orgId
		const { data: userData, error: userError } = await supabase
			.from("_UserDetails")
			.select("orgId")
			.eq("userId", userId)
			.single();
		// Prepare update data
		const updateData: any = {};
		if (businessName) updateData.businessName = businessName;
		if (subscription) {
			updateData.subscription = subscription;
			updateData.maxUsers = maxUsersinOrg(subscription);
		}

		// Update organization details
		const { error: orgError } = await supabase
			.from("_OrganizationDetails")
			.update(updateData)
			.eq("orgId", userData?.orgId);

		res.json({ message: "Organization details updated successfully" });
	} catch (error) {
		res.status(500).json({ error: "Failed to update organization details" });
	}
});

export default router;
