import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Menu, Bell, User, LogOut
} from 'lucide-react';
import Swal from 'sweetalert2';
import { logout } from '../../store/authSlice';
import { logout as logoutService } from '../../services/auth/authService';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';

const Header = ({ toggleSidebar, toggleMobileSidebar }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of your account.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#CE2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      logoutService();
      dispatch(logout());
      Swal.fire({
        title: 'Logged Out!',
        text: 'You have been successfully logged out.',
        icon: 'success',
        confirmButtonColor: '#9AD872'
      }).then(() => {
        window.location.href = '/login';
      });
    }
  };

  return (
    <header
      className="fixed top-0 right-0 left-0 z-30 border-b backdrop-blur-sm"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)'
      }}
    >
      <div className="flex items-center justify-between px-3 lg:px-4 py-2">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gold/10 transition-colors cursor-pointer"
            style={{ color: 'var(--text-primary)' }}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Sidebar Toggle */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:block p-2 rounded-lg hover:bg-gold/10 transition-colors cursor-pointer"
            style={{ color: 'var(--text-primary)' }}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          <NotificationDropdown />

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gold/10 transition-colors cursor-pointer"
              style={{ color: 'var(--text-primary)' }}
            >
              {/* User Avatar */}
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {user?.name}
                </p>
                <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
                  {user?.role}
                </p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />

                {/* Dropdown */}
                <div
                  className="absolute right-0 mt-2 w-48 rounded-lg border shadow-lg z-20"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div className="p-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {user?.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {user?.email}
                    </p>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/dashboard/profile');
                      }}
                      className="flex items-center w-full px-3 py-2 rounded-lg text-sm hover:bg-gold/10 transition-colors cursor-pointer"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 rounded-lg text-sm bg-red-400 text-white hover:bg-red-500 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
