import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Mail, Lock, Eye, EyeOff, ArrowLeft, Shield, Users, Calendar, FileText, Bell, Database, Sun, Moon } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
import { login as loginService } from '../services/auth/authService';
import toast from 'react-hot-toast';

const LoginPage = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!identifier || !password) {
            toast.error('Please enter your email/name and password');
            return;
        }

        setLoading(true);

        try {
            // Call the login API service (promise-based)
            const response = await loginService(identifier, password);

            // Update Redux store with user data and token
            dispatch(login({
                user: response.data.user,
                token: response.data.token
            }));

            // Show success message
            toast.success('Login successful!!!');

            navigate('/dashboard');
        } catch (error) {
            // Handle different error types
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(errorMessage);
            console.error('Login error:', error);
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

            {/* Theme Toggle - Top Right */}
            {/* <button
        onClick={() => dispatch(toggleTheme())}
        className="fixed top-4 right-4 z-50 p-2 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        aria-label="Toggle theme"
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-gold" />
        ) : (
          <Moon className="w-5 h-5 text-gold" />
        )}
      </button> */}

            <div className="h-screen flex flex-col lg:flex-row relative z-10">
                {/* Left Side - Login Form */}
                <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
                    <div className="w-full max-w-md">
                        {/* Back to Home */}
                        <Link
                            to="/"
                            className="inline-flex items-center space-x-2 bg-gold/10 hover:text-white p-3 transition-colors duration-300 mb-6 group cursor-pointer rounded-lg hover:bg-gold/50"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm">Back to Home</span>
                        </Link>

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
                            {/* <h1 className="text-xl font-cinzel font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                Welcome Back
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Sign in to access your dashboard
              </p> */}
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email/Name Input */}
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
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
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

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-end justify-end">
                                {/* <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 border rounded focus:ring-gold text-gold"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Remember me</span>
                </label> */}
                                <a href="#" className="text-xs text-gold hover:text-gold-light transition-colors duration-300 cursor-pointer">
                                    Forgot password?
                                </a>
                            </div>

                            {/* Login Button */}
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

                        {/* Footer Text */}
                        <p className="mt-6 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Don't have an account?{' '}
                            <a href="#" className="text-gold hover:text-gold-light transition-colors duration-300 cursor-pointer">
                                Contact Administrator
                            </a>
                        </p>
                    </div>
                </div>

                {/* Right Side - Feature Cards */}
                <div className="lg:w-1/2 hidden lg:flex items-center justify-center p-8 relative">
                    {/* Glassmorphism Card */}
                    <div className="w-full max-w-lg backdrop-blur-xl rounded-2xl p-6 border" style={{
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
