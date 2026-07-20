import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import OtpInput from "react-otp-input";

import AuthLayout from "../../layouts/AuthLayout";
import AuthButton from "../../components/common/AuthButton";
import { verifyOtpApi, forgotPasswordApi } from "../../services/auth.service";
import axios from "axios";

interface LocationState {
  identifier?: string;
}

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { identifier } = (location.state as LocationState) || {};

  // Agar koi seedha /otp pe aa gaya bina identifier ke, use wapas bhejo
  useEffect(() => {
    if (!identifier) {
      navigate("/forgot-password", { replace: true });
    }
  }, [identifier, navigate]);

  const handleVerify = async () => {
    setError("");

    if (!identifier) return;
    if (otp.length < 5) {
      setError("Please enter the complete OTP");
      return;
    }

    setLoading(true);
    try {
      await verifyOtpApi({ identifier, code: otp, purpose: "reset" });
      // Verified code ko ResetPassword screen tak bhejna hai, final /auth/reset call yahi code use karega
      navigate("/reset-password", { state: { identifier, code: otp } });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Invalid OTP. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!identifier) return;
    setError("");
    try {
      await forgotPasswordApi({ identifier });
    } catch {
      setError("Unable to resend OTP right now.");
    }
  };

  return (
    <AuthLayout>
      <Link
        to="/forgot-password"
        className="inline-flex items-center gap-2 mb-8 text-sm text-gray-300 hover:text-white transition-colors"
      >
        <ChevronLeft size={22} />
        <span className="text-white font-light">Back</span>
      </Link>

      <h2 className="text-xl sm:text-3xl font-bold mb-2 text-white mt-10">
        Enter OTP
      </h2>

      <p className="text-(--color-text-gray) text-sm font-light mb-8 leading-relaxed">
        We have share a code of your registered email address {identifier}
      </p>

      <div className="my-5.5">
        <OtpInput
          value={otp}
          onChange={setOtp}
          numInputs={5}
          renderSeparator={<span className="w-5" />}
          renderInput={(props) => (
            <input
              {...props}
              className="
                sm:w-[60px]!
                sm:h-[60px]!
                w-[40px]!
                h-[40px]!
                sm:rounded-2xl rounded-[10px]
                border
                border-(--border-gray)
                bg-(--bg-black)
                text-white
               text-lg md:text-2xl
                font-semibold
                outline-none
                focus:border-primary
              "
            />
          )}
        />
      </div>

      {error && <p className="text-red-500 text-sm font-light mb-4">{error}</p>}

      <button
        type="button"
        onClick={handleResend}
        className="text-sm text-white font-light hover:underline mb-4 block"
      >
        Resend OTP
      </button>

      <AuthButton onClick={handleVerify} className="mt-6" disabled={loading}>
        {loading ? "Verifying..." : "Verify"}
      </AuthButton>
    </AuthLayout>
  );
};

export default OtpVerification;