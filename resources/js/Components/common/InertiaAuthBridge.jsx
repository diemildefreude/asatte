import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useAuth } from '../../contexts/AuthContext';

function InertiaAuthBridge() {
  const { props } = usePage();
  const inertiaUser = props?.auth?.user ?? null;
  const { syncInertiaUser } = useAuth() || {};

  useEffect(() => {
    if (typeof syncInertiaUser === 'function') {
      syncInertiaUser(inertiaUser);
    }
  }, [inertiaUser, syncInertiaUser]);

  return null;
}

export default InertiaAuthBridge;
