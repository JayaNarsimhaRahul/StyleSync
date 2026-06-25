require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Salon = require('../models/Salon');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

const seedData = async (shouldDisconnect = true) => {
  try {
    if (mongoose.connection.readyState === 0) {
      const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/stylesync';
      console.log(`Connecting to MongoDB at: ${mongoUri}`);
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB.');
    }

    // Clear existing data
    console.log('Clearing database collections (Salons, Services, Staff, Bookings, Reviews)...');
    await Salon.deleteMany({});
    await Service.deleteMany({});
    await Staff.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});

    // 1. Create or Find an Owner
    console.log('Creating demo salon owner...');
    let owner = await User.findOne({ email: 'owner@example.com' });
    if (!owner) {
      owner = await User.create({
        name: 'Alex Mercer (Owner)',
        email: 'owner@example.com',
        password: 'Password123',
        phone: '9876543210',
        role: 'owner',
      });
    }

    // ─── SALON 1: THE VELVET CHAIR (MUMBAI) ───────────────────────────────────
    console.log('Creating "The Velvet Chair" (Mumbai)...');
    const salon1 = await Salon.create({
      name: 'The Velvet Chair',
      description: 'An upscale modern styling lounge offering premium haircuts, custom color treatments, and grooming packages in a luxury environment.',
      address: '45, Marine Drive, next to Grand Plaza',
      city: 'Mumbai',
      ownerId: owner._id,
      images: [
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1521590832167-7bcbfeac8245?q=80&w=600&auto=format&fit=crop'
      ],
      openingHours: {
        monday: { open: '09:00', close: '20:00', isClosed: false },
        tuesday: { open: '09:00', close: '20:00', isClosed: false },
        wednesday: { open: '09:00', close: '20:00', isClosed: false },
        thursday: { open: '09:00', close: '20:00', isClosed: false },
        friday: { open: '09:00', close: '20:00', isClosed: false },
        saturday: { open: '09:00', close: '21:00', isClosed: false },
        sunday: { open: '10:00', close: '18:00', isClosed: false }
      },
      avgRating: 4.8,
      totalReviews: 2
    });

    const s1_haircut = await Service.create({
      name: 'Classic Signature Haircut',
      category: 'haircut',
      price: 800,
      durationMinutes: 30,
      description: 'Custom wash, haircut, blow dry, and product styling.',
      salonId: salon1._id
    });

    const s1_coloring = await Service.create({
      name: 'Full Balayage Coloring',
      category: 'coloring',
      price: 3200,
      durationMinutes: 90,
      description: 'Premium organic color treatment with bespoke hand-painted highlights.',
      salonId: salon1._id
    });

    const s1_beard = await Service.create({
      name: 'Royal Hot Towel Beard Trim',
      category: 'beard',
      price: 450,
      durationMinutes: 30,
      description: 'Precision beard shaping, razor outlining, and relaxing hot towel treatment.',
      salonId: salon1._id
    });

    const s1_facial = await Service.create({
      name: 'Detoxifying Facial Spa',
      category: 'facial',
      price: 1200,
      durationMinutes: 45,
      description: 'Exfoliation, steam cleaning, charcoal mask, and cooling massage.',
      salonId: salon1._id
    });

    const staff1_1 = await Staff.create({
      name: 'Marcus Vance',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
      specialties: ['Haircut', 'Beard'],
      workingHours: [
        { day: 'monday', start: '09:00', end: '18:00' },
        { day: 'tuesday', start: '09:00', end: '18:00' },
        { day: 'wednesday', start: '09:00', end: '18:00' },
        { day: 'thursday', start: '09:00', end: '18:00' },
        { day: 'friday', start: '09:00', end: '18:00' },
        { day: 'saturday', start: '09:00', end: '18:00' },
        { day: 'sunday', start: '00:00', end: '00:00', isOff: true }
      ],
      salonId: salon1._id
    });

    const staff1_2 = await Staff.create({
      name: 'Sophia Alvarez',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
      specialties: ['Coloring', 'Facial'],
      workingHours: [
        { day: 'monday', start: '00:00', end: '00:00', isOff: true },
        { day: 'tuesday', start: '10:00', end: '19:00' },
        { day: 'wednesday', start: '10:00', end: '19:00' },
        { day: 'thursday', start: '10:00', end: '19:00' },
        { day: 'friday', start: '10:00', end: '19:00' },
        { day: 'saturday', start: '10:00', end: '20:00' },
        { day: 'sunday', start: '10:00', end: '18:00' }
      ],
      salonId: salon1._id
    });


    // ─── SALON 2: CROWN & SCISSORS (BANGALORE) ────────────────────────────────
    console.log('Creating "Crown & Scissors" (Bangalore)...');
    const salon2 = await Salon.create({
      name: 'Crown & Scissors Barbers',
      description: 'Expert barbering and contemporary grooming services. Specializing in skin-fades, modern hair designs, and straight-shaves.',
      address: '102, Indiranagar 100 Feet Rd',
      city: 'Bangalore',
      ownerId: owner._id,
      images: [
        'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=600&auto=format&fit=crop'
      ],
      openingHours: {
        monday: { open: '10:00', close: '21:00', isClosed: false },
        tuesday: { open: '10:00', close: '21:00', isClosed: false },
        wednesday: { open: '10:00', close: '21:00', isClosed: false },
        thursday: { open: '10:00', close: '21:00', isClosed: false },
        friday: { open: '10:00', close: '21:00', isClosed: false },
        saturday: { open: '10:00', close: '22:00', isClosed: false },
        sunday: { open: '10:00', close: '20:00', isClosed: false }
      },
      avgRating: 4.5,
      totalReviews: 1
    });

    const s2_haircut = await Service.create({
      name: 'Executive Skin Fade',
      category: 'haircut',
      price: 600,
      durationMinutes: 30,
      description: 'Precision skin fade or taper with razor neck shave.',
      salonId: salon2._id
    });

    const s2_shave = await Service.create({
      name: 'Traditional Straight Razor Shave',
      category: 'beard',
      price: 350,
      durationMinutes: 30,
      description: 'Pre-shave oil massage, hot towel, warm lather, straight shave, and moisturizing balm.',
      salonId: salon2._id
    });

    const s2_treatment = await Service.create({
      name: 'Hair Nourishing Therapy',
      category: 'treatment',
      price: 900,
      durationMinutes: 45,
      description: 'Strengthening hair treatment wash with scalp massage.',
      salonId: salon2._id
    });

    const staff2_1 = await Staff.create({
      name: 'Kenji Sato',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
      specialties: ['Haircut', 'Beard'],
      workingHours: [
        { day: 'monday', start: '10:00', end: '19:00' },
        { day: 'tuesday', start: '00:00', end: '00:00', isOff: true },
        { day: 'wednesday', start: '10:00', end: '19:00' },
        { day: 'thursday', start: '10:00', end: '19:00' },
        { day: 'friday', start: '10:00', end: '19:00' },
        { day: 'saturday', start: '10:00', end: '20:00' },
        { day: 'sunday', start: '10:00', end: '18:00' }
      ],
      salonId: salon2._id
    });


    // ─── SALON 3: GLITZ & GLAMOUR (MUMBAI) ────────────────────────────────────
    console.log('Creating "Glitz & Glamour" (Mumbai)...');
    const salon3 = await Salon.create({
      name: 'Glitz & Glamour Boutique',
      description: 'Chic modern beauty parlor offering hair styling, gel nail art, deep tissue massage, and facial therapy in a relaxed aesthetic studio.',
      address: '82, Linking Road, Bandra West',
      city: 'Mumbai',
      ownerId: owner._id,
      images: [
        'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=600&auto=format&fit=crop'
      ],
      openingHours: {
        monday: { open: '10:00', close: '20:00', isClosed: false },
        tuesday: { open: '10:00', close: '20:00', isClosed: false },
        wednesday: { open: '10:00', close: '20:00', isClosed: false },
        thursday: { open: '10:00', close: '20:00', isClosed: false },
        friday: { open: '10:00', close: '20:00', isClosed: false },
        saturday: { open: '10:00', close: '21:00', isClosed: false },
        sunday: { open: '11:00', close: '19:00', isClosed: false }
      },
      avgRating: 4.7,
      totalReviews: 2
    });

    const s3_styling = await Service.create({
      name: 'Volume Blowout & Styling',
      category: 'styling',
      price: 1100,
      durationMinutes: 45,
      description: 'Luxury shampoo, head massage, blow dry styling, and styling spray.',
      salonId: salon3._id
    });

    const s3_nails = await Service.create({
      name: 'Gel Nail Art & Manicure',
      category: 'nails',
      price: 1400,
      durationMinutes: 60,
      description: 'Nail shaping, cuticle therapy, gel extensions, and custom hand-painted nail designs.',
      salonId: salon3._id
    });

    const s3_massage = await Service.create({
      name: 'Aromatherapy Deep Tissue Massage',
      category: 'massage',
      price: 2400,
      durationMinutes: 60,
      description: 'Stress-relieving massage with organic essential oils and hot stones.',
      salonId: salon3._id
    });

    const staff3_1 = await Staff.create({
      name: 'Emma Stone',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop',
      specialties: ['Styling', 'Nails'],
      workingHours: [
        { day: 'monday', start: '10:00', end: '19:00' },
        { day: 'tuesday', start: '10:00', end: '19:00' },
        { day: 'wednesday', start: '10:00', end: '19:00' },
        { day: 'thursday', start: '10:00', end: '19:00' },
        { day: 'friday', start: '10:00', end: '19:00' },
        { day: 'saturday', start: '10:00', end: '20:00' },
        { day: 'sunday', start: '00:00', end: '00:00', isOff: true }
      ],
      salonId: salon3._id
    });

    const staff3_2 = await Staff.create({
      name: 'Zoe Kravitz',
      photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=150&auto=format&fit=crop',
      specialties: ['Massage'],
      workingHours: [
        { day: 'monday', start: '00:00', end: '00:00', isOff: true },
        { day: 'tuesday', start: '10:00', end: '19:00' },
        { day: 'wednesday', start: '10:00', end: '19:00' },
        { day: 'thursday', start: '10:00', end: '19:00' },
        { day: 'friday', start: '10:00', end: '19:00' },
        { day: 'saturday', start: '10:00', end: '21:00' },
        { day: 'sunday', start: '11:00', end: '18:00' }
      ],
      salonId: salon3._id
    });


    // ─── SALON 4: URBAN SHAVE CO. (BANGALORE) ─────────────────────────────────
    console.log('Creating "Urban Shave Co." (Bangalore)...');
    const salon4 = await Salon.create({
      name: 'Urban Shave Co.',
      description: 'A modern, clean-cut male grooming studio designed for the urban professional. Focused on premium trims, fades, and skin care.',
      address: '15, HSR Layout, Sector 6',
      city: 'Bangalore',
      ownerId: owner._id,
      images: [
        'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600&auto=format&fit=crop'
      ],
      openingHours: {
        monday: { open: '09:00', close: '21:00', isClosed: false },
        tuesday: { open: '09:00', close: '21:00', isClosed: false },
        wednesday: { open: '09:00', close: '21:00', isClosed: false },
        thursday: { open: '09:00', close: '21:00', isClosed: false },
        friday: { open: '09:00', close: '21:00', isClosed: false },
        saturday: { open: '09:00', close: '21:00', isClosed: false },
        sunday: { open: '10:00', close: '20:00', isClosed: false }
      },
      avgRating: 4.9,
      totalReviews: 1
    });

    const s4_haircut = await Service.create({
      name: 'Urban Express Buzz Cut',
      category: 'haircut',
      price: 350,
      durationMinutes: 20,
      description: 'Quick single-guard buzz cut with hot-lather neck cleanup.',
      salonId: salon4._id
    });

    const s4_beard = await Service.create({
      name: 'Bespoke Beard Sculpting',
      category: 'beard',
      price: 300,
      durationMinutes: 20,
      description: 'Beard trimming, clipper shaping, oil massage, and alignment.',
      salonId: salon4._id
    });

    const staff4_1 = await Staff.create({
      name: 'David Beckham',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop',
      specialties: ['Haircut', 'Beard'],
      workingHours: [
        { day: 'monday', start: '09:00', end: '18:00' },
        { day: 'tuesday', start: '09:00', end: '18:00' },
        { day: 'wednesday', start: '09:00', end: '18:00' },
        { day: 'thursday', start: '09:00', end: '18:00' },
        { day: 'friday', start: '09:00', end: '18:00' },
        { day: 'saturday', start: '09:00', end: '20:00' },
        { day: 'sunday', start: '10:00', end: '18:00' }
      ],
      salonId: salon4._id
    });


    // ─── CUSTOMERS & COMPLETED BOOKINGS ───────────────────────────────────────
    console.log('Creating demo customers and completed bookings...');
    let customer1 = await User.findOne({ email: 'customer@example.com' });
    if (!customer1) {
      customer1 = await User.create({
        name: 'Rohan Sharma',
        email: 'customer@example.com',
        password: 'Password123',
        phone: '9898989898',
        role: 'customer',
      });
    }

    let customer2 = await User.findOne({ email: 'skshafiullashakhadar@gmail.com' });
    if (!customer2) {
      customer2 = await User.create({
        name: 'Shaik Shafi',
        email: 'skshafiullashakhadar@gmail.com',
        password: 'Password123',
        phone: '9999999999',
        role: 'customer',
      });
    }

    // Bookings for Salon 1 (The Velvet Chair)
    const booking1 = await Booking.create({
      customerId: customer1._id,
      salonId: salon1._id,
      serviceId: s1_haircut._id,
      staffId: staff1_1._id,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '10:30',
      status: 'completed',
      paymentStatus: 'paid',
      amount: s1_haircut.price,
    });

    const booking2 = await Booking.create({
      customerId: customer2._id,
      salonId: salon1._id,
      serviceId: s1_coloring._id,
      staffId: staff1_2._id,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '15:30',
      status: 'completed',
      paymentStatus: 'paid',
      amount: s1_coloring.price,
    });

    // Booking for Salon 2 (Crown & Scissors)
    const booking3 = await Booking.create({
      customerId: customer1._id,
      salonId: salon2._id,
      serviceId: s2_haircut._id,
      staffId: staff2_1._id,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: '11:00',
      endTime: '11:30',
      status: 'completed',
      paymentStatus: 'paid',
      amount: s2_haircut.price,
    });

    // Bookings for Salon 3 (Glitz & Glamour)
    const booking4 = await Booking.create({
      customerId: customer2._id,
      salonId: salon3._id,
      serviceId: s3_nails._id,
      staffId: staff3_1._id,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: '12:00',
      endTime: '13:00',
      status: 'completed',
      paymentStatus: 'paid',
      amount: s3_nails.price,
    });

    const booking5 = await Booking.create({
      customerId: customer1._id,
      salonId: salon3._id,
      serviceId: s3_massage._id,
      staffId: staff3_2._id,
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: '16:00',
      endTime: '17:00',
      status: 'completed',
      paymentStatus: 'paid',
      amount: s3_massage.price,
    });

    // Booking for Salon 4 (Urban Shave Co)
    const booking6 = await Booking.create({
      customerId: customer2._id,
      salonId: salon4._id,
      serviceId: s4_beard._id,
      staffId: staff4_1._id,
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: '15:00',
      endTime: '15:20',
      status: 'completed',
      paymentStatus: 'paid',
      amount: s4_beard.price,
    });


    // ─── REVIEWS ──────────────────────────────────────────────────────────────
    console.log('Creating reviews...');
    // Salon 1 reviews
    await Review.create({
      customerId: customer1._id,
      salonId: salon1._id,
      bookingId: booking1._id,
      rating: 5,
      comment: 'Excellent haircut by Marcus! The hot towel shave was relaxing. Premium service.',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    });

    await Review.create({
      customerId: customer2._id,
      salonId: salon1._id,
      bookingId: booking2._id,
      rating: 4,
      comment: 'Really nice ambiance. Sophia was great with coloring.',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });

    // Salon 2 reviews
    await Review.create({
      customerId: customer1._id,
      salonId: salon2._id,
      bookingId: booking3._id,
      rating: 5,
      comment: 'Kenji gives the absolute best fades in the city.',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    });

    // Salon 3 reviews
    await Review.create({
      customerId: customer2._id,
      salonId: salon3._id,
      bookingId: booking4._id,
      rating: 5,
      comment: 'Emma Stone did an amazing job with my nail art extension. Absolutely loved the details!',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    await Review.create({
      customerId: customer1._id,
      salonId: salon3._id,
      bookingId: booking5._id,
      rating: 4,
      comment: 'The aromatherapy massage by Zoe was very soothing and stress-relieving.',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    });

    // Salon 4 reviews
    await Review.create({
      customerId: customer2._id,
      salonId: salon4._id,
      bookingId: booking6._id,
      rating: 5,
      comment: 'Expert beard sculpting by David. Perfect styling!',
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    });

    console.log('🏁 Database seeding finished successfully!');
    if (shouldDisconnect) {
      mongoose.disconnect();
    }
  } catch (err) {
    console.error('❌ Database seeding failed:', err);
    if (shouldDisconnect) {
      process.exit(1);
    } else {
      throw err;
    }
  }
};

if (require.main === module) {
  seedData(true);
} else {
  module.exports = seedData;
}
