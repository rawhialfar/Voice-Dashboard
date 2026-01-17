import { Router } from "express";
import { userAuthenticate } from "../auth/authService";
import {
	associatePaymentMethod,
	cancelPaymentMethod,
	cancelSubscription,
	createPaymentIntent,
	createSubscription,
	getAllInvoicesForCustomer,
	getMostRecentPaymentDate,
	getSubscription,
	getlastFourDigitsOnCard,
} from "../services/stripe";
import { getTotalSecondsUsed } from "../services/supabase";
import { supabase, supabasePrivate } from "../auth/authClient";

const router = Router();

/**
 * @swagger
 * tags:
 *    name: Stripe
 *    description: Endpoints for Stripe
 */

// Helper function for max users calculation
function maxUsersinOrg(subscription: string): number {
	switch (subscription.toLowerCase()) {
		case "knight plan":
			return 3;
		case "queen plan":
			return 10;
		case "king plan":
			return 100;
		case "emperor plan":
			return 500;
		default:
			return 3;
	}
}

/**
 * @swagger
 * /api/stripe/subscribe:
 *   post:
 *     summary: Subscribe the authenticated user to a plan and associate a payment method
 *     tags: [Stripe]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 example: pm_12345
 *               subscriptionPlan:
 *                 type: string
 *                 example: testingPlan
 *               businessName:
 *                 type: string
 *                 example: My Business
 *     responses:
 *       200:
 *         description: Subscription created
 *       400:
 *         description: Bad request
 */
router.post("/subscribe", userAuthenticate, async (req: any, res: any) => {
	try {
		 const paymentMethod = req.body.paymentMethod;
    const subscriptionPlan = req.body.subscriptionPlan;
    const businessName = req.body.businessName;
    const userId = req.userId; // Actual user ID
    const orgId = req.orgId; // May be null
    const isNewUser = req.isNewUser; 
    
    if (!businessName) {
      return res.status(400).json({ error: "Business name is required" });
    }

    // If orgId exists, use it; otherwise use userId as orgId
    const targetOrgId = orgId || userId;

		if (targetOrgId) {
			// Update existing organization
			await associatePaymentMethod(paymentMethod, userId);
			await createSubscription(userId, subscriptionPlan);

			const maxUsers = maxUsersinOrg(subscriptionPlan);
			const { data: orgData, error: orgError } = await supabase
			.from("_OrganizationDetails")
			.insert([
				{
					subscription: subscriptionPlan,
					businessName: businessName,
					orgId: userId,
					numberOfUsers: 1,
					maxUsers: maxUsers,
				},
			]);

			if (orgError) {
				console.log("Organization update error:", orgError);
				return res.status(500).json({ error: "Failed to update organization" });
			}

			return res.json({
				status: "success",
				message: "Subscription updated successfully",
			});
		}

		// Create new organization using service role client
		const { data: orgData, error: orgError } = await supabasePrivate
			.from("_OrganizationDetails")
			.insert([
				{
					orgId: targetOrgId,
					numberOfUsers: 1,
					maxUsers: maxUsersinOrg(subscriptionPlan),
					businessName: businessName,
					subscription: subscriptionPlan,
				},
			]);

		if (orgError) {
			console.log("Organization creation error:", orgError);
			return res.status(500).json({ error: "Failed to create organization" });
		}

		// Update user with orgId using regular client
		const { error: updateUserError } = await supabase
			.from("_UserDetails")
			.update({ orgId: targetOrgId })
			.eq("userId", userId);

		if (updateUserError) {
			// Clean up organization if user update fails
			await supabasePrivate
				.from("_OrganizationDetails")
				.delete()
				.eq("orgId", targetOrgId);
			return res
				.status(500)
				.json({ error: "Failed to associate user with organization" });
		}

		// Process payment and subscription
		await associatePaymentMethod(paymentMethod, userId);
		await createSubscription(userId, subscriptionPlan);

		res.json({
			status: "success",
			message: "Organization created and subscription activated successfully",
		});
	} catch (error: any) {
		console.log("Subscription error:", error);
		res.status(400).json({ error: error.message });
	}
});

