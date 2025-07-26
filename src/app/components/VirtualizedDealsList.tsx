import React, { useState, useCallback, useMemo } from 'react';
import DealCard from './DealCard';

interface Deal {
  id: string;
  name: string;
  description: string;
  discount: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  category: {
    id: string;
    name: string;
    icon: string;
  };
  place: {
    id: string;
    name: string;
    districtId: string;
    district: {
      id: string;
      name: string;
      stateId: string;
      state: {
        id: string;
        name: string;
      };
    };
  };
  vendor: {
    name: string;
  };
}

interface VirtualizedDealsListProps {
  deals: Deal[];
  onDealClick: (dealId: string) => void;
  itemHeight?: number;
  containerHeight?: number;
}

const VirtualizedDealsList: React.FC<VirtualizedDealsListProps> = React.memo(function VirtualizedDealsList({
  deals,
  onDealClick,
  itemHeight = 300,
  containerHeight = 600
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      deals.length
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, deals.length]);

  const visibleDeals = useMemo(() => {
    return deals.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [deals, visibleRange]);

  const totalHeight = deals.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleDealClick = useCallback((dealId: string) => {
    onDealClick(dealId);
  }, [onDealClick]);

  return (
    <div
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0
          }}
        >
          {visibleDeals.map((deal) => (
            <div
              key={deal.id}
              style={{ height: itemHeight }}
              className="mb-4"
            >
              <DealCard
                deal={deal}
                onClick={() => handleDealClick(deal.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default VirtualizedDealsList; 