import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
    User,
    Mail,
    Shield,
    Lock,
    Eye,
    EyeOff,
    Save,
    Key,
    CheckCircle2,
} from "lucide-react";
// import Swal from "sweetalert2";
import { updateMyPassword } from "../../services/auth/authService";
import toast from "react-hot-toast";

const Profile = () => {
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState("basic");
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.newPassword !== formData.confirmPassword) {
            return toast.error("New passwords do not match.");
            // Swal.fire({
            //     title: "Error!",
            //     text: "New passwords do not match.",
            //     icon: "error",
            //     confirmButtonColor: "#CE2626",
            // });
        }

        if (formData.newPassword.length < 6) {
            return toast.error("New password must be at least 6 characters long.");
            // Swal.fire({
            //     title: "Error!",
            //     text: "New password must be at least 6 characters long.",
            //     icon: "error",
            //     confirmButtonColor: "#CE2626",
            // });
        }

        try {
            setLoading(true);
            const response = await updateMyPassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });

            if (response.success) {
                // Swal.fire({
                //   title: "Success!",
                //   text: "Your password has been updated successfully.",
                //   icon: "success",
                //   confirmButtonColor: "#9AD872",
                // });
                toast.success(response.message || "Password updated successfully");
                setFormData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            }
        } catch (error) {
            //   Swal.fire({
            //     title: "Update Failed",
            //     text:
            //       error.response?.data?.message ||
            //       "Something went wrong. Please try again.",
            //     icon: "error",
            //     confirmButtonColor: "#CE2626",
            //   });
            toast.error(error.response?.data?.message || "Password update failed");
        } finally {
            setLoading(false);
        }
    };

    const permissionLabels = {
        canView: "View Dashboard",
        canRead: "Read Cases",
        canWrite: "Create Cases",
        canUpdate: "Update Records",
        canDelete: "Delete Records",
        canDownload: "Export Data",
    };

    return (
        <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8 font-inter">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1
                        className="text-2xl lg:text-3xl font-bold tracking-tight"
                        style={{ color: "var(--text-primary)" }}
                    >
                        My Profile
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                        Manage your personal information and security settings.
                    </p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div
                className="flex flex-wrap gap-2 p-1 rounded-2xl border w-fit"
                style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border-color)",
                }}
            >
                <button
                    onClick={() => setActiveTab("basic")}
                    className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${activeTab === "basic"
                        ? "bg-gold text-white shadow-lg shadow-gold/20"
                        : "text-muted hover:bg-gold/10 hover:text-gold"
                        }`}
                    style={activeTab !== "basic" ? { color: "var(--text-muted)" } : {}}
                >
                    <User className="w-4 h-4" />
                    <span>Basic Information</span>
                </button>
                <button
                    onClick={() => setActiveTab("security")}
                    className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${activeTab === "security"
                        ? "bg-gold text-white shadow-lg shadow-gold/20"
                        : "text-muted hover:bg-gold/10 hover:text-gold"
                        }`}
                    style={activeTab !== "security" ? { color: "var(--text-muted)" } : {}}
                >
                    <Key className="w-4 h-4" />
                    <span>Security</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Profile Card - Sticky on desktop */}
                <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-6">
                    <div
                        className="p-8 rounded-3xl border flex flex-col items-center text-center space-y-6 shadow-sm"
                        style={{
                            backgroundColor: "var(--bg-secondary)",
                            borderColor: "var(--border-color)",
                        }}
                    >
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-gold/10 flex items-center justify-center text-gold text-5xl font-bold border-8 border-gold/5 shadow-inner">
                                {user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div
                                className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-green-500 border-4 border-white dark:border-gray-900"
                                title="Account Active"
                            ></div>
                        </div>

                        <div className="space-y-1">
                            <h2
                                className="text-2xl font-bold"
                                style={{ color: "var(--text-primary)" }}
                            >
                                {user?.name}
                            </h2>
                            <p
                                className="text-xs uppercase tracking-widest font-bold px-4 py-1.5 rounded-full inline-block"
                                style={{
                                    backgroundColor: "var(--gold-muted)",
                                    color: "var(--gold)",
                                }}
                            >
                                {user?.role}
                            </p>
                        </div>

                        <div className="w-full pt-4 space-y-3 text-left">
                            <div
                                className="flex items-center space-x-3 p-3 rounded-2xl"
                                style={{ backgroundColor: "var(--bg-primary)" }}
                            >
                                <div className="p-2 rounded-lg bg-gold/10 text-gold">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div className="overflow-hidden">
                                    <p
                                        className="text-[10px] uppercase tracking-wider font-bold mb-0.5"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        Email Address
                                    </p>
                                    <p
                                        className="text-sm font-medium truncate"
                                        style={{ color: "var(--text-primary)" }}
                                    >
                                        {user?.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Tab Content */}
                <div className="lg:col-span-8">
                    {activeTab === "basic" ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* Personal Details Card */}
                            <div
                                className="p-8 rounded-3xl border shadow-sm space-y-8"
                                style={{
                                    backgroundColor: "var(--bg-secondary)",
                                    borderColor: "var(--border-color)",
                                }}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 rounded-xl bg-gold/10 text-gold">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <h3
                                        className="text-lg font-bold"
                                        style={{ color: "var(--text-primary)" }}
                                    >
                                        Personal Details
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <p
                                            className="text-xs font-bold uppercase tracking-wider"
                                            style={{ color: "var(--text-muted)" }}
                                        >
                                            Full Name
                                        </p>
                                        <p
                                            className="text-base font-medium"
                                            style={{ color: "var(--text-primary)" }}
                                        >
                                            {user?.name}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p
                                            className="text-xs font-bold uppercase tracking-wider"
                                            style={{ color: "var(--text-muted)" }}
                                        >
                                            Email Address
                                        </p>
                                        <p
                                            className="text-base font-medium"
                                            style={{ color: "var(--text-primary)" }}
                                        >
                                            {user?.email}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p
                                            className="text-xs font-bold uppercase tracking-wider"
                                            style={{ color: "var(--text-muted)" }}
                                        >
                                            Primary Role
                                        </p>
                                        <p
                                            className="text-base font-medium capitalize"
                                            style={{ color: "var(--text-primary)" }}
                                        >
                                            {user?.role}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p
                                            className="text-xs font-bold uppercase tracking-wider"
                                            style={{ color: "var(--text-muted)" }}
                                        >
                                            Account ID
                                        </p>
                                        <p
                                            className="text-base font-medium font-mono"
                                            style={{ color: "var(--text-primary)" }}
                                        >
                                            #{user?.id?.slice(-12)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Permissions Card */}
                            <div
                                className="p-8 rounded-3xl border shadow-sm space-y-8"
                                style={{
                                    backgroundColor: "var(--bg-secondary)",
                                    borderColor: "var(--border-color)",
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 rounded-xl bg-gold/10 text-gold">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3
                                                className="text-lg font-bold"
                                                style={{ color: "var(--text-primary)" }}
                                            >
                                                System Permissions
                                            </h3>
                                            <p
                                                className="text-xs"
                                                style={{ color: "var(--text-muted)" }}
                                            >
                                                Privileges currently active for your account.
                                            </p>
                                        </div>
                                    </div>
                                    {user?.role === "admin" && (
                                        <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-green-500/10 text-green-500 rounded-full">
                                            Full Access
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {Object.entries(user?.permissions || {}).map(
                                        ([key, value]) => (
                                            <div
                                                key={key}
                                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${value
                                                    ? "border-gold/20 bg-gold/5"
                                                    : "border-dashed opacity-50"
                                                    }`}
                                                style={{
                                                    borderColor: value
                                                        ? "var(--gold-muted)"
                                                        : "var(--border-color)",
                                                }}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className={`p-1.5 rounded-full ${value ? "text-gold" : "text-gray-400"}`}
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </div>
                                                    <span
                                                        className="text-sm font-semibold"
                                                        style={{ color: "var(--text-primary)" }}
                                                    >
                                                        {permissionLabels[key] || key}
                                                    </span>
                                                </div>
                                                <div
                                                    className={`w-2 h-2 rounded-full ${value ? "bg-gold animate-pulse" : "bg-gray-400"}`}
                                                ></div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* Password Update Card */}
                            <div
                                className="p-8 rounded-3xl border shadow-sm space-y-8"
                                style={{
                                    backgroundColor: "var(--bg-secondary)",
                                    borderColor: "var(--border-color)",
                                }}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 rounded-xl bg-gold/10 text-gold">
                                        <Key className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3
                                            className="text-lg font-bold"
                                            style={{ color: "var(--text-primary)" }}
                                        >
                                            Security Credentials
                                        </h3>
                                        <p
                                            className="text-xs"
                                            style={{ color: "var(--text-muted)" }}
                                        >
                                            Keep your account safe by updating your password
                                            regularly.
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="space-y-6">
                                        {/* Current Password */}
                                        <div className="space-y-2">
                                            <label
                                                className="text-xs font-bold uppercase tracking-wider pl-1"
                                                style={{ color: "var(--text-muted)" }}
                                            >
                                                Current Password
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gold/60 group-focus-within:text-gold transition-colors">
                                                    <Lock className="w-4 h-4" />
                                                </div>
                                                <input
                                                    type={showPasswords.current ? "text" : "password"}
                                                    name="currentPassword"
                                                    value={formData.currentPassword}
                                                    onChange={handleChange}
                                                    required
                                                    className="block w-full pl-11 pr-12 py-3.5 border rounded-2xl focus:ring-4 focus:ring-gold/10 focus:border-gold transition-all outline-none"
                                                    style={{
                                                        backgroundColor: "var(--bg-primary)",
                                                        borderColor: "var(--border-color)",
                                                        color: "var(--text-primary)",
                                                    }}
                                                    placeholder="Confirm current identity"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility("current")}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gold transition-colors cursor-pointer"
                                                >
                                                    {showPasswords.current ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* New Password */}
                                            <div className="space-y-2">
                                                <label
                                                    className="text-xs font-bold uppercase tracking-wider pl-1"
                                                    style={{ color: "var(--text-muted)" }}
                                                >
                                                    New Password
                                                </label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gold/60 group-focus-within:text-gold transition-colors">
                                                        <Lock className="w-4 h-4" />
                                                    </div>
                                                    <input
                                                        type={showPasswords.new ? "text" : "password"}
                                                        name="newPassword"
                                                        value={formData.newPassword}
                                                        onChange={handleChange}
                                                        required
                                                        className="block w-full pl-11 pr-12 py-3.5 border rounded-2xl focus:ring-4 focus:ring-gold/10 focus:border-gold transition-all outline-none"
                                                        style={{
                                                            backgroundColor: "var(--bg-primary)",
                                                            borderColor: "var(--border-color)",
                                                            color: "var(--text-primary)",
                                                        }}
                                                        placeholder="Create strong password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => togglePasswordVisibility("new")}
                                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gold transition-colors cursor-pointer"
                                                    >
                                                        {showPasswords.new ? (
                                                            <EyeOff className="w-4 h-4" />
                                                        ) : (
                                                            <Eye className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Confirm Password */}
                                            <div className="space-y-2">
                                                <label
                                                    className="text-xs font-bold uppercase tracking-wider pl-1"
                                                    style={{ color: "var(--text-muted)" }}
                                                >
                                                    Confirm New Password
                                                </label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gold/60 group-focus-within:text-gold transition-colors">
                                                        <Shield className="w-4 h-4" />
                                                    </div>
                                                    <input
                                                        type={showPasswords.confirm ? "text" : "password"}
                                                        name="confirmPassword"
                                                        value={formData.confirmPassword}
                                                        onChange={handleChange}
                                                        required
                                                        className="block w-full pl-11 pr-12 py-3.5 border rounded-2xl focus:ring-4 focus:ring-gold/10 focus:border-gold transition-all outline-none"
                                                        style={{
                                                            backgroundColor: "var(--bg-primary)",
                                                            borderColor: "var(--border-color)",
                                                            color: "var(--text-primary)",
                                                        }}
                                                        placeholder="Verify new credentials"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => togglePasswordVisibility("confirm")}
                                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gold transition-colors cursor-pointer"
                                                    >
                                                        {showPasswords.confirm ? (
                                                            <EyeOff className="w-4 h-4" />
                                                        ) : (
                                                            <Eye className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="group relative flex items-center space-x-3 px-8 py-4 rounded-2xl bg-gold text-white font-bold hover:bg-gold/90 transition-all shadow-xl shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                                        >
                                            {loading ? (
                                                <span className="flex items-center">
                                                    <LoaderIcon />
                                                    <span>Syncing Securely...</span>
                                                </span>
                                            ) : (
                                                <>
                                                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                    <span>Update Credentials</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const LoaderIcon = () => (
    <svg
        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
    >
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
        ></circle>
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
    </svg>
);

export default Profile;