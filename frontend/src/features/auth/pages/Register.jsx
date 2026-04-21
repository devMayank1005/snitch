import { useState } from "react";
import { useAuth } from "../hook/useAuth.js";
import { useNavigate, Link } from "react-router";
import GoogleOAuthButton from "../components/GoogleOAuthButton.jsx";

/* ─── validators ─── */
const validate = {
  fullName: (v) => {
    if (!v.trim()) return "Full name is required.";
    if (v.trim().length < 2) return "Name must be at least 2 characters.";
    return "";
  },
  email: (v) => {
    if (!v.trim()) return "Email address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
    return "";
  },
  contact: (v) => {
    if (!v.trim()) return "Contact number is required.";
    if (!/^[0-9]{10}$/.test(v.trim())) return "Enter a valid 10-digit phone number.";
    return "";
  },
  password: (v) => {
    if (!v) return "Password is required.";
    if (v.length < 8) return "Min. 8 characters.";
    if (!/[A-Z]/.test(v)) return "Min. 1 uppercase.";
    if (!/[a-z]/.test(v)) return "Min. 1 lowercase.";
    if (!/[0-9]/.test(v)) return "Min. 1 number.";
    if (!/[@$!%*?&]/.test(v)) return "Min. 1 special character.";
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

/* ─── Main Register Page ─── */
export default function Register() {
  const navigate = useNavigate();
  const { handleRegister, handleResendVerificationEmail, auth } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSeller, setIsSeller] = useState(false);

  const [form, setForm] = useState({ fullName: "", email: "", contact: "", password: "" });
  const [errors, setErrors] = useState({ fullName: "", email: "", contact: "", password: "" });
  const [touched, setTouched] = useState({ fullName: false, email: false, contact: false, password: false });
  const [submitted, setSubmitted] = useState(false);
  const [resendStatus, setResendStatus] = useState({ message: "", isError: false });

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
    const allTouched = { fullName: true, email: true, contact: true, password: true };
    const allErrors = {
      fullName: validate.fullName(form.fullName),
      email: validate.email(form.email),
      contact: validate.contact(form.contact),
      password: validate.password(form.password),
    };
    setTouched(allTouched);
    setErrors(allErrors);
    
    if (Object.values(allErrors).some(Boolean)) return;
    
    const result = await handleRegister({
      email: form.email,
      contact: form.contact,
      password: form.password,
      fullName: form.fullName,
      isSeller
    });

    if (result && result.success) {
      setSubmitted(true);
      setResendStatus({ message: "", isError: false });
    }
  };

  const handleResendEmail = async () => {
    setResendStatus({ message: "", isError: false });
    const result = await handleResendVerificationEmail(form.email);

    if (result.success) {
      setResendStatus({ message: result.message, isError: false });
      return;
    }
    setResendStatus({ message: result.error, isError: true });
  };

  return (
    <>
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
        <div className="flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative overflow-y-auto max-h-screen">
          
          <div className="max-w-md w-full mx-auto">
            {/* Top Back Nav / Logo */}
            <div className="mb-12 flex items-center gap-5">
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
                Join The Archive
              </h1>
              <div className="mt-6 w-12 h-px" style={{ backgroundColor: '#C9A96E' }} />
              <p className="text-[13px] leading-relaxed mt-6" style={{ color: '#7A6E63' }}>
                Curate your wardrobe by establishing an authenticated account.
              </p>
            </div>

            {submitted ? (
              <div className="py-8 fade-in">
                <h2 className="text-2xl font-light mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>Identity Recorded</h2>
                <div className="w-8 h-px bg-[#C9A96E] mb-6"></div>
                
                <p className="text-[13px] leading-relaxed mb-8" style={{ color: '#7A6E63' }}>
                  An authentication link has been dispatched to <strong className="text-[#1b1c1a]">{form.email}</strong>.<br/>
                  Please verify your credentials to activate your access.
                </p>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => window.open(`https://mail.google.com` , '_blank')}
                    className="py-3 px-6 text-[10px] uppercase tracking-[0.2em] font-medium transition-all duration-300"
                    style={{ backgroundColor: '#1b1c1a', color: '#fbf9f6' }}
                    onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#C9A96E';
                        e.currentTarget.style.color = '#1b1c1a';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = '#1b1c1a';
                        e.currentTarget.style.color = '#fbf9f6';
                    }}
                  >
                    Open Mail
                  </button>
                  <button
                    onClick={handleResendEmail}
                    disabled={auth?.loading}
                    className="py-3 px-6 text-[10px] uppercase tracking-[0.2em] font-medium transition-colors border"
                    style={{ borderColor: '#d0c5b5', color: '#7A6E63' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#1b1c1a'}
                    onMouseLeave={e => e.currentTarget.style.color = '#7A6E63'}
                  >
                    {auth?.loading ? "Transmitting..." : "Resend Link"}
                  </button>
                </div>

                {resendStatus.message && (
                  <p className={`mt-6 text-[11px] uppercase tracking-wider ${resendStatus.isError ? "text-red-500" : "text-[#745a27]"}`}>
                    {resendStatus.message}
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
                {auth?.error && (
                  <div className="border border-red-500/30 bg-red-500/5 p-4 text-[12px] uppercase tracking-wider text-red-600">
                    {auth.error}
                  </div>
                )}

                <InputField
                  id="fullName"
                  label="Full Name"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder=""
                  error={errors.fullName}
                  touched={touched.fullName}
                />

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

                <InputField
                  id="contact"
                  label="Contact"
                  name="contact"
                  type="tel"
                  value={form.contact}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder=""
                  error={errors.contact}
                  touched={touched.contact}
                />

                <div className="relative">
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

                {/* Seller Toggle */}
                <div className="flex items-center justify-between border-t border-b border-[#d0c5b5] py-4 mt-2">
                    <div className="flex flex-col">
                        <span className="text-[12px] uppercase tracking-widest font-medium" style={{ color: '#1b1c1a' }}>Seller Account</span>
                        <span className="text-[11px] mt-1" style={{ color: '#7A6E63' }}>Request curation privileges.</span>
                    </div>
                    <div className="flex-shrink-0">
                        <input
                            id="isSeller"
                            type="checkbox"
                            checked={isSeller}
                            onChange={(e) => setIsSeller(e.target.checked)}
                            className="sr-only peer"
                        />
                        <label
                            htmlFor="isSeller"
                            className="relative inline-flex items-center cursor-pointer w-10 h-5 bg-transparent border transition-colors duration-300"
                            style={{ borderColor: isSeller ? '#C9A96E' : '#d0c5b5', backgroundColor: isSeller ? '#C9A96E' : 'transparent' }}
                        >
                            <span 
                                className="inline-block w-3 h-3 bg-[#1b1c1a] transition-transform duration-300 transform"
                                style={{ transform: isSeller ? 'translateX(22px)' : 'translateX(3px)' }}
                            />
                        </label>
                    </div>
                </div>

                <div className="pt-2">
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
                    {auth?.loading ? "Processing..." : "Commit Standard"}
                  </button>
                </div>

                <div className="flex items-center gap-4 my-1">
                  <div className="flex-1 border-t border-[#d0c5b5]"></div>
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: '#B5ADA3' }}>Or Via Google</span>
                  <div className="flex-1 border-t border-[#d0c5b5]"></div>
                </div>

                <div className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                    <GoogleOAuthButton />
                </div>

              </form>
            )}

            {!submitted && (
              <div className="mt-12 text-center">
                <p className="text-[11px] uppercase tracking-widest" style={{ color: '#7A6E63' }}>
                  Already Registered?{" "}
                  <Link to="/login" className="ml-2 font-medium transition-colors" style={{ color: '#1b1c1a' }} onMouseEnter={e => e.currentTarget.style.color = '#C9A96E'} onMouseLeave={e => e.currentTarget.style.color = '#1b1c1a'}>
                    Authenticate
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
