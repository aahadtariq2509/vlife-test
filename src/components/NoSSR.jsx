'use client';

import { useEffect, useState } from 'react';

export function NoSSR({ children, fallback = null }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    // Remove bis_skin_checked attribute that can cause hydration warnings
    const removeBisSkinChecked = () => {
      const elements = document.querySelectorAll('[bis_skin_checked]');
      elements.forEach(el => el.removeAttribute('bis_skin_checked'));
    };
    removeBisSkinChecked();
  }, []);

  if (!hasMounted) {
    return fallback;
  }

  return <div suppressHydrationWarning>{children}</div>;
}
