import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const hashedPassword = await hash('test123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      username: 'testuser',
      emoji: '🚀',
      hashedPassword,
    },
  });

  // Create some missions
  const missions = [
    {
      title: 'Build a Rocket',
      description: 'Design and build a model rocket that can reach 1000ft',
      emoji: '🚀',
      tags: ['engineering', 'aerospace'],
      creatorId: testUser.id,
      tasks: [
        { text: 'Research rocket designs', isCompleted: true },
        { text: 'Create blueprint', isCompleted: false },
        { text: 'Build prototype', isCompleted: false },
      ],
    },
    {
      title: 'Learn Rust',
      description: 'Master the Rust programming language',
      emoji: '🦀',
      tags: ['programming', 'learning'],
      creatorId: testUser.id,
      tasks: [
        { text: 'Read the Rust book', isCompleted: true },
        { text: 'Complete Rustlings', isCompleted: false },
        { text: 'Build a CLI tool', isCompleted: false },
      ],
    },
    {
      title: 'Garden Project',
      description: 'Create a sustainable vegetable garden',
      emoji: '🌱',
      tags: ['sustainability', 'gardening'],
      creatorId: testUser.id,
      tasks: [
        { text: 'Plan garden layout', isCompleted: true },
        { text: 'Prepare soil', isCompleted: true },
        { text: 'Plant seeds', isCompleted: false },
      ],
    },
  ];

  // Create missions with tasks
  for (const mission of missions) {
    const { tasks, ...missionData } = mission;
    const createdMission = await prisma.mission.create({
      data: {
        ...missionData,
        tasks: {
          create: tasks,
        },
      },
    });
    console.log(`Created mission: ${createdMission.title}`);
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 