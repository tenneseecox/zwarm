// src/app/profile/[userId]/page.tsx
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header'; ///page.tsx]
import { SwarmBackground } from '@/components/SwarmBackground'; ///page.tsx]
import { MissionCard, type Mission as MissionCardType } from '@/components/MissionCard'; //
import { UserCircle } from 'lucide-react'; ///page.tsx]
import { Badge } from '@/components/ui/badge';

interface UserProfilePageProps {
  params: {
    userId: string;
  };
}

interface UserProfileData {
  user: {
    id: string;
    username: string | null;
    emoji: string | null;
    bio: string | null;
    skills: string[];
    createdAt: string;
  };
  ownedMissions: MissionCardType[];
  joinedMissions: MissionCardType[];
}

async function getUserProfile(userId: string): Promise<UserProfileData | null> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${siteUrl}/api/users/${userId}`, {
      cache: 'no-store', // Fetch fresh data
    });

    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      console.error("Failed to fetch user profile (page):", response.status, await response.text());
      return null; // Or throw an error to be caught by an error boundary
    }
    return await response.json();
  } catch (error) {
    console.error(`Error in getUserProfile (page) for ID ${userId}:`, error);
    return null;
  }
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const profileData = await getUserProfile(params.userId);

  if (!profileData || !profileData.user) {
    notFound();
  }

  const { user, ownedMissions, joinedMissions } = profileData;

  return (
    <div className="min-h-screen bg-black-950 text-white">
      <SwarmBackground /> {/* */}
      <Header /> {/* */}
      <main className="relative z-10 container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* User Info Card */}
          <div className="glass-dark rounded-2xl p-8 shadow-zwarm-dark border border-yellow-500/10 hover:border-yellow-500/20 transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-start gap-8">
              <div className="text-6xl sm:text-8xl bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-4 w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center shadow-zwarm-glow border-2 border-yellow-100 transform hover:scale-105 transition-transform duration-300">
                {user.emoji || <UserCircle className="w-16 h-16 sm:w-20 sm:h-20 text-black-900" />}
              </div>
              <div className="flex-1 space-y-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                    {user.username || 'Anonymous User'}
                  </h1>
                  <p className="text-gray-400 text-sm mt-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/50"></span>
                    Joined Zwarm on {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {user.bio && (
                  <div className="mt-6">
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-lg">
                      {user.bio}
                    </p>
                  </div>
                )}

                {user.skills && user.skills.length > 0 && (
                  <div className="mt-6">
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-all duration-300 rounded-full px-4 py-1.5 text-sm font-medium border border-yellow-500/20"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contributions Section */}
          <div className="glass-dark rounded-2xl p-8 shadow-zwarm-dark border border-yellow-500/10 hover:border-yellow-500/20 transition-all duration-300">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent mb-4">
              Contributions
            </h2>
            <div className="text-gray-400 italic bg-black-500/20 rounded-xl p-4 border border-yellow-500/10">
              Coming soon: Track and showcase your impact across the Zwarm ecosystem.
            </div>
          </div>

          {/* Owned Missions Section */}
          <div className="glass-dark rounded-2xl p-8 shadow-zwarm-dark border border-yellow-500/10 hover:border-yellow-500/20 transition-all duration-300">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent mb-6 border-b border-yellow-500/20 pb-3">
              Missions Owned ({ownedMissions.length})
            </h2>
            {ownedMissions.length === 0 ? (
              <p className="text-gray-400 italic bg-black-500/20 rounded-xl p-4 border border-yellow-500/10">
                This user hasn&apos;t created any missions yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ownedMissions.map((mission) => (
                  <MissionCard key={`owned-${mission.id}`} {...mission} />
                ))}
              </div>
            )}
          </div>

          {/* Joined Missions Section */}
          <div className="glass-dark rounded-2xl p-8 shadow-zwarm-dark border border-yellow-500/10 hover:border-yellow-500/20 transition-all duration-300">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent mb-6 border-b border-yellow-500/20 pb-3">
              Missions Joined ({joinedMissions.length})
            </h2>
            {joinedMissions.length === 0 ? (
              <p className="text-gray-400 italic bg-black-500/20 rounded-xl p-4 border border-yellow-500/10">
                This user hasn&apos;t joined any missions yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {joinedMissions.map((mission) => (
                  <MissionCard key={`joined-${mission.id}`} {...mission} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}