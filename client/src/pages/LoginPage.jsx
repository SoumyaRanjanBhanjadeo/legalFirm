import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Mail, Lock, Eye, EyeOff, ArrowLeft, Shield, Users, Calendar, FileText, Bell, Database, Key } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
import authService from '../services/auth/authService';
import toast from 'react-hot-toast';

const LoginPage = () => {
    // Current step in the flow. Allowed values: 'login', 'forgot_email', 'forgot_otp', 'forgot_password'
    const [step, setStep] = useState('login');
    const [loading, setLoading] = useState(false);

    // Login state
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Forgot password state
    const [forgotEmail, setForgotEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const otpRefs = useRef([]);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Reset state when changing steps
    useEffect(() => {
        if (step !== 'forgot_otp') {
            setOtp(['', '', '', '', '', '']);
        }
        if (step !== 'forgot_password') {
            setNewPassword('');
            setConfirmPassword('');
        }
    }, [step]);

    // Focus first OTP input when opening OTP step
    useEffect(() => {
        if (step === 'forgot_otp' && otpRefs.current[0]) {
            otpRefs.current[0].focus();
        }
    }, [step]);

    // Handle standard login
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!identifier || !password) {
            toast.error('Please enter your email/name and password');
            return;
        }

        setLoading(true);

        try {
            const response = await authService.login(identifier, password);
            dispatch(login({
                user: response.data.user,
                token: response.data.token
            }));
            toast.success('Login successful!!!');
            navigate('/dashboard');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(errorMessage);
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle Forgot Password Email Submission
    const handleForgotEmailSubmit = async (e) => {
        e.preventDefault();
        if (!forgotEmail) {
            toast.error('Please enter your email');
            return;
        }

        setLoading(true);
        try {
            await authService.forgotPassword(forgotEmail);
            toast.success('OTP sent to your email!');
            setStep('forgot_otp');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // OTP Input Change Handler
    const handleOtpChange = (index, value) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1); // Allow only the last entered digit
        setOtp(newOtp);

        // Move to next input if filled
        if (value && index < 5) {
            otpRefs.current[index + 1].focus();
        }

        // Auto verify if this is the last digit and others are filled
        if (value && index === 5 && newOtp.every(digit => digit !== '')) {
            verifyOtpAutomatically(newOtp.join(''));
        }
    };

    // Handle OTP Keyboard Events (Backspace)
    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1].focus();
        }
    };

    // Auto verification when 6 digits are provided
    const verifyOtpAutomatically = async (otpString) => {
        setLoading(true);
        try {
            await authService.verifyOTP(forgotEmail, otpString);
            toast.success('OTP verified successfully!');
            setStep('forgot_password');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Invalid or expired OTP.';
            toast.error(errorMessage);
            // Optionally clear OTP if invalid
            setOtp(['', '', '', '', '', '']);
            if (otpRefs.current[0]) otpRefs.current[0].focus();
        } finally {
            setLoading(false);
        }
    };

    // Manual Verify OTP Submit
    const handleVerifyOtpSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            toast.error('Please enter the complete 6-digit OTP');
            return;
        }
        await verifyOtpAutomatically(otpString);
    };

    // Handle Reset Password Submission
    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();

        if (!newPassword || !confirmPassword) {
            toast.error('Please fill in both password fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword(forgotEmail, newPassword);
            toast.success('Password reset successfully! Please log in.');
            setStep('login');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: Shield, title: 'Secure Access', description: 'Role-based authentication' },
        { icon: Users, title: 'Client Management', description: 'Centralized client data' },
        { icon: Calendar, title: 'Hearing Schedule', description: 'Never miss a date' },
        { icon: FileText, title: 'Case Files', description: 'Organized documentation' },
        { icon: Bell, title: 'Notifications', description: 'Real-time updates' },
        { icon: Database, title: 'Data Analytics', description: 'Insights & reports' },
    ];

    // Helper functions to render different steps
    const renderLoginForm = () => (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
                <label htmlFor="identifier" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Email or Name
                </label>
                <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-gold" style={{ color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        id="identifier"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all duration-300 text-sm"
                        style={{
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            borderColor: 'var(--border-color)'
                        }}
                        placeholder="Enter email or name"
                        disabled={loading}
                        required
                    />
                </div>
            </div>

            <div>
                <label htmlFor="password" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Password
                </label>
                <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-gold" style={{ color: 'var(--text-muted)' }} />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all duration-300 text-sm"
                        style={{
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            borderColor: 'var(--border-color)'
                        }}
                        placeholder="Enter Password"
                        disabled={loading}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-gold transition-colors duration-300 cursor-pointer"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <div className="flex items-end justify-end">
                <button
                    type="button"
                    onClick={() => {
                        setStep('forgot_email');
                        setForgotEmail(identifier.includes('@') ? identifier : '');
                    }}
                    className="text-xs text-gold hover:text-gold-light transition-colors duration-300 cursor-pointer"
                >
                    Forgot password?
                </button>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-black-rich font-semibold py-2.5 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
                {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Signing in...</span>
                    </span>
                ) : (
                    'Sign In'
                )}
            </button>
        </form>
    );

    const renderForgotEmailForm = () => (
        <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Forgot Password</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                Enter your registered email address and we'll send you a 6-digit verification code.
            </p>

            <div>
                <label htmlFor="forgotEmail" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Email Address
                </label>
                <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-gold" style={{ color: 'var(--text-muted)' }} />
                    <input
                        type="email"
                        id="forgotEmail"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all duration-300 text-sm"
                        style={{
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            borderColor: 'var(--border-color)'
                        }}
                        placeholder="Enter your email"
                        disabled={loading}
                        required
                    />
                </div>
            </div>

            <div className="flex space-x-3 pt-2">
                <button
                    type="button"
                    onClick={() => setStep('login')}
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-lg border transition-all duration-300 hover:bg-gold/10 text-sm font-medium cursor-pointer"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-linear-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-black-rich font-semibold py-2.5 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {loading ?
                        <span className="flex items-center justify-center space-x-2">
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Sending...</span>
                        </span> :
                        'Send OTP'
                    }
                </button>
            </div>
        </form>
    );

    const renderOtpForm = () => (
        <form onSubmit={handleVerifyOtpSubmit} className="space-y-6">
            <div>
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Enter OTP</h2>
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                    We've sent a 6-digit code to <strong>{forgotEmail}</strong>
                </p>
                <button
                    type="button"
                    onClick={() => setStep('forgot_email')}
                    className="text-xs text-gold hover:text-gold-light transition-colors"
                >
                    Change email address
                </button>
            </div>

            <div className="flex justify-between space-x-2">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => (otpRefs.current[index] = el)}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        disabled={loading}
                        className="w-12 h-14 text-center text-xl font-bold rounded-lg border focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all duration-300"
                        style={{
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            borderColor: digit ? 'var(--gold)' : 'var(--border-color)'
                        }}
                    />
                ))}
            </div>

            <button
                type="submit"
                disabled={loading || otp.join('').length < 6}
                className="w-full bg-linear-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-black-rich font-semibold py-2.5 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
                {loading ? <span className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Verifying...</span>
                </span>
                    :
                    'Verify OTP'
                }
            </button>

            <div className="text-center">
                <button
                    type="button"
                    onClick={handleForgotEmailSubmit}
                    disabled={loading}
                    className="text-xs text-gold hover:text-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Didn't receive the code? Resend
                </button>
            </div>
        </form>
    );

    const renderNewPasswordForm = () => (
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <div>
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Create New Password</h2>
                <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Your new password must be at least 6 characters long.
                </p>
            </div>

            <div>
                <label htmlFor="newPassword" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    New Password
                </label>
                <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-gold" style={{ color: 'var(--text-muted)' }} />
                    <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all duration-300 text-sm"
                        style={{
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            borderColor: 'var(--border-color)'
                        }}
                        placeholder="Enter New Password"
                        disabled={loading}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-gold transition-colors duration-300 cursor-pointer"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <div>
                <label htmlFor="confirmPassword" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Confirm Password
                </label>
                <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-gold" style={{ color: 'var(--text-muted)' }} />
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all duration-300 text-sm"
                        style={{
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            borderColor: 'var(--border-color)'
                        }}
                        placeholder="Confirm New Password"
                        disabled={loading}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-gold transition-colors duration-300 cursor-pointer"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword}
                className="w-full bg-linear-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-black-rich font-semibold py-2.5 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
                {loading ?
                    <span className="flex items-center justify-center space-x-2">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Resetting...</span>
                    </span>
                    :
                    'Reset Password'
                }
            </button>
        </form>
    );

    return (
        <div className="h-screen overflow-hidden relative" style={{ backgroundColor: 'var(--bg-primary)' }}>
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Animated Orbs */}
                <div className="absolute w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-pulse" style={{ top: '-10%', left: '-10%' }}></div>
                <div className="absolute w-80 h-80 bg-gold/15 rounded-full blur-3xl animate-pulse" style={{ bottom: '-10%', right: '-10%', animationDelay: '1s' }}></div>
                <div className="absolute w-64 h-64 bg-gold/5 rounded-full blur-3xl animate-pulse" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', animationDelay: '2s' }}></div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `linear-gradient(rgba(212, 175, 55, 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(212, 175, 55, 0.3) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }}></div>

                {/* Floating Particles */}
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-gold/30 rounded-full animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`
                        }}
                    ></div>
                ))}
            </div>

            <div className="h-screen flex flex-col lg:flex-row relative z-10">
                {/* Left Side - Flexible Form Container */}
                <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12 transition-all duration-500">
                    <div className="w-full max-w-md">
                        {/* Conditional Back to Home / Back to Login */}
                        {step === 'login' ? (
                            <Link
                                to="/"
                                className="inline-flex items-center space-x-2 bg-gold/10 hover:text-white p-3 transition-colors duration-300 mb-6 group cursor-pointer rounded-lg hover:bg-gold/50"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                <span className="text-sm">Back to Home</span>
                            </Link>
                        ) : (
                            <button
                                onClick={() => setStep('login')}
                                disabled={loading}
                                className="inline-flex items-center space-x-2 bg-gold/10 hover:text-white p-3 transition-colors duration-300 mb-6 group cursor-pointer rounded-lg hover:bg-gold/50 disabled:opacity-50"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                <span className="text-sm">Back to Login</span>
                            </button>
                        )}

                        {/* Logo & Header */}
                        <div className="mb-6">
                            <div className="flex items-center space-x-2 mb-3">
                                <div className="p-2 bg-gold/10 rounded-lg">
                                    <Scale className="w-8 h-8 text-gold" />
                                </div>
                                <span className="text-2xl font-cinzel font-bold" style={{ color: 'var(--text-primary)' }}>
                                    Legal<span className="text-gold">Firm</span>
                                </span>
                            </div>
                        </div>

                        {/* Dynamic Render Based on Flow Step */}
                        <div className="transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
                            {step === 'login' && renderLoginForm()}
                            {step === 'forgot_email' && renderForgotEmailForm()}
                            {step === 'forgot_otp' && renderOtpForm()}
                            {step === 'forgot_password' && renderNewPasswordForm()}
                        </div>
                    </div>
                </div>

                {/* Right Side - Feature Cards */}
                <div className="lg:w-1/2 hidden lg:flex items-center justify-center p-8 relative">
                    {/* Glassmorphism Card */}
                    <div className="w-full max-w-lg backdrop-blur-xl rounded-2xl p-6 border transition-all duration-500" style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)'
                    }}>
                        <div className="grid grid-cols-3 gap-3">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div
                                        key={index}
                                        className="p-3 rounded-lg border transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg group cursor-pointer"
                                        style={{
                                            backgroundColor: 'var(--bg-primary)',
                                            borderColor: 'var(--border-color)'
                                        }}
                                    >
                                        <div className="inline-block p-1.5 bg-gold/10 rounded-md mb-2 group-hover:bg-gold/20 transition-colors">
                                            <Icon className="w-4 h-4 text-gold" />
                                        </div>
                                        <h3 className="text-xs font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                                            {feature.title}
                                        </h3>
                                        <p className="text-[10px] leading-tight" style={{ color: 'var(--text-secondary)' }}>
                                            {feature.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Bottom Info */}
                        <div className="mt-4 p-3 rounded-lg border text-center" style={{
                            backgroundColor: 'var(--bg-primary)',
                            borderColor: 'var(--border-color)'
                        }}>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                Secure • Fast • Reliable
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
