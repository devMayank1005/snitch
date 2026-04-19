import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hook/useAuth.js";

const IconMail = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const IconError = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const validate = {
  email: (v) => {
    if (!v.trim()) return "Email address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
    return "";
  },
};

function InputField({ id, label, type = "text", name, value, onChange, onBlur, placeholder, icon, error, touched }) {
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
          {icon}
        </span>

        <input
          id={id}
          name={name}
          type={type}
          autoComplete={id}
          required
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`
            w-full pl-10 pr-4 py-3.5 rounded-xl text-[15px]
            bg-zinc-50 dark:bg-zinc-800/50
            border-2 transition-all duration-200 outline-none
            text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500
            ${hasError 
                ? "border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-500/20" 
                : "border-transparent focus:border-indigo-600 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-indigo-600/10 dark:focus:ring-indigo-500/20"
            }
          `}
        />
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

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { handleRequestPasswordReset, auth } = useAuth();
  
  const [form, setForm] = useState({ email: "" });
  const [errors, setErrors] = useState({ email: "" });
  const [touched, setTouched] = useState({ email: false });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validate[name](value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate[name](value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true });
    const emailError = validate.email(form.email);
    setErrors({ email: emailError });
    
    if (emailError) return;
    
    const result = await handleRequestPasswordReset(form.email);
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
                Reset Password
              </h1>
              <p className="text-base text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
                Enter your email to receive a password reset link.
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-violet-600 shadow-xl shadow-indigo-600/20">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Check Your Email</h2>
                <p className="text-zinc-500 dark:text-zinc-400 mb-4">
                  If an account exists with <strong>{form.email}</strong>, we've sent a password reset link. The link expires in 1 hour.
                </p>
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

                <InputField
                  id="email"
                  label="Email Address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="you@example.com"
                  icon={<IconMail />}
                  error={errors.email}
                  touched={touched.email}
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
                    "Send Reset Link"
                  )}
                </button>

                <div className="text-center pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Remember your password?{" "}
                    <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline underline-offset-4">
                      Log in
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
