import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      // Save authentication token
      localStorage.setItem("token", token);

      // Save complete logged-in user including profile image
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone || "",
          profileImage: user.profileImage || "",
        }),
      );

      // Tell navbar/dashboard that user data has changed
      window.dispatchEvent(new Event("profileUpdated"));

      // Redirect according to role
      if (user.role === "student") {
        navigate("/student/dashboard");
      } else if (user.role === "teacher") {
        navigate("/teacher/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);

      setMessage(error.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center px-6 py-4">
          <div className="flex h-14 w-14 items-center justify-center border border-gray-300 bg-gray-50">
            <span className="text-xl font-bold text-blue-900">TC</span>
          </div>

          <div className="ml-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Texas College
            </h1>

            <p className="text-sm text-gray-500">College Portal</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex min-h-[calc(100vh-83px)] items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          {/* Portal heading */}
          <div className="mb-7 text-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              Portal Login
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Sign in to access your college account
            </p>
          </div>

          {/* Login box */}
          <div className="border border-gray-200 bg-white p-7 shadow-sm sm:p-9">
            {message && (
              <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {message}
              </div>
            )}

            <form onSubmit={handleLogin}>
              {/* Email */}
              <div className="mb-5">
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  className="w-full border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setMessage(
                        "Password reset option will be available soon.",
                      )
                    }
                    className="text-sm text-blue-800 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="w-full border border-gray-300 bg-white px-3 py-3 pr-16 text-sm text-gray-900 outline-none transition focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-900"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <div className="mb-6 flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 border-gray-300 text-blue-800 focus:ring-blue-800"
                />

                <label
                  htmlFor="remember"
                  className="ml-2 text-sm text-gray-600"
                >
                  Remember me
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Register */}
            <div className="mt-6 border-t border-gray-200 pt-5 text-center">
              <p className="text-sm text-gray-600">Don't have an account?</p>

              <Link
                to="/register"
                className="mt-1 inline-block text-sm font-medium text-blue-800 hover:underline"
              >
                Create an account
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-gray-500">
            Texas College Portal
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
