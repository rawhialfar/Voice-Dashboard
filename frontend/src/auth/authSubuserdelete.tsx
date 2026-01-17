const SubuserDeletePath = `${import.meta.env.VITE_BACKEND_URL}/auth/subuserdelete`;

export interface SubuserDeletePayload {
  email: string;
}

export interface SubuserDeleteResponse {
  message: string;
}

export const subuserDelete = async (payload: SubuserDeletePayload): Promise<SubuserDeleteResponse> => {
  try {
    const response = await fetch(SubuserDeletePath, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      credentials: 'include'
    });

    if (!response) {
      throw new Error("Network Error");
    }
    
    if (response.ok) {
      const data = await response.json();
      console.log("Subuser deleted successfully:", data);
      return data;
    } else {
      // Handle different error statuses
      if (response.status === 403) {
        throw new Error("Cannot delete organization admin or user not in your organization");
      } else if (response.status === 404) {
        throw new Error("User not found");
      } else if (response.status === 400) {
        throw new Error("Cannot delete your own account");
      } else {
        // Try to get error message from response
        const errorText = await response.text();
        throw new Error(errorText || `Failed to delete user: ${response.status}`);
      }
    }
  } catch (error: any) {
    console.error("Subuser delete exception:", error);
    throw error;
  }
};