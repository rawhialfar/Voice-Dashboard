const SubuserCreatePath = `${import.meta.env.VITE_BACKEND_URL}/auth/subusercreate`;

export interface SubuserCreatePayload {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  permissions?: number;
}

export interface SubuserCreateResponse {
  message: string;
  user?: {
    email: string;
    firstname: string;
    lastname: string;
  };
}

export const subuserCreate = async (payload: SubuserCreatePayload): Promise<SubuserCreateResponse> => {
  try {
    const response = await fetch(SubuserCreatePath, {
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
      console.log("Subuser created successfully:", data);
      return data;
    } else {
      // Handle different error statuses
      if (response.status === 405) {
        throw new Error("Maximum number of users reached for your subscription plan");
      } else if (response.status === 400) {
        throw new Error("User with this email already exists");
      } else if (response.status === 404) {
        throw new Error("Failed to create user - organization not found");
      } else if (response.status === 403) {
        throw new Error("You don't have permission to create users");
      } else {
        // Try to get error message from response
        const errorText = await response.text();
        throw new Error(errorText || `Failed to create user: ${response.status}`);
      }
    }
  } catch (error: any) {
    console.error("Subuser create exception:", error);
    throw error;
  }
};