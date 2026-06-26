import { useContext } from 'react';
import { AuthContext } from './AuthContextCore';

export function useAuth() {
  return useContext(AuthContext);
}
export default useAuth;
