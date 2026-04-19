import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Scale, LayoutDashboard, Users, FolderOpen, Calendar, 
  FileText, BarChart3, Settings, LogOut, ChevronLeft, 
  ChevronRight, Shield, MessageSquare
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import Swal from 'sweetalert2';
import { logout as logoutService } from '../../services/auth/authService';

const Sidebar = ({ isCollapsed, isMobile, onClose, onCollapseChange }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Menu items with permission requirements
  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/dashboard',
      permission: 'canView' // Everyone needs canView
    },
    { 
      icon: FolderOpen, 
      label: 'Cases', 
      path: '/dashboard/cases',
      permission: 'canRead' // Need read access
    },
    { 
      icon: Users, 
      label: 'Clients', 
      path: '/dashboard/clients',
      permission: 'canRead'
    },
    { 
      icon: Calendar, 
      label: 'Hearings', 
      path: '/dashboard/hearings',
      permission: 'canRead'
    },
    { 
      icon: FileText, 
      label: 'Documents', 
      path: '/dashboard/documents',
      permission: 'canRead'
    },
    { 
      icon: MessageSquare, 
      label: 'Messages', 
      path: '/dashboard/messages',
      permission: 'canRead'
    },
    { 
      icon: BarChart3, 
      label: 'Reports', 
      path: '/dashboard/reports',
      permission: 'canView'
    },
    { 
      icon: Shield, 
      label: 'Users', 
      path: '/dashboard/users',
      adminOnly: true // Only admins
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      path: '/dashboard/settings',
      permission: 'canView'
    },
  ];

  // Filter menu items based on user role and permissions
  const filteredMenuItems = menuItems.filter(item => {
    // Admin sees all menus
    if (user?.role === 'admin') return true;
    
    // If adminOnly flag is set, non-admin users can't see it
    if (item.adminOnly) return false;
    
    // For employees, check if they have the required permission
    if (item.permission && user?.permissions) {
      return user.permissions[item.permission] === true;
    }
    
    return true;
  });

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

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className={`h-full flex flex-col transition-all duration-300 ${
        isCollapsed && !isMobile ? 'w-15' : 'w-64'
      } ${isMobile ? 'w-64' : ''}`}
      style={{
        background: 'linear-gradient(rgb(174 141 36) 0, rgb(84 71 27) 30%, rgb(53 52 46) 60%, rgb(26, 26, 26) 100%)'
      }}
    >
      {/* Logo Section */}
      <div className={`px-3 lg:px-4 ${isCollapsed ? 'py-4.5' : 'py-3.5'} flex items-center justify-between border-b border-white/10 relative`}>
        {!isCollapsed || isMobile ? (
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-black/20 rounded-lg">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-cinzel font-bold text-white">
              Legal<span className="text-black">Firm</span>
            </span>
          </div>
        ) : (
          <div className="mx-auto">
            <Scale className="w-8 h-8 text-white" />
          </div>
        )}
        
        {/* Desktop Collapse Button */}
        {!isMobile && (
          <button
            onClick={() => {
              onCollapseChange(!isCollapsed);
            }}
            className={`hidden lg:flex items-center justify-center w-6 h-6 rounded-lg ${isCollapsed ? 'absolute -right-3' : ''} bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer`}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}

        {/* Mobile Close Button */}
        {isMobile && (
          <button
            onClick={onClose}
            className="lg:hidden flex items-center justify-center w-6 h-6 rounded-lg bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => isMobile && onClose?.()}
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-black/30 text-white shadow-lg'
                      : 'text-white/80 hover:bg-black/20 hover:text-white'
                  }`}
                  title={isCollapsed && !isMobile ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-gold' : ''}`} />
                  {(!isCollapsed || isMobile) && (
                    <span className="ml-3 text-sm font-medium">{item.label}</span>
                  )}
                  {item.adminOnly && (!isCollapsed || isMobile) && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-black/30 text-white/70">
                      Admin
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200 bg-red-500 text-white hover:bg-red-600 hover:text-white cursor-pointer ${
            isCollapsed && !isMobile ? 'justify-center' : ''
          }`}
          title={isCollapsed && !isMobile ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {(!isCollapsed || isMobile) && (
            <span className="ml-3 text-sm font-medium">Logout</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
