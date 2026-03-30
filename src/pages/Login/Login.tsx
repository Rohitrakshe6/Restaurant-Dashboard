import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import { Logo } from '../../components/Logo';
import { LogIn, User, UserPlus, KeyRound, ArrowRight, ArrowLeft, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const OtpInput: React.FC<{ length: number; onComplete: (otp: string) => void }> = ({ length, onComplete }) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value.replace(/\D/g, '');
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Focus next input
    if (index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (newOtp.every(v => v !== '')) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, length);
    if (!data) return;

    const newOtp = data.split('');
    const paddedOtp = [...newOtp, ...new Array(length - newOtp.length).fill('')];
    setOtp(paddedOtp);
    
    // Focus last filled or next empty
    const nextIndex = Math.min(newOtp.length, length - 1);
    inputs.current[nextIndex]?.focus();

    if (newOtp.length === length) {
      onComplete(data);
    }
  };

  return (
    <div className="flex justify-center gap-3">
      {otp.map((data, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          ref={(el) => { inputs.current[index] = el; }}
          value={data}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-14 h-16 md:w-16 md:h-20 border-2 rounded-2xl text-center text-3xl font-black text-foreground focus:ring-4 outline-none transition-all"
          style={{ 
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border)',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
        />
      ))}
    </div>
  );
};

export const Login: React.FC = () => {
  const { login, loginAsGuest, sendVerificationCode, verifyCode } = useRestaurantStore();
  
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<'form' | 'otp'>('form');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpValue, setOtpValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      if (email && password) {
        login();
      } else {
        toast.error('Please enter email and password');
      }
    } else {
      if (!name || !email || !password || !confirmPassword) {
        toast.error('Please fill all fields');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (!email.includes('@')) {
        toast.error('Please enter a valid email');
        return;
      }
      
      sendVerificationCode(email, { name, email, password });
      setStep('otp');
    }
  };

  const handleVerifyOtp = (code?: string) => {
    const finalCode = code || otpValue;
    if (finalCode.length === 4) {
      const success = verifyCode(finalCode);
      if (success) {
        toast.success('Account verified!', { icon: '✨' });
      } else {
        toast.error('Invalid verification code');
      }
    }
  };

  const handleGuest = () => {
    loginAsGuest();
  };

  const resetState = () => {
    setIsLogin(!isLogin);
    setStep('form');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setOtpValue('');
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-main)' }}>
      
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[hsl(var(--accent-slate))]/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[hsl(var(--accent-french))]/30 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-[hsl(350,100%,91%)]/40 blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[440px] z-10"
      >
        {/* Branding */}
        <div className="flex flex-col items-center justify-center mb-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Logo size={52} />
          </motion.div>
          <div className="mt-3 flex flex-col items-center">
            <h1 className="font-bold text-[32px] tracking-tight text-foreground leading-none">
              Restroo
            </h1>
            <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] leading-none mt-2.5 ml-[2px]">
              BY ARCHARC
            </span>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-card/70 backdrop-blur-xl border border-border/40 rounded-[32px] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.03)] overflow-hidden p-8 md:p-10 relative">
          
          <AnimatePresence mode="wait">
            {step === 'form' ? (
              <motion.div
                key="form-step"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-10 text-center">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </h2>
                  <p className="text-[15px] font-medium text-muted-foreground/70">
                    {isLogin ? 'Welcome back to Restroo' : 'Start managing your restaurant today'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {!isLogin && (
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-foreground transition-colors">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-muted/20 border border-border/30 rounded-2xl pl-12 pr-4 py-4 focus:bg-background focus:border-foreground/20 focus:ring-4 focus:ring-foreground/5 outline-none transition-all text-[15px] font-medium placeholder:text-muted-foreground/30"
                        placeholder="Full Name"
                      />
                    </div>
                  )}

                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-foreground transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-muted/20 border border-border/30 rounded-2xl pl-12 pr-4 py-4 focus:bg-background focus:border-foreground/20 focus:ring-4 focus:ring-foreground/5 outline-none transition-all text-[15px] font-medium placeholder:text-muted-foreground/30"
                      placeholder="Email Address"
                    />
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-foreground transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-muted/20 border border-border/30 rounded-2xl pl-12 pr-4 py-4 focus:bg-background focus:border-foreground/20 focus:ring-4 focus:ring-foreground/5 outline-none transition-all text-[15px] font-medium placeholder:text-muted-foreground/30"
                      placeholder="Password"
                    />
                  </div>

                  {!isLogin && (
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-foreground transition-colors">
                        <Lock size={18} />
                      </div>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-muted/20 border border-border/30 rounded-2xl pl-12 pr-4 py-4 focus:bg-background focus:border-foreground/20 focus:ring-4 focus:ring-foreground/5 outline-none transition-all text-[15px] font-medium placeholder:text-muted-foreground/30"
                        placeholder="Confirm Password"
                      />
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full py-4.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-[15px] tracking-wide transition-all active:scale-[0.98] shadow-md text-white"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
                  >
                    {isLogin ? (
                      <>Sign In <ArrowRight size={18} /></>
                    ) : (
                      <>Generate OTP <ArrowRight size={18} /></>
                    )}
                  </button>
                </form>

                <div className="mt-8 flex flex-col items-center gap-6">
                  <button 
                    type="button" 
                    onClick={resetState}
                    className="text-[14px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isLogin ? "Create new account" : "Back to Sign In"}
                  </button>

                  {isLogin && (
                    <>
                      <div className="w-full flex items-center opacity-30">
                        <div className="flex-1 border-t border-border"></div>
                        <span className="px-4 text-[10px] font-black uppercase tracking-[0.2em]">OR</span>
                        <div className="flex-1 border-t border-border"></div>
                      </div>

                      <button 
                        onClick={handleGuest}
                        type="button"
                        className="text-[14px] font-bold text-foreground/40 hover:text-foreground transition-colors flex items-center gap-2"
                      >
                        Continue as Guest
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col"
              >
                <button 
                  onClick={() => setStep('form')} 
                  className="mb-8 p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 text-sm font-bold"
                >
                  <ArrowLeft size={16} /> Edit Email
                </button>
                
                <div className="mb-10">
                   <div className="w-14 h-14 bg-muted/40 flex items-center justify-center rounded-[20px] mb-6 text-foreground">
                      <KeyRound size={24} />
                   </div>
                  <h2 className="text-2xl font-bold text-foreground mb-3">
                    Verification Code
                  </h2>
                  <p className="text-[15px] font-medium text-muted-foreground/70 leading-relaxed">
                    We've sent a 4-digit code to <br/>
                    <span className="text-foreground font-semibold">{email}</span>
                  </p>
                </div>

                <div className="space-y-10">
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-black uppercase tracking-widest text-muted-foreground/50 mb-2">Code</label>
                    <OtpInput length={4} onComplete={handleVerifyOtp} />
                  </div>

                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={() => handleVerifyOtp()}
                      className="w-full py-4.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-[15px] tracking-wide transition-all active:scale-[0.98] shadow-md text-white"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
                    >
                      Verify & Register <ArrowRight size={18} />
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => sendVerificationCode(email, { name, email, password })}
                      className="text-sm font-bold text-muted-foreground/60 hover:text-foreground transition-colors"
                    >
                      Didn't receive code? Resend
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Footer Info */}
        <p className="mt-12 text-center text-[13px] font-medium text-muted-foreground/40">
          Secure, minimalist restaurant management dashboard
        </p>
      </motion.div>
    </div>
  );
};
