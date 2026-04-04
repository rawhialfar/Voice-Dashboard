import { useState } from "react";
import { Login } from "../auth/authLogin";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const validate = () => {
    if (!email.trim()) return "Please enter your email.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Please enter a valid email.";
    if (!password) return "Please enter your password.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) return setErrorMsg(v);

    try {
      setIsSubmitting(true);
      await Login(email.trim(), password);
    } catch (err: any) {
      setErrorMsg(err?.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex items-center bg-background justify-center min-h-screen px-4">
      <div className="w-full max-w-md bg-background rounded-4xl shadow-xl ring-1 ring-gray-500 p-8">
        <h1 className="text-xxl mb-6 text-primary text-center">Welcome back</h1>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="block mb-2 text-s">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-1 border-gray-300 rounded-lg bg-gray text-text placeholder-text-gray focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorMsg?.includes("email") &&
              <div className="rounded-lg text-red-500 pt-2 text-sm">
                {errorMsg}
              </div>
            }
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 text-s">
              Password
            </label>
            <div className="relative border-1 border-gray-300 rounded-lg">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-lg bg-gray placeholder-text-gray focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute  inset-y-0 right-0 px-3 text-xs text-text rounded hover:bg-primary hover:text-background"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errorMsg?.includes("password") &&
              <div className="rounded-lg text-red-500 pt-2 text-sm">
                {errorMsg}
              </div>
            }
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-lg bg-primary text-light font-semibold transition-colors hover:bg-primary-highlight disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Signing in..." : "Login"}
          </button>

          <p className="text-center text-xs mt-4">
            Don’t have an account?<a href="/signup"> Sign up</a>
          </p>
        </form>
      </div>
    </main>
  );
};

export default LoginPage;