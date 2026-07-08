import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.wIPOutput.deleteMany();
  await prisma.wIPMaterial.deleteMany();
  await prisma.manufacturing.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.product.deleteMany();

  // Seed Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        productCode: 'PRD-001',
        name: 'Stainless Steel Bolt M10',
        description: 'High-grade stainless steel hex bolt, M10 x 50mm',
        weight: 0.045,
        price: 12.50,
        quantity: 2500,
      },
    }),
    prisma.product.create({
      data: {
        productCode: 'PRD-002',
        name: 'Copper Wire Spool (1mm)',
        description: 'Pure copper wire, 1mm diameter, 100m spool',
        weight: 0.85,
        price: 450.00,
        quantity: 180,
      },
    }),
    prisma.product.create({
      data: {
        productCode: 'PRD-003',
        name: 'Aluminum Sheet 2mm',
        description: 'Aluminum alloy sheet, 2mm thickness, 1200x600mm',
        weight: 3.89,
        price: 1250.00,
        quantity: 75,
      },
    }),
    prisma.product.create({
      data: {
        productCode: 'PRD-004',
        name: 'Rubber Gasket Set',
        description: 'Industrial rubber gasket set, assorted sizes (10 pcs)',
        weight: 0.12,
        price: 85.00,
        quantity: 500,
      },
    }),
    prisma.product.create({
      data: {
        productCode: 'PRD-005',
        name: 'LED Circuit Board v2',
        description: 'Pre-assembled LED driver circuit board, 12V input',
        weight: 0.035,
        price: 320.00,
        quantity: 340,
      },
    }),
    prisma.product.create({
      data: {
        productCode: 'PRD-006',
        name: 'Nylon Cable Ties (Pack of 100)',
        description: 'Self-locking nylon cable ties, 200mm, black',
        weight: 0.15,
        price: 45.00,
        quantity: 1200,
      },
    }),
    prisma.product.create({
      data: {
        productCode: 'PRD-007',
        name: 'Industrial Ball Bearing 6205',
        description: 'Deep groove ball bearing, 25x52x15mm',
        weight: 0.13,
        price: 175.00,
        quantity: 420,
      },
    }),
    prisma.product.create({
      data: {
        productCode: 'PRD-008',
        name: 'PVC Pipe 2-inch (3m)',
        description: 'Schedule 40 PVC pipe, 2-inch diameter, 3 meter length',
        weight: 2.1,
        price: 280.00,
        quantity: 150,
      },
    }),
    prisma.product.create({
      data: {
        productCode: 'PRD-009',
        name: 'Thermal Paste Tube',
        description: 'High performance thermal compound, 5g tube',
        weight: 0.02,
        price: 95.00,
        quantity: 600,
      },
    }),
    prisma.product.create({
      data: {
        productCode: 'PRD-010',
        name: 'Steel Mounting Bracket',
        description: 'Heavy-duty steel L-bracket, zinc plated, 100x80mm',
        weight: 0.25,
        price: 65.00,
        quantity: 800,
      },
    }),
  ]);

  // Seed Customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Rajesh Electronics Pvt Ltd',
        email: 'procurement@rajeshelectronics.in',
        phone: '+91 98765 43210',
        address: '42, Industrial Area Phase II, Pune, Maharashtra 411026',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Sharma Manufacturing Co.',
        email: 'orders@sharmamfg.com',
        phone: '+91 87654 32109',
        address: '15/A, GIDC Estate, Ahmedabad, Gujarat 382445',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'TechnoFab Solutions',
        email: 'supply@technofab.in',
        phone: '+91 76543 21098',
        address: 'Block C, Sector 62, Noida, Uttar Pradesh 201309',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Bharat Heavy Electricals',
        email: 'vendor@bhe.co.in',
        phone: '+91 65432 10987',
        address: '8, MG Road, Bengaluru, Karnataka 560001',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Patel Hardware Distributors',
        email: 'info@patelhardware.com',
        phone: '+91 54321 09876',
        address: '23, Market Yard, Surat, Gujarat 395003',
      },
    }),
  ]);

  // Seed Suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'Global Steel Traders',
        email: 'sales@globalsteel.com',
        phone: '+91 98111 22233',
        address: '12, Steel Market, Jamshedpur, Jharkhand 831001',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Sunita Polymers Ltd',
        email: 'orders@sunitapolymers.in',
        phone: '+91 87222 33344',
        address: '45, Chemical Zone, Vadodara, Gujarat 390020',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Krishna Electricals',
        email: 'supply@krishnaelec.com',
        phone: '+91 76333 44455',
        address: '9, Lajpat Nagar, New Delhi 110024',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Metro Components Intl',
        email: 'info@metrocomp.com',
        phone: '+91 65444 55566',
        address: '67, Export Zone, Chennai, Tamil Nadu 600032',
      },
    }),
  ]);

  // Seed Sales Orders
  await prisma.order.create({
    data: {
      orderNumber: 'SO-2026-001',
      type: 'sale',
      status: 'completed',
      customerId: customers[0].id,
      notes: 'Urgent delivery - expedited shipping',
      totalAmount: 6400.00,
      items: {
        create: [
          { productId: products[0].id, quantity: 200, price: 12.50 },
          { productId: products[4].id, quantity: 10, price: 320.00 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: 'SO-2026-002',
      type: 'sale',
      status: 'packing',
      customerId: customers[1].id,
      notes: 'Include test certificates',
      totalAmount: 18750.00,
      items: {
        create: [
          { productId: products[2].id, quantity: 15, price: 1250.00 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: 'SO-2026-003',
      type: 'sale',
      status: 'quotation',
      customerId: customers[2].id,
      totalAmount: 9350.00,
      items: {
        create: [
          { productId: products[6].id, quantity: 50, price: 175.00 },
          { productId: products[9].id, quantity: 10, price: 65.00 },
          { productId: products[5].id, quantity: 5, price: 45.00 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: 'SO-2026-004',
      type: 'sale',
      status: 'dispatch',
      customerId: customers[3].id,
      notes: 'Deliver to warehouse B',
      totalAmount: 3600.00,
      items: {
        create: [
          { productId: products[1].id, quantity: 8, price: 450.00 },
        ],
      },
    },
  });

  // Seed Purchase Orders
  await prisma.order.create({
    data: {
      orderNumber: 'PO-2026-001',
      type: 'purchase',
      status: 'completed',
      supplierId: suppliers[0].id,
      notes: 'Quarterly raw material restocking',
      totalAmount: 31250.00,
      items: {
        create: [
          { productId: products[0].id, quantity: 2500, price: 12.50 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: 'PO-2026-002',
      type: 'purchase',
      status: 'unpaid',
      supplierId: suppliers[1].id,
      totalAmount: 12500.00,
      items: {
        create: [
          { productId: products[3].id, quantity: 100, price: 85.00 },
          { productId: products[5].id, quantity: 100, price: 45.00 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: 'PO-2026-003',
      type: 'purchase',
      status: 'quotation_received',
      supplierId: suppliers[2].id,
      totalAmount: 48000.00,
      items: {
        create: [
          { productId: products[4].id, quantity: 150, price: 320.00 },
        ],
      },
    },
  });

  // Seed Manufacturing Batches
  await prisma.manufacturing.create({
    data: {
      batchNumber: 'MFG-2026-001',
      status: 'completed',
      notes: 'LED Assembly Line - Batch A',
      endDate: new Date(),
      materials: {
        create: [
          { productId: products[4].id, quantity: 20 },
          { productId: products[1].id, quantity: 5 },
        ],
      },
      outputs: {
        create: [
          { productId: products[9].id, quantity: 20 },
        ],
      },
    },
  });

  await prisma.manufacturing.create({
    data: {
      batchNumber: 'MFG-2026-002',
      status: 'in_progress',
      notes: 'Custom Bracket Assembly',
      materials: {
        create: [
          { productId: products[2].id, quantity: 10 },
          { productId: products[0].id, quantity: 100 },
        ],
      },
      outputs: {
        create: [
          { productId: products[9].id, quantity: 50 },
        ],
      },
    },
  });

  await prisma.manufacturing.create({
    data: {
      batchNumber: 'MFG-2026-003',
      status: 'in_progress',
      notes: 'Piping Assembly for Project Delta',
      materials: {
        create: [
          { productId: products[7].id, quantity: 30 },
          { productId: products[3].id, quantity: 60 },
        ],
      },
      outputs: {
        create: [
          { productId: products[7].id, quantity: 15 },
        ],
      },
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
