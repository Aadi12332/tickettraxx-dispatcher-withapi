import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import Logo from "../../assets/images/Logo.svg";
import CommonInput from "../../components/common/CommonInput";
import PasswordInput from "../../components/common/PasswordInput";
import { useState } from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthButton from "../../components/common/AuthButton";
import { loginApi } from "../../services/auth.service";
import { STORAGE_KEYS } from "../../constants/api.constants";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const data = await loginApi({ identifier: email, password });

      // Tokens aur user localStorage me save karo
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Invalid credentials. Please try again."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex justify-center">
        <img src={Logo} alt="Logo" className="" />
      </div>

      <div className="text-center sm:mb-18 mb-10">
        <h2 className="text-xl sm:text-3xl font-bold mb-2 text-white mt-10">
          Welcome
        </h2>
        <p className="text-(--color-text-gray) text-sm font-light">
          Please login here
        </p>
      </div>

      <div className="space-y-6">
        <CommonInput
          label="Email Address"
          placeholder="tomhenry@abc.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••••••"
        />

        {error && (
          <p className="text-red-500 text-sm font-light">{error}</p>
        )}

        <div className="flex items-center justify-between mt-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center w-5 h-5">
              <input
                type="checkbox"
                className="peer appearance-none w-5 h-5 rounded border border-gray-600 bg-transparent checked:bg-sky-blue checked:border-sky-blue cursor-pointer transition-colors"
                defaultChecked
              />
              <Check
                strokeWidth={5}
                className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
              />
            </div>
            <span className="text-sm text-white group-hover:text-white transition-colors font-light">
              Remember Me
            </span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm text-white font-light hover:text-white transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <AuthButton onClick={handleLogin} className="mt-6" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </AuthButton>
      </div>
    </AuthLayout>
  );
};

export default Login;