/**
 * @swagger
 * /api/stripe/subscription/cancel:
 *   post:
 *     summary: Cancel the authenticated user's subscription
 *     tags: [Stripe]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subscriptionPlan:
 *                 type: string
 *                 example: testingPlan
 *     responses:
 *       200:
 *         description: Subscription cancelled
 *       400:
 *         description: Bad request
 */
router.post(
	"/subscription/cancel",
	userAuthenticate,
	async (req: any, res: any) => {
		try {
			const userId = req.user;
			const subscriptionPlan = req.body.subscriptionPlan;
			cancelSubscription(userId, subscriptionPlan);
			cancelPaymentMethod(userId);
			res.json({ status: "success" });
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}
);

/**
 * @swagger
 * /api/stripe/subscription/get:
 *   get:
 *     summary: Get the authenticated user's current subscription
 *     tags: [Stripe]
 *     responses:
 *       200:
 *         description: Successfully fetched subscription
 *       400:
 *         description: Bad request
 */
router.get(
	"/subscription/get",
	userAuthenticate,
	async (req: any, res: any) => {
		try {
			const userId = req.user;
			const product = await getSubscription(userId);
			res.json({ product });
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}
);

/**
 * @swagger
 * /api/stripe/subscription/update:
 *   post:
 *     summary: Update the authenticated user's subscription plan
 *     tags: [Stripe]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldSubscriptionPlan:
 *                 type: string
 *                 example: testingPlan
 *               newSubscriptionPlan:
 *                 type: string
 *                 example: Growth Plan
 *     responses:
 *       200:
 *         description: Subscription updated
 *       400:
 *         description: Bad request
 */
router.post(
	"/subscription/update",
	userAuthenticate,
	async (req: any, res: any) => {
		try {
			const userId = req.user;
			const currentSubscription = await getSubscription(userId);
			const currentSubscriptionPlan = currentSubscription.name;
			const paymentMethod = req.body.paymentMethod;
			const newSubscriptionPlan = req.body.newSubscriptionPlan;

			const { data: userData, error: userError } = await supabase
				.from("_UserDetails")
				.select("orgId")
				.eq("userId", userId)
				.single();

			if (userError) {
				return res
					.status(500)
					.json({ error: "Failed to fetch user organization" });
			}

			const maxUsers = maxUsersinOrg(newSubscriptionPlan);
			const { error: orgError } = await supabasePrivate
				.from("_OrganizationDetails")
				.update({
					subscription: newSubscriptionPlan,
					maxUsers: maxUsers,
				})
				.eq("orgId", userData.orgId);

			if (orgError) {
				console.log("Organization update error:", orgError);
				return res
					.status(500)
					.json({ error: "Failed to update organization details" });
			}

			await cancelPaymentMethod(userId);
			await cancelSubscription(userId, currentSubscriptionPlan);
			await associatePaymentMethod(paymentMethod, userId);
			await createSubscription(userId, newSubscriptionPlan);

			res.json({
				status: "success",
				message: "Subscription and organization details updated successfully",
			});
		} catch (error: any) {
			console.log("Subscription update error:", error);
			res.status(400).json({ error: error.message });
		}
	}
);

/**
 * @swagger
 * /api/stripe/paymentMethod/update:
 *   post:
 *     summary: Update the authenticated user's payment method
 *     tags: [Stripe]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPaymentMethod:
 *                 type: string
 *                 example: pm_67890
 *     responses:
 *       200:
 *         description: Payment method updated
 *       400:
 *         description: Bad request
 */
router.post(
	"/paymentMethod/update",
	userAuthenticate,
	async (req: any, res: any) => {
		try {
			const userId = req.user;
			const newPaymentMethod = await req.body.paymentMethod;
			cancelPaymentMethod(userId);
			associatePaymentMethod(newPaymentMethod, userId);
			res.json({ status: "success" });
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}
);

/**
 * @swagger
 * /api/stripe/paymentMethod/getLastFour:
 *   get:
 *     summary: Retrieve the last four digits of the authenticated user's current payment method
 *     tags: [Stripe]
 *     responses:
 *       200:
 *         description: Successfully retrieved last four digits of the user's payment method
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lastfour:
 *                   type: string
 *                   example: "4242"
 *       400:
 *         description: Bad request
 */
router.get(
	"/paymentMethod/getLastFour",
	userAuthenticate,
	async (req: any, res: any) => {
		try {
			const userId = req.user;
			const card = await getlastFourDigitsOnCard(userId);
			res.json({
				expMonth: card?.exp_month,
				expYear: card?.exp_year,
				lastfour: card?.last4,
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}
);

/**
 * @swagger
 * /api/stripe/getMinutesUsedInPeriod:
 *   get:
 *     summary: Retrieve the most recent payment date of the authenticated user's subscription
 *     tags: [Stripe]
 *     responses:
 *       200:
 *         description: Successfully retrieved the most recent payment date
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 paidAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-11-06T17:12:34Z"
 *       400:
 *         description: Bad request
 */
router.get(
	"/getMinutesUsedInPeriod",
	userAuthenticate,
	async (req: any, res: any) => {
		try {
			const userId = req.user;
			const paidAt = await getMostRecentPaymentDate(userId);
			const totalSecondsUsed = await getTotalSecondsUsed(paidAt * 1000, userId);
			const product = await getSubscription(userId);
			const metadata = product.metadata;
			res.json({
				totalMinutesUsed: totalSecondsUsed[0].totalsecondsused / 60,
				totalMinutesAllowed: metadata.totalMinutes,
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}
);

/**
 * @swagger
 * /api/stripe/getOverageCharge:
 *   get:
 *     summary: Retrieve the overage charge for the authenticated user's subscription
 *     tags: [Stripe]
 *     responses:
 *       200:
 *         description: Successfully retrieved overage charge details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overage:
 *                   type: boolean
 *                   example: true
 *                 overageCharge:
 *                   type: number
 *                   example: 12.75
 *       400:
 *         description: Bad request
 */
router.get(
	"/getOverageCharge",
	userAuthenticate,
	async (req: any, res: any) => {
		try {
			const userId = req.user;
			const paidAt = await getMostRecentPaymentDate(userId);
			const totalSecondsUsed = await getTotalSecondsUsed(paidAt * 1000, userId);
			let totalMinutesUsed = totalSecondsUsed[0].totalsecondsused / 60;
			const product = await getSubscription(userId);
			let totalMinutesAllowed = Number(product.metadata.totalMinutes);
			let overageRate = Number(product.metadata.overageCharge);
			let overageCharge =
				(totalMinutesUsed - totalMinutesAllowed) * overageRate;
			let overage = true;
			if (overageCharge < 0) {
				overageCharge = 0;
				overage = false;
			}
			res.json({
				overage: overage,
				overageCharge: overageCharge,
			});
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}
);

/**
 * @swagger
 * /api/stripe/customer/invoices:
 *   get:
 *     summary: Retrieve all invoices for the authenticated user
 *     tags: [Stripe]
 *     responses:
 *       200:
 *         description: Successfully retrieved invoices
 *       400:
 *         description: Bad request
 */
router.get(
	"/customer/invoices",
	userAuthenticate,
	async (req: any, res: any) => {
		try {
			const userId = req.user;
			const invoices = await getAllInvoicesForCustomer(userId);
			res.json({ invoices: invoices });
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}
);

router.post(
	"/create-payment-intent",
	userAuthenticate,
	async (req: any, res: any) => {
		try {
			const { amount } = req.body;
			const paymentIntent = await createPaymentIntent(amount);
			res.json({ clientSecret: paymentIntent.client_secret });
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}
);

export default router;
