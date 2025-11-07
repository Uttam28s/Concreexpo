import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123456', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@wallfloor.com' },
    update: {},
    create: {
      email: 'admin@wallfloor.com',
      password: adminPassword,
      name: 'Admin User',
      phone: '+919876543210',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create demo engineer
  const engineerPassword = await bcrypt.hash('Engineer@123', 10);
  const engineer = await prisma.user.upsert({
    where: { email: 'engineer@wallfloor.com' },
    update: {},
    create: {
      email: 'engineer@wallfloor.com',
      password: engineerPassword,
      name: 'John Engineer',
      phone: '+919876543211',
      role: 'ENGINEER',
      isActive: true,
    },
  });
  console.log('✅ Engineer user created:', engineer.email);

  // Create client types
  const clientTypes = [
    'Client',
    'Architect',
    'Contractor',
    'Builder',
    'Interior Designer',
    'Property Developer',
  ];

  for (const typeName of clientTypes) {
    await prisma.clientType.upsert({
      where: { name: typeName },
      update: {},
      create: { name: typeName },
    });
  }
  console.log('✅ Client types created');

  // Create some materials
  const materials = [
    'Wall Putty',
    'Tile Adhesive',
    'Grout',
    'Leveling Compound',
    'Primer',
    'Waterproofing Compound',
    'Epoxy',
    'Sealant',
  ];

  for (const materialName of materials) {
    await prisma.material.upsert({
      where: { name: materialName },
      update: {},
      create: {
        name: materialName,
        unit: 'Bucket',
        reorderLevel: 20,
        isActive: true,
      },
    });
  }
  console.log('✅ Materials created');

  // Create demo client
  const clientType = await prisma.clientType.findFirst({
    where: { name: 'Client' },
  });

  if (clientType) {
    await prisma.client.upsert({
      where: { id: 'demo-client-1' },
      update: {},
      create: {
        id: 'demo-client-1',
        name: 'ABC Construction',
        address: '123 Main St, Mumbai, Maharashtra 400001',
        primaryContact: '+919876543212',
        clientTypeId: clientType.id,
        alternateContactName: 'Site Manager',
        alternateContactPhone: '+919876543213',
        isActive: true,
      },
    });
    console.log('✅ Demo client created');
  }

  // Create settings
  await prisma.settings.upsert({
    where: { key: 'company_name' },
    update: {},
    create: {
      key: 'company_name',
      value: 'WallFloor',
    },
  });

  await prisma.settings.upsert({
    where: { key: 'admin_phone' },
    update: {},
    create: {
      key: 'admin_phone',
      value: '+919876543210',
    },
  });

  console.log('✅ Settings created');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
