import axios from "axios";

const authApi = axios.create({
  baseURL: "/api/auth",
  withCredentials: true,
});

const orgApi = axios.create({
  baseURL: "/api/organization",
  withCredentials: true,
});

const apiPerm = axios.create({
  baseURL: "/api/permissions",
  withCredentials: true,
});

// Organization API Paths
const getOrgUserDetailsPath = () => `/list`;
const getOrgDetailsPath = () => `/details`;
const updateOrgDetailsPath = () => `/update`;

// Permissions API Paths
const getPermTogglePath = () => `/set`;
const getPermCheckPath = () => `/check`;

// Payload Interfaces
export interface PermissionTogglePayload {
  email: string;
  permissions: number;
}

export interface PermissionCheckPayload {
  email: string;
  permission: number;
}

export interface UpdateOrganizationPayload {
  businessName?: string;
  subscription?: string;
}

// Response Interfaces
export interface OrgUser {
  email: string;
  firstname: string;
  lastname: string;
  permissions: number;
}

export interface OrgUsersResponse {
  orgUsers: OrgUser[];
}

export interface OrganizationDetailsResponse {
  name: string;
  subscription: string;
  memberCount: number;
  maxMembers: number;
}

export interface PermissionToggleResponse {
  message: string;
}

export interface PermissionCheckResponse {
  hasPermission: boolean;
}

export interface UpdateOrganizationResponse {
  message: string;
}

// Organization API Calls
export const getOrganizationDetails = async (): Promise<OrganizationDetailsResponse> => {
  const { data } = await orgApi.get<OrganizationDetailsResponse>(getOrgDetailsPath());
  return data;
};

export const getOrgUserData = async (): Promise<OrgUsersResponse> => {
  const { data } = await orgApi.get<OrgUsersResponse>(getOrgUserDetailsPath());
  return data;
};

export const updateOrganizationDetails = async (payload: UpdateOrganizationPayload): Promise<UpdateOrganizationResponse> => {
  const { data } = await orgApi.post<UpdateOrganizationResponse>(updateOrgDetailsPath(), payload);
  return data;
};

// Permissions API Calls
export const permissionToggle = async (payload: PermissionTogglePayload): Promise<PermissionToggleResponse> => {
  const { data } = await apiPerm.post<PermissionToggleResponse>(getPermTogglePath(), payload);
  return data;
};

export const permissionCheck = async (payload: PermissionCheckPayload): Promise<boolean> => {
  const { data } = await apiPerm.get<PermissionCheckResponse>(getPermCheckPath(), {
    params: payload
  });
  return data.hasPermission;
};