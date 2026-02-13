'use client';

import styles from './styles';

export function StatusBar({ status, type }: { status: string; type: 'info' | 'success' | 'error' }) {
  if (!status) return null;

  const statusStyle = {
    ...styles.status,
    ...(type === 'error' ? styles.statusError : {}),
  };

  return <div style={statusStyle}>{status}</div>;
}
