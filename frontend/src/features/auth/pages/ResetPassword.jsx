import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../hook/useAuth.js";

const IconLock = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const IconEye = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const IconEyeOff = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const IconError = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const validate = {
  newPassword: (v) => {
    if (!v) return "Password is required.";
    if (v.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(v)) return "Include at least one uppercase letter.";
    if (!/[a-z]/.test(v)) return "Include at least one lowercase letter.";
    if (!/[0-9]/.test(v)) return "Include at least one number.";
    if (!/[@$!%*?&]/.test(v)) return "Include at least one special character (@$!%*?&).";
    return "";
  },
  confirmPassword: (v, newPassword) => {
    if (!v) return "Please confirm your password.";
    if (v !== newPassword) return "Passwords do not match.";
    return "";
  },
};

function PasswordField({ id, label, value, onChange, onBlur, showPassword, onToggleShow, error, touched }) {
  const hasError = touched && error;
  
  return (
    <div className="flex flex-col gap-1.5 focus-within:z-10 relative">
      <label htmlFor={id} className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
        {label}
      </label>
      <div className="relative flex items-center group">
        <span
          className={`absolute left-3.5 transition-colors duration-200 ${
            hasError ? "text-red-500" : "text-zinc-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400"
          }`}
        >
          <IconLock />
        </span>

        <input
          id={id}
          type={showPassword ? "text" : "password"}
          required
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="Min. 8 characters"
          className={`
            w-full pl-10 pr-11 py-3.5 rounded-xl text-[15px]
            bg-zinc-50 dark:bg-zinc-800/50
            border-2 transition-all duration-200 outline-none
            text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500
            ${hasError 
                ? "border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-500/20" 
                : "border-transparent focus:border-indigo-600 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-indigo-600/10 dark:focus:ring-indigo-500/20"
            }
          `}
        />

        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/40"
        >
          {showPassword ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: hasError ? "40px" : "0px", opacity: hasError ? 1 : 0 }}
      >
        <p className="flex items-start gap-1 text-[13px] font-medium text-red-500">
          <IconError />
          {error}
        </p>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { handleResetPassword, auth } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({ newPassword: "", confirmPassword: "" });
  const [touched, setTouched] = useState({ newPassword: false, confirmPassword: false });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      if (name === "confirmPassword") {
        setErrors((prev) => ({ ...prev, [name]: validate[name](value, form.newPassword) }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: validate[name](value) }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (name === "confirmPassword") {
      setErrors((prev) => ({ ...prev, [name]: validate[name](value, form.newPassword) }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: validate[name](value) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = { newPassword: true, confirmPassword: true };
    const allErrors = {
      newPassword: validate.newPassword(form.newPassword),
      confirmPassword: validate.confirmPassword(form.confirmPassword, form.newPassword),
    };
    setTouched(allTouched);
    setErrors(allErrors);
    
    if (Object.values(allErrors).some(Boolean)) return;
    
    const result = await handleResetPassword(token, form.newPassword, form.confirmPassword);
    if (result.success) {
      setSubmitted(true);
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div className="min-h-screen flex items-center justify-center font-[Inter,sans-serif] bg-white dark:bg-zinc-950 transition-colors duration-300 p-6">
        <div className="w-full max-w-[500px]">
          <div className="rounded-3xl p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            
            {/* Brand Logo */}
            <div className="mb-8">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-600/30 text-white">
                <span className="text-2xl font-black tracking-tighter leading-none">S</span>
              </div>
              <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Create New Password
              </h1>
              <p className="text-base text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
                Enter a strong password to secure your account.
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-green-600 to-emerald-600 shadow-xl shadow-green-600/20">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Password Reset!</h2>
                <p className="text-zinc-500 dark:text-zinc-400 mb-6">Your password has been reset successfully.</p>
                <button
                  onClick={() => navigate("/login")}
                  className="inline-block px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                {auth?.error && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium flex items-start gap-2">
                    <IconError />
                    <span>{auth.error}</span>
                  </div>
                )}

                <PasswordField
                  id="newPassword"
                  label="New Password"
                  value={form.newPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  showPassword={showPassword}
                  onToggleShow={() => setShowPassword((p) => !p)}
                  error={errors.newPassword}
                  touched={touched.newPassword}
                />

                {form.newPassword && (
                  <ul className="space-y-1 ml-1">
                    {[
                      { ok: form.newPassword.length >= 8, label: "At least 8 characters" },
                      { ok: /[A-Z]/.test(form.newPassword), label: "One uppercase letter" },
                      { ok: /[a-z]/.test(form.newPassword), label: "One lowercase letter" },
                      { ok: /[0-9]/.test(form.newPassword), label: "One number" },
                      { ok: /[@$!%*?&]/.test(form.newPassword), label: "One special character" },
                    ].map(({ ok, label }) => (
                      <li key={label} className="flex items-center gap-2 text-xs font-medium">
                        <span className={ok ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-300 dark:text-zinc-600"}>
                          {ok ? "✓" : "○"}
                        </span>
                        <span className={ok ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500 dark:text-zinc-400"}>
                          {label}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <PasswordField
                  id="confirmPassword"
                  label="Confirm Password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  showPassword={showConfirmPassword}
                  onToggleShow={() => setShowConfirmPassword((p) => !p)}
                  error={errors.confirmPassword}
                  touched={touched.confirmPassword}
                />

                <button
                  type="submit"
                  disabled={auth?.loading}
                  className="w-full flex items-center justify-center py-4 px-6 rounded-xl text-white font-bold text-[15px] tracking-wide bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-all duration-200 shadow-xl shadow-zinc-900/10 dark:shadow-indigo-600/20 active:scale-[0.98] outline-none focus:ring-4 focus:ring-zinc-900/20 dark:focus:ring-indigo-600/30 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {auth?.loading ? (
                    <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
