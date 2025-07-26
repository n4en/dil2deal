import React from 'react';
import VendorPageContent from './VendorPageContent';
import { prisma } from '../../lib/prisma';

// Server-side data fetching
async function fetchVendorData() {
  try {
    const [categories, states] = await Promise.all([
      prisma.category.findMany({
        orderBy: { name: 'asc' }
      }),
      prisma.state.findMany({
        orderBy: { name: 'asc' }
      })
    ]);
    
    return { categories, states };
  } catch (error) {
    console.error('Error fetching vendor data:', error);
    return { categories: [], states: [] };
  }
}

export default async function VendorPage() {
  const { categories, states } = await fetchVendorData();
  return <VendorPageContent initialCategories={categories} initialStates={states} />;
} 