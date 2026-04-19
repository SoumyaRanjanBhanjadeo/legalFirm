import { useState, useEffect } from "react";
import {
  Shield,
  UserPlus,
  X,
  Loader2,
  Eye,
  EyeOff,
  Ban,
  Trash2,
  Users,
  Edit,
  Eye as ViewEye,
} from "lucide-react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Select from "react-select";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  createUser,
  getAllUsers,
  toggleUserBlock,
  deleteUser,
  updateUser,
} from "../../services/auth/authService";
import Pagination from "./Pagination";

const UsersPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [users, setUsers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    permissions: {
      canView: false,
      canRead: false,
      canWrite: false,
      canUpdate: false,
      canDelete: false,
      canDownload: false,
    },
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    permissions: {
      canView: false,
      canRead: false,
      canWrite: false,
      canUpdate: false,
      canDelete: false,
      canDownload: false,
    },
  });

  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (page = 1) => {
    setFetchingUsers(true);
    try {
      const response = await getAllUsers(page, pagination.limit);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error("Fetch users error:", error);
    } finally {
      setFetchingUsers(false);
    }
  };

  const handlePageChange = (page) => {
    fetchUsers(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Only admins can access this page
  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const roleOptions = [
    { value: "admin", label: "Admin (Full Access)" },
    { value: "employee", label: "Employee (Custom Permissions)" },
  ];

  const permissionFields = [
    {
      key: "canView",
      label: "Can View",
      description: "View dashboard and overview",
    },
    {
      key: "canRead",
      label: "Can Read",
      description: "Read case files and documents",
    },
    {
      key: "canWrite",
      label: "Can Write",
      description: "Create new cases and records",
    },
    {
      key: "canUpdate",
      label: "Can Update",
      description: "Edit existing records",
    },
    {
      key: "canDelete",
      label: "Can Delete",
      description: "Delete records and cases",
    },
    {
      key: "canDownload",
      label: "Can Download",
      description: "Download documents",
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (selectedOption) => {
    const role = selectedOption.value;
    setFormData((prev) => ({
      ...prev,
      role,
      // Reset permissions when role changes
      permissions:
        role === "admin"
          ? {
            canView: true,
            canRead: true,
            canWrite: true,
            canUpdate: true,
            canDelete: true,
            canDownload: true,
          }
          : {
            canView: false,
            canRead: false,
            canWrite: false,
            canUpdate: false,
            canDelete: false,
            canDownload: false,
          },
    }));
  };

  const handlePermissionChange = (permissionKey) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionKey]: !prev.permissions[permissionKey],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (formData.role === "employee") {
      const hasAnyPermission = Object.values(formData.permissions).some(
        (val) => val,
      );
      if (!hasAnyPermission) {
        toast.error("Please assign at least one permission to the employee");
        return;
      }
    }

    setLoading(true);

    try {
      await createUser(formData);
      toast.success("User created successfully!");

      // Reset form and close modal
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "employee",
        permissions: {
          canView: false,
          canRead: false,
          canWrite: false,
          canUpdate: false,
          canDelete: false,
          canDownload: false,
        },
      });
      setShowModal(false);

      // Refresh users list
      fetchUsers();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create user";
      toast.error(errorMessage);
      console.error("Create user error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId, currentBlockStatus, userName) => {
    const action = currentBlockStatus ? "unblock" : "block";

    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `You want to ${action} ${userName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d4af37",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Yes, ${action}`,
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await toggleUserBlock(userId);
        toast.success(`User ${action}ed successfully`);
        fetchUsers(); // Refresh list
      } catch (error) {
        toast.error(
          error.response?.data?.message || `Failed to ${action} user`,
        );
      }
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      html: `You are about to delete <strong>${userName}</strong>.<br/>This action cannot be undone!`,
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(userId);
        toast.success("User deleted successfully");
        fetchUsers(); // Refresh list
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete user");
      }
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "employee",
      permissions: user.permissions || {
        canView: false,
        canRead: false,
        canWrite: false,
        canUpdate: false,
        canDelete: false,
        canDownload: false,
      },
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editFormData.name || !editFormData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editFormData.password && editFormData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        name: editFormData.name,
        email: editFormData.email,
        role: editFormData.role,
      };

      // Only include password if it's being changed
      if (editFormData.password) {
        updateData.password = editFormData.password;
      }

      // Include permissions for employees
      if (editFormData.role === "employee") {
        updateData.permissions = editFormData.permissions;
      }

      await updateUser(selectedUser._id, updateData);
      toast.success("User updated successfully!");
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update user";
      toast.error(errorMessage);
      console.error("Update user error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditRoleChange = (selectedOption) => {
    const role = selectedOption.value;
    setEditFormData((prev) => ({
      ...prev,
      role,
      permissions:
        role === "admin"
          ? {
            canView: true,
            canRead: true,
            canWrite: true,
            canUpdate: true,
            canDelete: true,
            canDownload: true,
          }
          : {
            canView: false,
            canRead: false,
            canWrite: false,
            canUpdate: false,
            canDelete: false,
            canDownload: false,
          },
    }));
  };

  const handleEditPermissionChange = (permissionKey) => {
    setEditFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionKey]: !prev.permissions[permissionKey],
      },
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "employee",
      permissions: {
        canView: false,
        canRead: false,
        canWrite: false,
        canUpdate: false,
        canDelete: false,
        canDownload: false,
      },
    });
    setShowPassword(false);
    setShowModal(false);
  };

  return (
    <div className="space-y-6 font-inter">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1
            className="text-2xl lg:text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            User Management
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Manage system users and permissions
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center px-4 py-2 bg-gold text-black font-semibold rounded-lg hover:bg-gold-dark transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Create User
        </button>
      </div>

      <div
        className="rounded-xl border"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              All Users
            </h2>
            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              <Users className="w-4 h-4" />
              <span>{pagination.totalItems} total</span>
            </div>
          </div>

          {fetchingUsers ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-gold" />
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Loading users...
                </p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Shield className="w-16 h-16 mx-auto mb-4 text-gold/50" />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  No Users Found
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Create your first user to get started
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className="border-b"
                    style={{ borderColor: "var(--border-color)" }}
                  >
                    <th
                      className="text-left py-3 px-4 text-sm font-semibold"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Name
                    </th>
                    <th
                      className="text-left py-3 px-4 text-sm font-semibold"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Email
                    </th>
                    <th
                      className="text-left py-3 px-4 text-sm font-semibold"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Role
                    </th>
                    <th
                      className="text-left py-3 px-4 text-sm font-semibold"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Status
                    </th>
                    <th
                      className="text-left py-3 px-4 text-sm font-semibold"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u._id}
                      className="border-b hover:bg-gold/5 transition-colors"
                      style={{ borderColor: "var(--border-color)" }}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-sm">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span
                            className="font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td
                        className="py-3 px-4 text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {u.email}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === "admin"
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-blue-500/20 text-blue-400"
                            }`}
                        >
                          {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {u.isBlocked ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
                              <Ban className="w-3 h-3 mr-1" />
                              Blocked
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                              Active
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleViewUser(u)}
                            className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors cursor-pointer"
                            title="View user details"
                          >
                            <ViewEye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEditUser(u)}
                            className="p-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors cursor-pointer"
                            title="Edit user"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              handleToggleBlock(u._id, u.isBlocked, u.name)
                            }
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${u.isBlocked
                                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                              }`}
                            title={u.isBlocked ? "Unblock user" : "Block user"}
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* Pagination */}
      {!fetchingUsers && (
        <Pagination
          currentPage={pagination.currentPage || 1}
          totalPages={pagination.totalPages || 1}
          totalItems={pagination.totalItems || 0}
          limit={pagination.limit || 10}
          onPageChange={handlePageChange}
        />
      )}

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={resetForm}
          />

          {/* Modal */}
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border shadow-2xl scrollbar-hide"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
            }}
          >
            {/* Modal Header */}
            <div
              className="sticky top-0 flex items-center justify-between p-6 border-b z-10"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
              }}
            >
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Create New User
                </h2>
                <p
                  className="text-sm mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Add a new team member to the system
                </p>
              </div>
              <button
                onClick={resetForm}
                className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Basic Information
                </h3>

                {/* Name */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                      borderColor: "var(--border-color)",
                    }}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                      borderColor: "var(--border-color)",
                    }}
                    placeholder="employee@legalfirm.com"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                        borderColor: "var(--border-color)",
                      }}
                      placeholder="Minimum 6 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-gold transition-colors cursor-pointer"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Role <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={roleOptions.find(
                      (opt) => opt.value === formData.role,
                    )}
                    onChange={handleRoleChange}
                    options={roleOptions}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        backgroundColor: "var(--bg-primary)",
                        borderColor: state.isFocused
                          ? "rgb(212, 175, 55)"
                          : "var(--border-color)",
                        color: "var(--text-primary)",
                        minHeight: "42px",
                        boxShadow: "none",
                        "&:hover": {
                          borderColor: "rgb(212, 175, 55)",
                        },
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: "var(--bg-primary)",
                        zIndex: 9999,
                        border: "1px solid var(--border-color)",
                      }),
                      menuList: (base) => ({
                        ...base,
                        padding: "4px",
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected
                          ? "rgb(212, 175, 55)"
                          : state.isFocused
                            ? "var(--bg-secondary)"
                            : "transparent",
                        color: state.isSelected
                          ? "#000"
                          : "var(--text-primary)",
                        cursor: "pointer",
                        "&:active": {
                          backgroundColor: state.isSelected
                            ? "rgb(212, 175, 55)"
                            : "var(--bg-secondary)",
                        },
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "var(--text-primary)",
                      }),
                      input: (base) => ({
                        ...base,
                        color: "var(--text-primary)",
                      }),
                    }}
                  />
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {formData.role === "admin"
                      ? "Admin has full access to all features"
                      : "Employee requires custom permissions"}
                  </p>
                </div>
              </div>

              {/* Permissions Section (Only for employees) */}
              {formData.role === "employee" && (
                <div className="space-y-4">
                  <h3
                    className="text-sm font-semibold uppercase tracking-wide"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Permissions
                  </h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Select the permissions this employee should have
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {permissionFields.map((permission) => (
                      <label
                        key={permission.key}
                        className="flex items-start p-3 rounded-lg border cursor-pointer transition-all hover:bg-gold/5"
                        style={{
                          backgroundColor: formData.permissions[permission.key]
                            ? "var(--bg-primary)"
                            : "var(--bg-primary)",
                          borderColor: formData.permissions[permission.key]
                            ? "rgb(212, 175, 55)"
                            : "var(--border-color)",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions[permission.key]}
                          onChange={() =>
                            handlePermissionChange(permission.key)
                          }
                          className="mt-0.5 w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold cursor-pointer"
                        />
                        <div className="ml-3">
                          <span
                            className="text-sm font-medium block"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {permission.label}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {permission.description}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div
                className="flex items-center justify-end space-x-3 pt-4 border-t"
                style={{ borderColor: "var(--border-color)" }}
              >
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 border rounded-lg hover:bg-gray-500/10 transition-colors cursor-pointer"
                  style={{
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-2.5 bg-gold text-black font-semibold rounded-lg hover:bg-gold-dark transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create User"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowViewModal(false)}
          />
          <div
            className="relative w-full max-w-lg rounded-xl border shadow-2xl z-10"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
            }}
          >
            <div
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: "var(--border-color)" }}
            >
              <h2
                className="text-xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                User Details
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-2xl">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {selectedUser.name}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {selectedUser.email}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div
                  className="flex justify-between py-2 border-b"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Role
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${selectedUser.role === "admin" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}
                  >
                    {selectedUser.role.charAt(0).toUpperCase() +
                      selectedUser.role.slice(1)}
                  </span>
                </div>
                <div
                  className="flex justify-between py-2 border-b"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Status
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${selectedUser.isBlocked ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}
                  >
                    {selectedUser.isBlocked ? "Blocked" : "Active"}
                  </span>
                </div>
                <div
                  className="flex justify-between py-2 border-b"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Created
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {selectedUser.role === "employee" && selectedUser.permissions && (
                <div className="mt-4">
                  <h4
                    className="text-sm font-semibold mb-3"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Permissions
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedUser.permissions).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center gap-2 p-2 rounded"
                          style={{ backgroundColor: "var(--bg-primary)" }}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${value ? "bg-green-500" : "bg-red-500"}`}
                          />
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {key.replace("can", "Can ")}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border shadow-2xl scrollbar-hide"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
            }}
          >
            <div
              className="sticky top-0 flex items-center justify-between p-6 border-b z-10"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
              }}
            >
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Edit User
                </h2>
                <p
                  className="text-sm mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Update user information and permissions
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <h3
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Basic Information
                </h3>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                      borderColor: "var(--border-color)",
                    }}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                      borderColor: "var(--border-color)",
                    }}
                    placeholder="employee@legalfirm.com"
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    New Password{" "}
                    <span className="text-xs text-gray-500">
                      (leave blank to keep current)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? "text" : "password"}
                      name="password"
                      value={editFormData.password}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2.5 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                        borderColor: "var(--border-color)",
                      }}
                      placeholder="Minimum 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-gold transition-colors cursor-pointer"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {showEditPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Role <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={roleOptions.find(
                      (opt) => opt.value === editFormData.role,
                    )}
                    onChange={handleEditRoleChange}
                    options={roleOptions}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        backgroundColor: "var(--bg-primary)",
                        borderColor: state.isFocused
                          ? "rgb(212, 175, 55)"
                          : "var(--border-color)",
                        color: "var(--text-primary)",
                        minHeight: "42px",
                        boxShadow: "none",
                        "&:hover": { borderColor: "rgb(212, 175, 55)" },
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: "var(--bg-primary)",
                        zIndex: 9999,
                        border: "1px solid var(--border-color)",
                      }),
                      menuList: (base) => ({ ...base, padding: "4px" }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected
                          ? "rgb(212, 175, 55)"
                          : state.isFocused
                            ? "var(--bg-secondary)"
                            : "transparent",
                        color: state.isSelected
                          ? "#000"
                          : "var(--text-primary)",
                        cursor: "pointer",
                        "&:active": {
                          backgroundColor: state.isSelected
                            ? "rgb(212, 175, 55)"
                            : "var(--bg-secondary)",
                        },
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "var(--text-primary)",
                      }),
                      input: (base) => ({
                        ...base,
                        color: "var(--text-primary)",
                      }),
                    }}
                  />
                </div>
              </div>
              {editFormData.role === "employee" && (
                <div className="space-y-4">
                  <h3
                    className="text-sm font-semibold uppercase tracking-wide"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Permissions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {permissionFields.map((permission) => (
                      <label
                        key={permission.key}
                        className="flex items-start p-3 rounded-lg border cursor-pointer transition-all hover:bg-gold/5"
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          borderColor: editFormData.permissions[permission.key]
                            ? "rgb(212, 175, 55)"
                            : "var(--border-color)",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={editFormData.permissions[permission.key]}
                          onChange={() =>
                            handleEditPermissionChange(permission.key)
                          }
                          className="mt-0.5 w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold cursor-pointer"
                        />
                        <div className="ml-3">
                          <span
                            className="text-sm font-medium block"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {permission.label}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {permission.description}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div
                className="flex items-center justify-end space-x-3 pt-4 border-t"
                style={{ borderColor: "var(--border-color)" }}
              >
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2.5 border rounded-lg hover:bg-gray-500/10 transition-colors cursor-pointer"
                  style={{
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-2.5 bg-gold text-black font-semibold rounded-lg hover:bg-gold-dark transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update User"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
