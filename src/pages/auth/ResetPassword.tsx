import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import PasswordInput from "../../components/common/PasswordInput";
import AuthButton from "../../components/common/AuthButton";
import { resetPasswordApi } from "../../services/auth.service";
import axios from "axios";

interface LocationState {
  identifier?: string;
  code?: string;
}

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { identifier, code } = (location.state as LocationState) || {};

  // Identifier/code na ho to seedha reset flow bypass nahi hone dena
  useEffect(() => {
    if (!identifier || !code) {
      navigate("/forgot-password", { replace: true });
    }
  }, [identifier, code, navigate]);

  const handleSave = async () => {
    setError("");

    if (!identifier || !code) return;
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordApi({ identifier, code, newPassword: password });
      navigate("/auth-success");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Unable to reset password. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Link
        to="/login"
        className="inline-flex items-center gap-2 mb-8 text-sm text-gray-300 hover:text-white transition-colors"
      >
        <ChevronLeft size={22} />
        <span className="text-white font-light">Back</span>
      </Link>

      <h2 className="text-xl sm:text-3xl font-bold mb-2 text-white mt-10">
        New Password
      </h2>

      <p className="text-text-gray text-sm font-light mb-8 leading-relaxed">
        Enter your registered email address. we'll send you a code to reset your
        password.
      </p>

      <div className="space-y-4">
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        {error && <p className="text-red-500 text-sm font-light">{error}</p>}

        <AuthButton onClick={handleSave} className="mt-6" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </AuthButton>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;