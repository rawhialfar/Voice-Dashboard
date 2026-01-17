import { Router } from "express";
import { userAuthenticate } from "../auth/authService";
import { supabase } from "../auth/authClient";
import {
	isValidPermission,
	checkPermissions,
	togglePermission,
} from "../util/permUtil";

const router = Router();
/**
 * @swagger
 * tags:
 *    name: Permissions
 *    description: Endpoints for Permissions
 */

/**
 * @swagger
 * /api/permissions/check:
 *   get:
 *     summary: Check whether a user (by email) has a specific permission bit set
 *     tags: [Permissions]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's email address
 *       - in: query
 *         name: permission
 *         required: true
 *         schema:
 *           type: number
 *         description: The permission mask to check
 *     responses:
 *       200:
 *         description: Result of the permission check
 *       400:
 *         description: Bad request (missing or invalid query parameters)
 *       404:
 *         description: User not found for provided email
 *       500:
 *         description: Failed to fetch privileges or internal error
 */
router.get("/check", userAuthenticate, async (req: any, res: any) => {
	try {
		const { email, permission } = req.query as {
			email?: string;
			permission?: number;
		};

		if (!email) return res.status(400).json({ error: "Missing email query parameter" });

		if (!permission) return res.status(400).json({ error: "Missing permission query parameter" });

		const permNum = Number(permission);
		if (Number.isNaN(permNum)) return res.status(400).json({ error: "permission must be a number" });

		if (!isValidPermission(permNum)) return res.status(400).json({ error: "Invalid permission value" });

		const { data: permData, error: permError } = await supabase
			.from("_UserDetails")
			.select("permissions")
			.eq("email", email)
			.single();

		if (permError || !permData) return res.status(500).json({ error: "Failed to fetch user privileges" });
		if (!isValidPermission(permission)) return res.status(500).json({ error: "Invalid Permission" });
		
		const hasPermission = checkPermissions( permData.permissions as number,permNum);
		res.json({ hasPermission });
	} catch (err) {
		console.error("checkperm error", err);
		res.status(500).json({ error: "Failed to check permission" });
	}
});

/**
 * @swagger
 * /api/permissions/set:
 *   post:
 *     summary: toggle one of 32 permissions for a user by email.
 *     tags: [Permissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address
 *               permissions:
 *                 type: integer
 *                 description: permissionBit
 *     responses:
 *       200:
 *         description: Successfully set permissions
 *       400:
 *         description: Bad request (missing email or permissions)
 *       404:
 *         description: User not found for provided email
 *       500:
 *         description: Failed to set permissions
 */

router.post("/set", userAuthenticate, async (req: any, res: any) => {
	const { email, permissions } = req.body;

	if (!email || typeof permissions !== "number" || permissions === null)
		return res
			.status(400)
			.json({ error: "Missing email or permissions object" });

	if (!isValidPermission(permissions as number))
		return res.status(500).json({ error: "Invalid Permission" });

	// Fetch user's permissions
	const { data: permData, error: permError } = await supabase
		.from("_UserDetails")
		.select("permissions")
		.eq("email", email)
		.single();

	if (permError || !permData)
		return res.status(500).json({ error: "Failed to fetch user permissions" });

	const newPerm = togglePermission(permData.permissions, permissions);

	// Set new permission
	const { data: permSetData, error: permSetError } = await supabase
		.from("_UserDetails")
		.update({ permissions: newPerm })
		.eq("email", email);
	if (permSetError)
		return res.status(500).json({ error: "Failed to set user permissions" });

	res.json({ message: "Permissions updated successfully." });
});

export default router;
