import React from 'react';
import { useData } from '../../context/DataContext';

/**
 * Toast — light theme (matches the site palette).
 */
export const Toast = () => {
  const { toast } = useData();

  if (!toast) return null;

  const cls = toast.type === 'error' ? 'err' : toast.type === 'info' ? 'warn' : 'ok';

  return (
    <div className={`lm-toast ${cls}`} role="status">
      <span>{toast.message}</span>
    </div>
  );
};
