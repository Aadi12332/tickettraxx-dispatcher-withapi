import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import CommonInput from "../../components/common/CommonInput";
import { useNavigate } from "react-router-dom";
import AuthButton from "../../components/common/AuthButton";
import { forgotPasswordApi } from "../../services/auth.service";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    setError("");

    if (!email) {
      setError("Please enter your registered email or phone");
      return;
    }

    setLoading(true);
    try {
      await forgotPasswordApi({ identifier: email });
      // identifier ko OTP screen tak state ke through bhejna hai
      navigate("/otp", { state: { identifier: email } });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Unable to send OTP. Please try again.");
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
        Forgot Password
      </h2>

      <p className="text-text-gray text-sm font-light mb-8 leading-relaxed">
        Enter your registered email address. we'll send you a code to reset your
        password.
      </p>

      <div className="space-y-4">
        <CommonInput
          type="email"
          label="Email Address"
          placeholder="tomhenry@abc.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm font-light">{error}</p>}

        <AuthButton onClick={handleSendOtp} className="mt-6" disabled={loading}>
          {loading ? "Sending..." : "Send OTP"}
        </AuthButton>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;