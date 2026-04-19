import { useState } from "react";
import { useAuth } from "../hook/useAuth.js";
import { useNavigate, Link } from "react-router";

/* ─── tiny SVG icons ─── */
const IconMail = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
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
  <svg className="
  w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

/* ─── validators ─── */
const validate = {
  email: (v) => {
    if (!v.trim()) return "Email address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
    return "";
  },
  password: (v) => {
    if (!v) return "Password is required.";
    return "";
  },
};

/* ─── InputField component ─── */
function InputField({ id, label, type = "text", name, value, onChange, onBlur, placeholder, icon, error, touched, rightEl }) {
  const hasError = touched && error;
  
  return (
    <div className="flex flex-col gap-1.5 focus-within:z-10 relative">
      <label htmlFor={id} className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
        {label}
      </label>
      <div className="relative flex items-center group">
        {/* Left icon */}
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

        {/* Right slot (show/hide toggle) */}
        {rightEl && (
          <div className="absolute right-3.5">{rightEl}</div>
        )}
      </div>

      {/* Inline error */}
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

/* ─── Main Login Page ─── */
export default function Login() {
  const navigate = useNavigate();
  const { handleLogin, auth } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });
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
    // Touch all fields
    const allTouched = { email: true, password: true };
    const allErrors = {
      email: validate.email(form.email),
      password: validate.password(form.password),
    };
    setTouched(allTouched);
    setErrors(allErrors);
    
    if (Object.values(allErrors).some(Boolean)) return;
    
    const result = await handleLogin({
      email: form.email,
      password: form.password,
    });

    if (result && result.success) {
      setSubmitted(true);
      setTimeout(() => {
        navigate("/");
      }, 1500); // Redirect after short delay to show success animation
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div className="min-h-screen grid lg:grid-cols-2 font-[Inter,sans-serif] bg-white dark:bg-zinc-950 transition-colors duration-300">
        
        {/* ── Visual Left Side (Image) ── */}
        <div className="relative hidden lg:flex flex-col justify-end p-16 bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
          <div className="absolute inset-0 z-0">
            {/* Background Image */}
            <img 
              src="/images/fashion-bg.png" 
              alt="Fashion Editorial" 
              className="w-full h-full object-cover object-center"
            />
            {/* Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          </div>
          
          <div className="relative z-10 text-white max-w-xl">
            <h2 className="text-5xl font-extrabold tracking-tight mb-4">
              Define your aesthetic.
            </h2>
            <p className="text-lg text-zinc-300 leading-relaxed font-medium">
              Join the exclusive community of fashion-forward individuals. Curate your wardrobe, set the trends, and express your true self without boundaries.
            </p>
            
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800"></div>
                <div className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-700"></div>
                <div className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-600"></div>
              </div>
              <span className="text-sm font-semibold tracking-wide">Join 10k+ trendsetters</span>
            </div>
          </div>
        </div>

        {/* ── Form Right Side ── */}
        <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16 w-full">
          <div className="w-full max-w-[480px]">
            
            {/* Mobile-only header image (visible only on small screens) */}
            <div className="lg:hidden absolute top-0 left-0 w-full h-64 z-0">
               <img 
                src="/images/fashion-bg.png" 
                alt="Fashion Editorial" 
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-white dark:to-zinc-950"></div>
            </div>

            <div className="relative z-10 w-full bg-white dark:bg-zinc-900/60 backdrop-blur-xl sm:rounded-3xl p-2 sm:p-8 sm:border sm:border-zinc-200 sm:dark:border-zinc-800 sm:shadow-2xl mt-24 lg:mt-0">
              
              {/* Brand Logo */}
              <div className="mb-8">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-600/30 text-white">
                  <span className="text-2xl font-black tracking-tighter leading-none">S</span>
                </div>
                
                <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  Welcome Back
                </h1>
                <p className="text-base text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
                  Log in to access your curated wardrobe.
                </p>
              </div>

              {submitted ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-violet-600 shadow-xl shadow-indigo-600/20">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Logged In!</h2>
                  <p className="text-zinc-500 dark:text-zinc-400">Welcome back to Snitch 🎉</p>
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

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="password" className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
                        Password
                      </label>
                      <a href="#" className="text-[13px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-4">
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative flex items-center group focus-within:z-10">
                      <span
                        className={`absolute left-3.5 transition-colors duration-200 ${
                          (touched.password && errors.password) ? "text-red-500" : "text-zinc-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400"
                        }`}
                      >
                        <IconLock />
                      </span>

                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={form.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter your password"
                        className={`
                          w-full pl-10 pr-11 py-3.5 rounded-xl text-[15px]
                          bg-zinc-50 dark:bg-zinc-800/50
                          border-2 transition-all duration-200 outline-none
                          text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500
                          ${(touched.password && errors.password)
                              ? "border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-500/20" 
                              : "border-transparent focus:border-indigo-600 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-indigo-600/10 dark:focus:ring-indigo-500/20"
                          }
                        `}
                      />

                      <div className="absolute right-3.5">
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className="text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/40"
                        >
                          {showPassword ? <IconEyeOff /> : <IconEye />}
                        </button>
                      </div>
                    </div>

                    <div
                      className="overflow-hidden transition-all duration-300 ease-in-out"
                      style={{ maxHeight: (touched.password && errors.password) ? "40px" : "0px", opacity: (touched.password && errors.password) ? 1 : 0 }}
                    >
                      <p className="flex items-start gap-1 text-[13px] font-medium text-red-500 mt-1.5">
                        <IconError />
                        {errors.password}
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={auth?.loading}
                    className="mt-4 w-full flex items-center justify-center py-4 px-6 rounded-xl text-white font-bold text-[15px] tracking-wide bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-all duration-200 shadow-xl shadow-zinc-900/10 dark:shadow-indigo-600/20 active:scale-[0.98] outline-none focus:ring-4 focus:ring-zinc-900/20 dark:focus:ring-indigo-600/30 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {auth?.loading ? (
                      <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                    ) : (
                      "Log In"
                    )}
                  </button>
                </form>
              )}

              {/* Footer text */}
              {!submitted && (
                <div className="mt-8 text-center space-y-4">
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline underline-offset-4">
                      Create one
                    </Link>
                  </p>
                </div>
              )}
            </div>
            
            <p className="text-center text-xs text-zinc-500 dark:text-zinc-500 mt-8 relative z-10">
              By logging in, you agree to our <a href="#" className="underline hover:text-zinc-900 dark:hover:text-zinc-300">Terms of Service</a> & <a href="#" className="underline hover:text-zinc-900 dark:hover:text-zinc-300">Privacy Policy</a>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}
