import { connectDB } from "../lib/db";
import User from "../lib/models/User";
import Category from "../lib/models/Category";
import Vendor from "../lib/models/Vendor";
import Service from "../lib/models/Service";
import Booking from "../lib/models/Booking";
import Payment from "../lib/models/Payment";

const categories = [
  {
    name: "Cleaning",
    description: "Professional cleaning services for your home",
    icon: "🧹",
    color: "#3B82F6",
  },
  {
    name: "Plumbing",
    description: "Expert plumbing and pipe repair",
    icon: "🔧",
    color: "#EF4444",
  },
  {
    name: "Electrical",
    description: "Electrical installation and repair",
    icon: "⚡",
    color: "#FBBF24",
  },
  {
    name: "Painting",
    description: "Interior and exterior painting",
    icon: "🎨",
    color: "#EC4899",
  },
  {
    name: "Carpentry",
    description: "Custom carpentry and furniture work",
    icon: "🪵",
    color: "#8B5A3C",
  },
  {
    name: "Moving",
    description: "Professional moving and storage",
    icon: "📦",
    color: "#06B6D4",
  },
];

async function seedDatabase() {
  try {
    await connectDB();
    console.log("Connected to database");

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Vendor.deleteMany({});
    await Service.deleteMany({});
    await Booking.deleteMany({});
    await Payment.deleteMany({});
    console.log("Cleared existing data");

    // Create categories
    const createdCategories = await Category.create(categories);
    console.log(`Created ${createdCategories.length} categories`);

    // Create demo users
    const users = [
      {
        name: "John User",
        email: "user@example.com",
        password: "password123",
        role: "user",
        phone: "555-0001",
        city: "New York",
      },
      {
        name: "Jane Vendor",
        email: "vendor@example.com",
        password: "password123",
        role: "vendor",
        phone: "555-0002",
        city: "New York",
      },
      {
        name: "Admin User",
        email: "admin@example.com",
        password: "password123",
        role: "admin",
      },
    ];

    const createdUsers = await User.create(users);
    console.log(`Created ${createdUsers.length} users`);

    // Create vendor profile
    const vendor = await Vendor.create({
      userId: createdUsers[1]._id,
      businessName: "Premium Services Co.",
      description: "Offering professional cleaning and maintenance services",
      rating: 4.8,
      totalBookings: 145,
      categories: [createdCategories[0]._id, createdCategories[1]._id],
      isVerified: true,
    });
    console.log("Created vendor profile");

    // Create services
    const services = [
      {
        vendorId: vendor._id,
        categoryId: createdCategories[0]._id,
        name: "Deep House Cleaning",
        description: "Comprehensive cleaning of your entire house",
        price: 199,
        duration: 240,
      },
      {
        vendorId: vendor._id,
        categoryId: createdCategories[0]._id,
        name: "Quick Apartment Clean",
        description: "Fast and efficient apartment cleaning",
        price: 79,
        duration: 120,
      },
      {
        vendorId: vendor._id,
        categoryId: createdCategories[1]._id,
        name: "Pipe Repair",
        description: "Expert pipe and fixture repair",
        price: 149,
        duration: 90,
      },
    ];

    const createdServices = await Service.create(services);
    console.log(`Created ${createdServices.length} services`);

    // Create demo bookings
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const booking = await Booking.create({
      userId: createdUsers[0]._id,
      serviceId: createdServices[0]._id,
      vendorId: vendor._id,
      bookingDate: futureDate,
      bookingTime: "14:00",
      status: "confirmed",
      price: createdServices[0].price,
      notes: "Please bring cleaning supplies",
    });
    console.log("Created booking");

    // Create payment
    await Payment.create({
      bookingId: booking._id,
      userId: createdUsers[0]._id,
      vendorId: vendor._id,
      amount: booking.price,
      status: "completed",
      method: "card",
      transactionId: "TXN_" + Date.now(),
    });
    console.log("Created payment");

    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
