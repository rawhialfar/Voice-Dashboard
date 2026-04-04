const LogoutPath = `${import.meta.env.VITE_BACKEND_URL}/auth/logout`;
export const Logout = async () => {
  await fetch(LogoutPath, {
    method: "POST",
  });
  localStorage.removeItem('userEmail');
  localStorage.removeItem('password');
  localStorage.removeItem('onboarding_first_time_user');
  
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "/login";
};
