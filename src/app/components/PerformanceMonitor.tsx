'use client';

import React, { useEffect, useCallback } from 'react';

const PerformanceMonitor: React.FC = () => {
  const trackPageLoad = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        console.log(`Page load time: ${loadTime}ms`);
        
        // Send to analytics if needed
        if (loadTime > 3000) {
          console.warn('Slow page load detected');
        }
      }
    }
  }, []);

  const trackApiCall = useCallback((url: string, duration: number) => {
    console.log(`API call to ${url}: ${duration}ms`);
    
    if (duration > 2000) {
      console.warn(`Slow API call detected: ${url}`);
    }
  }, []);

  const trackUserInteraction = useCallback(() => {
    // Track user interactions for performance analysis
    console.log('User interaction detected');
  }, []);

  useEffect(() => {
    // Track page load time
    if (document.readyState === 'complete') {
      trackPageLoad();
    } else {
      window.addEventListener('load', trackPageLoad);
      return () => window.removeEventListener('load', trackPageLoad);
    }
  }, [trackPageLoad]);

  useEffect(() => {
    // Intercept fetch calls to track API performance
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        trackApiCall(args[0] as string, endTime - startTime);
        return response;
      } catch (error) {
        const endTime = performance.now();
        trackApiCall(args[0] as string, endTime - startTime);
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [trackApiCall]);

  useEffect(() => {
    // Track user interactions
    const handleInteraction = () => trackUserInteraction();
    
    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    document.addEventListener('scroll', handleInteraction);
    
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('scroll', handleInteraction);
    };
  }, [trackUserInteraction]);

  return null; // This component doesn't render anything
};

export default PerformanceMonitor; 