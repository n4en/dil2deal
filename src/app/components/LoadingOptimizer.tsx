'use client';

import React, { useEffect, useState } from 'react';

interface LoadingOptimizerProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minLoadTime?: number;
}

const LoadingOptimizer: React.FC<LoadingOptimizerProps> = ({ 
  children, 
  fallback = <div className="animate-pulse">Loading...</div>,
  minLoadTime = 300 
}) => {
  const [showContent, setShowContent] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minLoadTime - elapsed);

    const timer = setTimeout(() => {
      setShowContent(true);
    }, remaining);

    return () => clearTimeout(timer);
  }, [startTime, minLoadTime]);

  if (!showContent) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default LoadingOptimizer; 