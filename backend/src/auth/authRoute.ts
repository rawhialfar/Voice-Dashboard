import { Router } from "express";
import { supabase, supabasePrivate } from "./authClient";
import { userAuthenticate, createCustomerAndAssociateId } from "./authService";
import { date } from "@elevenlabs/elevenlabs-js/core/schemas";
import { user } from "elevenlabs/api";

const router = Router();

// Returns max number of allowed users in an org depending on subscription
// NOTE: numbers here are arbitrary -> Adjust later.
function maxUsersinOrg(subscription: string): number {
	switch (subscription.toLowerCase()) {
		case "knight":
			return 3;
		case "queen":
			return 10;
		case "king":
			return 100;
		case "emperor":
			return 500;
		default:
			throw new Error(`Unknown subscription type: ${subscription}`);
	}
}

// Check if email is authenticated
async function checkAuth(email: string): Promise<boolean> {
	const { data, error } = await supabasePrivate.auth.admin.listUsers();
	if (error) console.log(error + " : fetching email");
	if (!data || !data.users) return false;
	const user = data.users.find((u) => u.email === email);
	return !!user;
}

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints (login/signup)
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: genovationai@gmail.com
 *               password:
 *                 type: string
 *                 example: Genovation097@
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 session:
 *                   type: object
 *                 user:
 *                   type: object
 *       400:
 *         description: Invalid email or password
 */
router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});
	if (error) return res.status(400).json({ error: error.message });
	res.json(data);
});

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Sign up user with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: genovationai@gmail.com
 *               password:
 *                 type: string
 *                 example: Genovation097@
 *               businessName:
 *                 type: string
 *                 example: Genovation
 *     responses:
 *       200:
 *         description: Successfully signed up
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 session:
 *                   type: object
 *                 user:
 *                   type: object
 *       400:
 *         description: Invalid email or password
 */
router.post("/signup", async (req, res) => {
	const { email, password, businessName } = req.body;

	// Validate required fields
	if (!email || !password || !businessName) {
		return res.status(400).json({
			error:
				"Missing required fields: email, password, and businessName are all required",
		});
	}

	// Check if user already exists
	const userExists = await checkAuth(email);
	if (userExists) {
		return res.status(400).json({ error: "User already exists" });
	}

	// Create auth user
	const { data, error } = await supabase.auth.signUp({ email, password });
	createCustomerAndAssociateId(email, businessName, data.user?.id || "");
	if (error) return res.status(400).json({ error: error.message });

	const userId = data.user?.id;

	if (!userId) {
		return res
			.status(500)
			.json({ error: "Failed to create user - no user ID returned" });
	}

	try {
		// Create basic user details without organization
		const { data: userData, error: userError } = await supabase
			.from("_UserDetails")
			.insert([
				{
					email: email,
					firstname: "",
					lastname: "",
					userId: userId,
					orgId: userId, // temporary orgId until organization is created
					permissions: 1 << 0, // make a new user admin by default
				},
			]);
		
		

		if (userError) {
			console.log("User details error:", userError);
			// Clean up: delete auth user if user details creation fails
			await supabase.auth.admin.deleteUser(userId);
			return res.status(500).json({ error: "User details insertion failed" });
		}

		// Return success response - no organization created yet
		res.json({
			...data,
			message:
				"User created successfully. Please subscribe to create your organization.",
		});
	} catch (error) {
		console.log("Unexpected error during signup:", error);
		// Clean up on unexpected error
		try {
			await supabase.auth.admin.deleteUser(userId);
		} catch (cleanupError) {
			console.log("Cleanup error:", cleanupError);
		}
		return res
			.status(500)
			.json({ error: "Unexpected error during signup process" });
	}
});

/**
 * @swagger
 * /auth/subusercreate:
 *   post:
 *     summary: Register a new subuser under the currently authenticated user's organization.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *                 example: Abdullah
 *               lastname:
 *                 type: string
 *                 example: Yahya
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Successfully created user
 *       400:
 *         description: Failed to create user
 *       404:
 *         description: X details insertion failed
 *       405:
 *         description: max number of users achieved, can't add more
 */
