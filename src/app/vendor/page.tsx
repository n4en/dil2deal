import React from 'react';
import VendorPageContent from './VendorPageContent';
import { PrismaClient } from '@prisma/client';

// Server-side data fetching
async function fetchVendorData() {
  const prisma = new PrismaClient();
  
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
  } finally {
    await prisma.$disconnect();
  }
}

export default async function VendorPage() {
  const { categories, states } = await fetchVendorData();
  return <VendorPageContent initialCategories={categories} initialStates={states} />;
} 