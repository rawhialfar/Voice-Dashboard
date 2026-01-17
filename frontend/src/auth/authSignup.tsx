// api/signup.ts
const SignupPath = `${import.meta.env.VITE_BACKEND_URL}/auth/signup`;
import { ONBOARDING_KEYS } from "../components/Onboarding/OnboardingManager";
export const SignUp = async (businessName: string, email: string, password: string) => {

  try {
    const response = await fetch(SignupPath, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({email, password, businessName}),
      credentials: 'include'
    });

    if (!response) {
      alert("Network Error");
      return;
    }
    
    if (response.ok) {
      const data = await response.json();
      
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem(ONBOARDING_KEYS.FIRST_TIME_USER, 'true');
    
      window.location.href = "/plan";
      return data;
    } 
    else {
      const error = await response.text();
      console.error("Signup failed:", error);
      
      alert(`Login failed: ${error.split(':"')[1].split('"')[0]}`);
    }
  } catch (error) {
    console.error("Signup exception:", error);
  }
};