import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Categories
  const categories = [
    { id: 'food', name: 'Food & Dining', icon: '🍽️' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️' },
    { id: 'services', name: 'Services', icon: '🔧' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'health', name: 'Health & Wellness', icon: '💊' },
    { id: 'beauty', name: 'Beauty & Spa', icon: '💄' },
    { id: 'fitness', name: 'Fitness', icon: '💪' },
    { id: 'automotive', name: 'Automotive', icon: '🚗' },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    });
  }

  // Indian location hierarchy
  const locationData = [
    {
      state: 'Maharashtra',
      districts: [
        { name: 'Mumbai', places: ['Andheri', 'Borivali', 'Dadar'] },
        { name: 'Pune', places: ['Shivajinagar', 'Kothrud', 'Hinjewadi'] },
      ],
    },
    {
      state: 'Karnataka',
      districts: [
        { name: 'Bengaluru', places: ['Indiranagar', 'Whitefield', 'Koramangala'] },
        { name: 'Mysuru', places: ['VV Mohalla', 'Gokulam'] },
      ],
    },
    {
      state: 'Delhi',
      districts: [
        { name: 'New Delhi', places: ['Connaught Place', 'Karol Bagh'] },
        { name: 'South Delhi', places: ['Saket', 'Hauz Khas'] },
      ],
    },
    {
      state: 'Andhra Pradesh',
      districts: [
        { name: 'Visakhapatnam', places: ['Gajuwaka', 'MVP Colony', 'Dwaraka Nagar'] },
        { name: 'Vijayawada', places: ['Benz Circle', 'Governorpet', 'Labbipet'] },
        { name: 'Guntur', places: ['Brodipet', 'Arundelpet', 'Lakshmipuram'] },
      ],
    },
  ];

  // Seed states, districts, places using upsert
  for (const s of locationData) {
    const state = await prisma.state.upsert({
      where: { name: s.state },
      update: {},
      create: { name: s.state },
    });
    for (const d of s.districts) {
      const district = await prisma.district.upsert({
        where: { name_stateId: { name: d.name, stateId: state.id } },
        update: {},
        create: { name: d.name, stateId: state.id },
      });
      for (const p of d.places) {
        await prisma.place.upsert({
          where: { name_districtId: { name: p, districtId: district.id } },
          update: {},
          create: { name: p, districtId: district.id },
        });
      }
    }
  }

  // Vendors
  const vendors = [
    {
      name: "Mama Mia's Restaurant",
      address: '123 Andheri, Mumbai, Maharashtra',
      phone: '9876543210',
      email: 'info@mamamias.com',
    },
    {
      name: 'Zen Spa & Wellness',
      address: '456 Indiranagar, Bengaluru, Karnataka',
      phone: '9123456780',
      email: 'bookings@zenspa.com',
    },
    {
      name: 'TechHub Electronics',
      address: '789 Connaught Place, New Delhi, Delhi',
      phone: '9988776655',
      email: 'sales@techhub.com',
    },
  ];
  for (const vendor of vendors) {
    await prisma.vendor.upsert({
      where: { email: vendor.email },
      update: {},
      create: vendor,
    });
  }

  // Deals (reference places by name for demo)
  const deals = [
    {
      name: '50% Off Italian Dinner',
      description: "Enjoy authentic Italian cuisine with 50% off your entire meal. Valid for dine-in only.",
      discount: '50%',
      startDate: new Date('2025-01-20'),
      endDate: new Date('2025-02-20'),
      isActive: true,
      categoryId: 'food',
      place: { state: 'Maharashtra', district: 'Mumbai', name: 'Andheri' },
      vendor: { email: 'info@mamamias.com' },
      reviews: [
        { user: 'John D.', rating: 5, comment: 'Amazing food and great deal!' },
      ],
    },
    {
      name: 'Buy 1 Get 1 Free Massage',
      description: 'Relax and rejuvenate with our professional massage services. BOGO deal valid for 60-minute sessions.',
      discount: 'BOGO',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-03-15'),
      isActive: true,
      categoryId: 'health',
      place: { state: 'Karnataka', district: 'Bengaluru', name: 'Indiranagar' },
      vendor: { email: 'bookings@zenspa.com' },
      reviews: [
        { user: 'Emily R.', rating: 5, comment: 'Very relaxing, professional staff.' },
      ],
    },
    {
      name: '30% Off Electronics Store',
      description: 'Get 30% off on all electronics including smartphones, laptops, tablets, and accessories.',
      discount: '30%',
      startDate: new Date('2025-01-10'),
      endDate: new Date('2025-01-31'),
      isActive: true,
      categoryId: 'shopping',
      place: { state: 'Delhi', district: 'New Delhi', name: 'Connaught Place' },
      vendor: { email: 'sales@techhub.com' },
      reviews: [
        { user: 'Mike T.', rating: 4, comment: 'Great prices and good selection.' },
      ],
    },
  ];

  for (const deal of deals) {
    // Find place and vendor
    const state = await prisma.state.findUnique({ where: { name: deal.place.state } });
    const district = await prisma.district.findUnique({ where: { name_stateId: { name: deal.place.district, stateId: state!.id } } });
    const place = await prisma.place.findUnique({ where: { name_districtId: { name: deal.place.name, districtId: district!.id } } });
    const vendor = await prisma.vendor.findUnique({ where: { email: deal.vendor.email } });
    const createdDeal = await prisma.deal.create({
      data: {
        name: deal.name,
        description: deal.description,
        discount: deal.discount,
        startDate: deal.startDate,
        endDate: deal.endDate,
        isActive: deal.isActive,
        categoryId: deal.categoryId,
        placeId: place!.id,
        vendorId: vendor!.id,
      },
    });
    for (const review of deal.reviews) {
      await prisma.review.create({
        data: {
          user: review.user,
          rating: review.rating,
          comment: review.comment,
          dealId: createdDeal.id,
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 