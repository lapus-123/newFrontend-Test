// functions/Logout.js
import { useNavigate } from 'react-router-dom';

export default function useLogout() {
  const navigate = useNavigate();

  return () => {
    // Clear auth-related data (adjust as needed)
    localStorage.clear();
    sessionStorage.clear();

    // Redirect to login
    navigate('/login', { replace: true });
  };
}
