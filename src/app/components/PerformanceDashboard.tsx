'use client';

import React, { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  totalBlockingTime: number;
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const measurePerformance = () => {
      if (typeof window === 'undefined' || !('performance' in window)) return;

      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      
      const metrics: PerformanceMetrics = {
        loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0,
        totalBlockingTime: 0,
      };

      // LCP Observer
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            metrics.largestContentfulPaint = lastEntry.startTime;
            setMetrics({...metrics});
          });
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

          // CLS Observer
          const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            for (const entry of list.getEntries()) {
              const layoutShiftEntry = entry as PerformanceEntry & { 
                hadRecentInput?: boolean; 
                value?: number; 
              };
              if (!layoutShiftEntry.hadRecentInput) {
                clsValue += layoutShiftEntry.value || 0;
              }
            }
            metrics.cumulativeLayoutShift = clsValue;
            setMetrics({...metrics});
          });
          clsObserver.observe({ type: 'layout-shift', buffered: true });

          // FID Observer
          const fidObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const fidEntry = entry as PerformanceEntry & { 
                processingStart?: number; 
              };
              metrics.firstInputDelay = (fidEntry.processingStart || entry.startTime) - entry.startTime;
              setMetrics({...metrics});
            }
          });
          fidObserver.observe({ type: 'first-input', buffered: true });
        } catch (error) {
          console.warn('PerformanceObserver not fully supported:', error);
        }
      }

      setMetrics(metrics);
    };

    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  if (!metrics || process.env.NODE_ENV === 'production') return null;

  const getScoreColor = (score: number, thresholds: [number, number]) => {
    if (score <= thresholds[0]) return 'text-green-600';
    if (score <= thresholds[1]) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Toggle performance dashboard"
      >
        📊
      </button>
      
      {isVisible && (
        <div className="fixed bottom-16 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 max-w-sm">
          <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Performance Metrics</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Load Time:</span>
              <span className={getScoreColor(metrics.loadTime, [1000, 3000])}>
                {metrics.loadTime.toFixed(0)}ms
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>FCP:</span>
              <span className={getScoreColor(metrics.firstContentfulPaint, [1800, 3000])}>
                {metrics.firstContentfulPaint.toFixed(0)}ms
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>LCP:</span>
              <span className={getScoreColor(metrics.largestContentfulPaint, [2500, 4000])}>
                {metrics.largestContentfulPaint.toFixed(0)}ms
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>CLS:</span>
              <span className={getScoreColor(metrics.cumulativeLayoutShift * 1000, [100, 250])}>
                {metrics.cumulativeLayoutShift.toFixed(3)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>FID:</span>
              <span className={getScoreColor(metrics.firstInputDelay, [100, 300])}>
                {metrics.firstInputDelay.toFixed(0)}ms
              </span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              🟢 Good 🟡 Needs Improvement 🔴 Poor
            </p>
          </div>
        </div>
      )}
    </>
  );
}
