const LoginPath = `${import.meta.env.VITE_BACKEND_URL}/auth/login`;
import { getSubscription } from "../api/stripe";
import { ONBOARDING_KEYS } from "../components/Onboarding/OnboardingManager";

export const Login = async (email: string, password: string) => {
  try {
    const response = await fetch(LoginPath, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    if (!response) {
      alert("Network Error");
      return;
    }

    if (response.ok) {
      const data = await response.json();
      
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem(ONBOARDING_KEYS.FIRST_TIME_USER, 'false');
      
      window.location.href = "/";
      
    } else {
      const error = await response.text();
      console.error("Login failed:", error);
      alert(`Login failed: ${error.split(':"')[1].split('"')[0]}`);
    }
  } catch (error) {
    console.error("Login exception:", error);
  }
};
