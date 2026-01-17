// SignupPage.tsx - Simplified version
import React, { useState } from "react";
import { SignUp } from "../auth/authSignup";

const SignupPage: React.FC = () => {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    if (!businessName.trim()) return "Please enter your organization name.";
    if (!email.trim()) return "Please enter your email.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Please enter a valid email.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const v = validate();
    if (v) {
      setErrorMsg(v);
      return;
    }
    try {
      setIsSubmitting(true);
      await SignUp(businessName.trim(), email.trim(), password);
      localStorage.setItem('businessName', businessName.trim());
    } catch (err: any) {
      setErrorMsg(err?.message || "Something went wrong while signing up.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md rounded-4xl shadow-lg p-8">
        <h1 className="text-xxl font-bold mb-6 text-primary text-center">
          Create Your Account
        </h1>

        {errorMsg && (
          <div className="mb-4 rounded-lg text-secondary p-3 text-xs">
            {errorMsg}
          </div>
        )}

        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          <div>
            <label className="block mb-2 text-s font-medium" htmlFor="businessName">
              Organization Name
            </label>
            <input
              id="businessName"
              type="text"
              autoComplete="organization"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your Company Name"
              className="w-full px-4 py-3 rounded-lg bg-gray placeholder-text-gray focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block mb-2 text-s" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg bg-gray placeholder-text-gray focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block mb-2 text-s" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"  
                className="w-full px-4 py-3 rounded-lg bg-gray placeholder-text-gray focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 px-3 text-xs text-text hover:bg-primary hover:text-background"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p className="mt-2 text-xxs">
              Must be at least 8 characters.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 mt-2 rounded-lg bg-primary text-light font-semibold transition-colors
              hover:bg-primary-highlight disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>

          <p className="text-center text-xs text-gray-light mt-4">
            Already have an account?{" "}
            <a href="/login" className="hover:text-primary underline decoration-secondary/40">
              Log in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;