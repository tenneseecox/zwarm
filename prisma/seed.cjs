const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  // Create test users
  const testUser1 = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'test@example.com',
      username: 'testuser',
      emoji: '🚀',
    },
  });

  const testUser2 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'alice@example.com',
      username: 'alice',
      emoji: '🎨',
    },
  });

  // Create a third user for more variety in participants
  const testUser3 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'bob@example.com',
      username: 'bob',
      emoji: '🎮',
    },
  });

  // Create missions for first user
  const missions1 = [
    {
      title: 'Build a Rocket',
      description: 'Design and build a model rocket that can reach 1000ft',
      emoji: '🚀',
      tags: ['engineering', 'aerospace'],
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
      tasks: [
        { text: 'Plan garden layout', isCompleted: true },
        { text: 'Prepare soil', isCompleted: true },
        { text: 'Plant seeds', isCompleted: false },
      ],
    },
  ];

  // Create missions for second user
  const missions2 = [
    {
      title: 'Digital Art Portfolio',
      description: 'Create a collection of digital artwork for portfolio',
      emoji: '🎨',
      tags: ['art', 'digital'],
      tasks: [
        { text: 'Research digital art styles', isCompleted: true },
        { text: 'Create 5 original pieces', isCompleted: false },
        { text: 'Set up portfolio website', isCompleted: false },
      ],
    },
    {
      title: 'Cookbook Project',
      description: 'Compile family recipes into a digital cookbook',
      emoji: '📖',
      tags: ['cooking', 'family'],
      tasks: [
        { text: 'Collect family recipes', isCompleted: true },
        { text: 'Photograph each dish', isCompleted: true },
        { text: 'Design cookbook layout', isCompleted: false },
      ],
    },
    {
      title: 'Fitness Challenge',
      description: 'Complete a 30-day fitness challenge',
      emoji: '💪',
      tags: ['fitness', 'health'],
      tasks: [
        { text: 'Create workout schedule', isCompleted: true },
        { text: 'Track daily progress', isCompleted: false },
        { text: 'Complete final assessment', isCompleted: false },
      ],
    },
  ];

  // Helper function to create missions
  async function createMissions(missions, user) {
    for (const mission of missions) {
      const { tasks, ...missionData } = mission;
      
      // First, try to find existing mission
      const existingMission = await prisma.mission.findFirst({
        where: {
          title: missionData.title,
          ownerId: user.id,
        },
      });

      if (existingMission) {
        console.log(`Mission already exists: ${missionData.title}`);
        continue;
      }

      const createdMission = await prisma.mission.create({
        data: {
          ...missionData,
          owner: {
            connect: { id: user.id }
          },
          tasks: {
            create: tasks.map(task => ({
              ...task,
              creator: {
                connect: { id: user.id }
              }
            }))
          },
        },
      });
      console.log(`Created mission: ${createdMission.title}`);
    }
  }

  // Create missions for both users
  await createMissions(missions1, testUser1);
  await createMissions(missions2, testUser2);

  // Add participants to existing missions
  async function addParticipantsToMissions() {
    // Get all missions
    const allMissions = await prisma.mission.findMany();
    
    for (const mission of allMissions) {
      // Skip if mission already has participants
      const existingParticipants = await prisma.missionParticipant.count({
        where: { missionId: mission.id }
      });
      
      if (existingParticipants > 0) {
        console.log(`Mission ${mission.title} already has participants, skipping...`);
        continue;
      }

      // Add participants based on mission owner
      const participants = mission.ownerId === testUser1.id 
        ? [testUser2, testUser3]  // If testUser1 owns it, add testUser2 and testUser3
        : [testUser1, testUser3]; // If testUser2 owns it, add testUser1 and testUser3

      for (const participant of participants) {
        await prisma.missionParticipant.create({
          data: {
            mission: { connect: { id: mission.id } },
            user: { connect: { id: participant.id } }
          }
        });
        console.log(`Added ${participant.username} to mission: ${mission.title}`);
      }
    }
  }

  // Add participants to all missions
  await addParticipantsToMissions();

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