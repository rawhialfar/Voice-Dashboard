import { read } from "fs";

export const PermissionBit = {
	isAdmin: 1 << 0,
	readAnalytics: 1 << 1,
	readConversations: 1 << 2,
};

export function isValidPermission(permission: number): boolean {
	const vals = Object.values(PermissionBit).map((v) => v | 0); // the v | 0 forces v to 32-bit int
	return vals.includes(permission | 0);
}

// assumes requiredPermission is a valid PermissionBit
export function checkPermissions(
	permissions: number,
	requiredPermission: number
): boolean {
	const adminBit = PermissionBit.isAdmin;
	const isAdmin = (permissions & adminBit) !== 0;
	return isAdmin || (permissions & requiredPermission) !== 0;
}

export function togglePermission(
	permissions: number,
	requiredPermission: number
): number {
	return permissions ^ requiredPermission;
}
