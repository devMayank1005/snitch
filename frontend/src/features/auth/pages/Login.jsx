import { useState } from "react";
import { useAuth } from "../hook/useAuth.js";
import { useNavigate, Link } from "react-router";
import GoogleOAuthButton from "../components/GoogleOAuthButton.jsx";

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
function InputField({ id, label, type = "text", name, value, onChange, onBlur, placeholder, error, touched, rightEl }) {
  const hasError = touched && error;
  
  return (
    <div className="flex flex-col gap-2 relative">
      <label htmlFor={id} className="text-xs uppercase tracking-[0.2em] font-medium" style={{ color: '#7A6E63' }}>
        {label}
      </label>
      <div className="relative flex items-center">
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
          className={`w-full bg-transparent border-b py-3 text-[15px] outline-none transition-colors duration-300 ${
            hasError
                ? "border-red-500 text-red-500 placeholder-red-300"
                : "border-[#d0c5b5] text-[#1b1c1a] placeholder-[#d0c5b5] focus:border-[#C9A96E]"
          }`}
        />
        {rightEl && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2">{rightEl}</div>
        )}
      </div>

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: hasError ? "40px" : "0px", opacity: hasError ? 1 : 0 }}
      >
        <p className="text-[11px] uppercase tracking-wider text-red-500 mt-1">
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
  const [rememberMe, setRememberMe] = useState(false);

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
      rememberMe,
    });

    if (result && result.success) {
      setSubmitted(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500); 
    }
  };

  return (
    <>
      {/* Google Fonts injected directly for auth pages if not globally loaded yet */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      <div className="min-h-screen grid lg:grid-cols-2" style={{ backgroundColor: '#fbf9f6', fontFamily: "'Inter', sans-serif" }}>
        
        {/* ── Visual Left Side (Image) ── */}
        <div className="hidden lg:flex relative overflow-hidden bg-[#f5f3f0]">
          <img 
            src="/images/fashion-bg.png" 
            alt="Fashion Editorial" 
            className="w-full h-full object-cover grayscale-[30%] hover:scale-105 transition-transform duration-[20s] ease-linear"
          />
        </div>

        {/* ── Form Right Side ── */}
        <div className="flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative overflow-y-auto">
          
          <div className="max-w-md w-full mx-auto">
            {/* Top Back Nav / Logo */}
            <div className="mb-16 flex items-center gap-5">
                <button
                    onClick={() => navigate('/')}
                    className="text-lg transition-colors duration-200 leading-none"
                    style={{ color: '#B5ADA3' }}
                    aria-label="Go home"
                    onMouseEnter={e => e.currentTarget.style.color = '#C9A96E'}
                    onMouseLeave={e => e.currentTarget.style.color = '#B5ADA3'}
                >
                    ←
                </button>
                <span
                    className="text-[10px] tracking-[0.32em] uppercase font-medium"
                    style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C9A96E' }}
                >
                    Snitch.
                </span>
            </div>

            <div className="mb-12">
              <h1 className="text-4xl lg:text-5xl font-light leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                Welcome Back
              </h1>
              <div className="mt-6 w-12 h-px" style={{ backgroundColor: '#C9A96E' }} />
              <p className="text-[13px] leading-relaxed mt-6" style={{ color: '#7A6E63' }}>
                Log in to access your curated archive and seamless checkout flow.
              </p>
            </div>

            {submitted ? (
              <div className="py-12 fade-in">
                <h2 className="text-2xl font-light mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>Access Granted</h2>
                <div className="w-8 h-px bg-[#C9A96E] mb-6"></div>
                <p className="text-[13px]" style={{ color: '#7A6E63' }}>Welcome back. Routing to your dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
                {auth?.error && (
                  <div className="border border-red-500/30 bg-red-500/5 p-4 text-[12px] uppercase tracking-wider text-red-600">
                    {auth.error}
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
                  placeholder=""
                  error={errors.email}
                  touched={touched.email}
                />

                <div className="relative">
                  <div className="absolute right-0 top-0">
                    <Link to="/forgot-password" className="text-[10px] uppercase tracking-wider font-medium hover:underline underline-offset-4" style={{ color: '#C9A96E' }}>
                      Forgot pass?
                    </Link>
                  </div>
                  <InputField
                    id="password"
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder=""
                    error={errors.password}
                    touched={touched.password}
                    rightEl={
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="text-[10px] uppercase tracking-wider font-medium px-2 py-1 transition-colors"
                        style={{ color: '#B5ADA3' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#1b1c1a'}
                        onMouseLeave={e => e.currentTarget.style.color = '#B5ADA3'}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    }
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <input
                      id="rememberMe"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only peer"
                    />
                    <label
                      htmlFor="rememberMe"
                      className="flex items-center justify-center w-4 h-4 border cursor-pointer transition-all duration-200"
                      style={{ 
                          borderColor: rememberMe ? '#1b1c1a' : '#d0c5b5',
                          backgroundColor: rememberMe ? '#1b1c1a' : 'transparent' 
                      }}
                    >
                      <svg className={`w-2.5 h-2.5 text-white transition-opacity ${rememberMe ? 'opacity-100' : 'opacity-0'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </label>
                  </div>
                  <label htmlFor="rememberMe" className="text-[11px] uppercase tracking-widest cursor-pointer select-none" style={{ color: '#7A6E63' }}>
                    Remember me
                  </label>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={auth?.loading}
                    className="w-full py-5 text-[11px] uppercase tracking-[0.3em] font-medium transition-all duration-300 text-center"
                    style={{
                        backgroundColor: '#1b1c1a',
                        color: '#fbf9f6',
                    }}
                    onMouseEnter={e => {
                        if (!auth?.loading) {
                            e.currentTarget.style.backgroundColor = '#C9A96E';
                            e.currentTarget.style.color = '#1b1c1a';
                        }
                    }}
                    onMouseLeave={e => {
                        if (!auth?.loading) {
                            e.currentTarget.style.backgroundColor = '#1b1c1a';
                            e.currentTarget.style.color = '#fbf9f6';
                        }
                    }}
                  >
                    {auth?.loading ? "Authenticating..." : "Sign In"}
                  </button>
                </div>

                <div className="flex items-center gap-4 my-2">
                  <div className="flex-1 border-t border-[#d0c5b5]"></div>
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: '#B5ADA3' }}>Or</span>
                  <div className="flex-1 border-t border-[#d0c5b5]"></div>
                </div>

                <div className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                    <GoogleOAuthButton />
                </div>

              </form>
            )}

            {!submitted && (
              <div className="mt-16 text-center">
                <p className="text-[11px] uppercase tracking-widest" style={{ color: '#7A6E63' }}>
                  New to Snitch?{" "}
                  <Link to="/register" className="ml-2 font-medium transition-colors" style={{ color: '#1b1c1a' }} onMouseEnter={e => e.currentTarget.style.color = '#C9A96E'} onMouseLeave={e => e.currentTarget.style.color = '#1b1c1a'}>
                    Create Account
                  </Link>
                </p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </>
  );
}
