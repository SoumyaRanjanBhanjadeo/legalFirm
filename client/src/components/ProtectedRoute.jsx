import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  
  // Check both Redux state and localStorage
  const isAuth = isAuthenticated || localStorage.getItem('token');

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
