export const PermissionBit = {
  isAdmin: 1 << 31,
  readConversationsDetails: 1 << 30,
  // ADD NEW PERMISSIONS BELOW
  perm3: 1 << 29,
  perm4: 1 << 28,
  perm5: 1 << 27,
  perm6: 1 << 26,
  perm7: 1 << 25,
  perm8: 1 << 24,
  perm9: 1 << 23,
  perm10: 1 << 22,
  perm11: 1 << 21,
  perm12: 1 << 20,
  perm13: 1 << 19,
  perm14: 1 << 18,
  perm15: 1 << 17,
  perm16: 1 << 16,
  perm17: 1 << 15,
  perm18: 1 << 14,
  perm19: 1 << 13,
  perm20: 1 << 12,
  perm21: 1 << 11,
  perm22: 1 << 10,
  perm23: 1 << 9,
  perm24: 1 << 8,
  perm25: 1 << 7,
  perm26: 1 << 6,
  perm27: 1 << 5,
  perm28: 1 << 4,
  perm29: 1 << 3,
  perm30: 1 << 2,
  perm31: 1 << 1,
  perm32: 1 << 0,
};

// assumes permissionToCheck is a valid PermissionBit  
export function checkPermissions(permissions: number, permissionToCheck: number ): boolean {
  const adminBit = PermissionBit.isAdmin;
  const isAdmin = (permissions & adminBit) !== 0;
  return isAdmin || (permissions & permissionToCheck) !== 0;
}