router.post("/subusercreate", userAuthenticate, async (req: any, res: any) => {
	try {
		const { firstname, lastname, email, password, permissions } = req.body;
		// check if user exists
		const userExists = await checkAuth(email);
		if (userExists) {
			return res.status(400).json({ error: "user already exists" });
		}

		const { data, error } = await supabase.auth.signUp({ email, password });

		if (error) return res.status(400).json({ error: error.message });

		// userIds
		const newUserid = data.user?.id;
		const currUserid = req.user;

		// get orgId of currently authenticated user
		const { data: currOrgId, error: currOrgIdError } = await supabasePrivate
			.from("_UserDetails")
			.select("orgId")
			.eq("userId", currUserid)
			.single();

		if (currOrgIdError)
			return res
				.status(404)
				.json({ error: "fetching curr user's orgId failed" });
		if (!currOrgId) return res.status(404).json({ error: "User not found" });

		// get organization details using orgId
		const { data: currOrg, error: currOrgError } = await supabasePrivate
			.from("_OrganizationDetails")
			.select("orgId, numberOfUsers, maxUsers")
			.eq("orgId", currOrgId.orgId)
			.single();

		if (currOrgError) {
			console.log(currOrgError);
			return res
				.status(404)
				.json({ error: "fetching curr user's organization info failed" });
		}

		// check if max users reached in org
		if (currOrg.numberOfUsers >= currOrg.maxUsers) {
			return res
				.status(405)
				.json({ error: "max number of users achieved; can't add more" });
		}

		// Update number of users in org.
		const { data: updateOrgData, error: updateOrgError } = await supabasePrivate
			.from("_OrganizationDetails")
			.update({ numberOfUsers: currOrg.numberOfUsers + 1 })
			.eq("orgId", currOrg.orgId);

		if (updateOrgError) {
			console.log(updateOrgError);
			return res.status(500).json({ error: "Org update failed" });
		}

		// Fill User details
		const { data: userData, error: userError } = await supabasePrivate
			.from("_UserDetails")
			.insert([
				{
					firstname: firstname,
					lastname: lastname,
					email: email,
					userId: newUserid,
					orgId: currOrg.orgId,
					permissions: permissions || 1 << 1,
				},
			]);

		if (userError) {
			console.log(userError);
			// Clean up: delete the auth user if user details insertion fails
			if (newUserid) {
				await supabasePrivate.auth.admin.deleteUser(newUserid);
			}
			return res.status(500).json({ error: "User details insertion failed" });
		}

		res.setHeader("Content-Type", "application/json");
		res.status(200).json({
			message: "User created successfully",
			user: {
				email: email,
				firstname: firstname,
				lastname: lastname,
			},
		});
	} catch (error: any) {
		// Also set JSON header for errors
		res.setHeader("Content-Type", "application/json");
		res.status(500).json({ error: "Internal server error" });
	}
});

/**
 * @swagger
 * /auth/subuserdelete:
 *   post:
 *     summary: Delete a subuser under the currently authenticated user's organization.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Successfully deleted user
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.post("/subuserdelete", userAuthenticate, async (req: any, res: any) => {
	try {
		const { email } = req.body;

		if (!email) {
			return res.status(400).json({ error: "Missing email in request body" });
		}

		const currUserid = req.user;

		// Fetch target user details by email
		const { data: targetUser, error: targetError } = await supabasePrivate
			.from("_UserDetails")
			.select("userId, orgId")
			.eq("email", email)
			.single();

		if (targetError || !targetUser) {
			return res
				.status(404)
				.json({ error: "User not found for provided email" });
		}

		// get orgId of currently authenticated user
		const { data: currOrgId, error: currOrgIdError } = await supabasePrivate
			.from("_UserDetails")
			.select("orgId")
			.eq("userId", currUserid)
			.single();

		if (currOrgIdError) {
			return res
				.status(404)
				.json({ error: "fetching curr user's orgId failed" });
		}

		// ensure the target user belongs to the same org
		if (targetUser.orgId !== currOrgId.orgId) {
			return res
				.status(403)
				.json({ error: "Target user is not in your organization" });
		}

		// prevent deleting the organization admin
		if (targetUser.userId === currOrgId.orgId) {
			return res
				.status(403)
				.json({ error: "Cannot delete organization admin" });
		}

		// Delete auth user (admin API)
		const { error: deleteAuthError } =
			await supabasePrivate.auth.admin.deleteUser(targetUser.userId);
		if (deleteAuthError) {
			console.log(deleteAuthError);
			return res.status(500).json({ error: "Failed to delete auth user" });
		}

		// Delete user details record
		const { error: delUserError } = await supabasePrivate
			.from("_UserDetails")
			.delete()
			.eq("userId", targetUser.userId);

		if (delUserError) {
			console.log("delete user details error: ", delUserError);
			return res.status(500).json({ error: "Failed to delete user details" });
		}

		// Decrement organization user count
		const { data: orgData, error: orgDataError } = await supabasePrivate
			.from("_OrganizationDetails")
			.select("numberOfUsers, orgId")
			.eq("orgId", currOrgId.orgId)
			.single();

		if (!orgDataError && orgData) {
			const newCount = orgData.numberOfUsers - 1;
			const { error: updateOrgError } = await supabasePrivate
				.from("_OrganizationDetails")
				.update({ numberOfUsers: newCount })
				.eq("orgId", currOrgId.orgId);

			if (updateOrgError) {
				console.log("update org error: ", updateOrgError);
				// Don't fail the whole request if this fails, but log it
			}
		}
		res.setHeader("Content-Type", "application/json");
		res.json({ message: "User deleted successfully" });
	} catch (err) {
		res.setHeader("Content-Type", "application/json");
		console.log("Unexpected error during subuser deletion:", err);
		res.status(500).json({ error: "Failed to delete subuser" });
	}
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logs out the user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       400:
 *         description: Logout failed
 */
router.post("/logout", async (req, res) => {
	const { error } = await supabase.auth.signOut();
	if (error) return res.status(400).json({ error: error.message });

	res.status(200).json({ message: "Logged out successfully" });
});

/**
 * @swagger
 * /auth/check:
 *   post:
 *     summary: checks if the user is logged in
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User is logged in
 *       400:
 *         description: User is not logged in
 */
router.post("/check", userAuthenticate, async (req, res) => {
	res.status(200).json({ message: "User is logged in" });
});

export default router;
