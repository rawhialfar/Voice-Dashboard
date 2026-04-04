import { supabase } from "../auth/authClient.js"


export const getPermissions = async (userId: string) => {
    const {data, error} = await supabase
    .from("_UserDetails")
    .select("permissions")
    .eq("userId", userId)
    .single();
    if (error){throw new Error("failed to find permissions from user")}
    return data?.permissions || 0b000;
}

export const setPermissions = async (userId: string, permissions: Number) => {
    const {data, error} = await supabase
    .from("_UserDetails")
    .update({permissions: permissions})
    .eq("userId", userId);
    if (error) {throw new Error("failed to set permissions");};
}

export const PermissionBit = {
	isAdmin: 1 << 0,
	readAnalytics: 1 << 1,
	readConversations: 1 << 2,
	readBilling: 1 << 3,
	readOrg: 1 << 4,
	readAgentWorkflowInfo: 1 << 5,
};

export function isValidPermission(permission: number): boolean {
	const vals = Object.values(PermissionBit).map((v) => v | 0); // the v | 0 forces v to 32-bit int
	return vals.includes(permission | 0);
}

// assumes requiredPermission is a valid PermissionBit
export function comparePermissions(
	permissions: number,
	requiredPermission: number
): boolean {
	const adminBit = PermissionBit.isAdmin;
	const isAdmin = (permissions & adminBit) !== 0;
	if (requiredPermission === 0) {return true;}
	return isAdmin || (permissions & requiredPermission) === requiredPermission;
}

export function togglePermission(
	permissions: number,
	requiredPermission: number
): number {
	return permissions ^ requiredPermission;
}
