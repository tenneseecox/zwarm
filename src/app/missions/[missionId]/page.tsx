// src/app/missions/[missionId]/page.tsx
import { Header } from '@/components/Header';
import { SwarmBackground } from '@/components/SwarmBackground';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cookies } from 'next/headers';
import { UserCircle } from 'lucide-react'; // Import UserCircle icon
import Link from 'next/link';
import { DeleteMissionButton } from '@/components/DeleteMissionButton';
import { AddTaskForm } from '@/components/AddTaskForm';
import { TaskList } from '@/components/TaskList';
import { EmojiAvatar } from '@/components/EmojiAvatar';

// Import the new components and helpers
import { JoinLeaveButton } from '@/components/JoinLeaveButton'; // Adjust path if needed
import { createClient } from '@/utils/supabase/server'; // Your Supabase server client helper

interface MissionDetailPageProps {
  params: {
    missionId: string;
  };
}

interface TaskCreator {
  id: string;
  username: string | null;
  emoji: string | null;
}

export interface MissionTaskData {
  id: string;
  text: string;
  isCompleted: boolean;
  createdAt: string; // Or Date, depending on API transformation
  creator: TaskCreator;
  // missionId?: string; // Potentially, if needed by client components
}

interface ParticipantUser { // Define a type for the user part of a participant
  id: string;
  username: string | null;
  emoji: string | null;
}

interface MissionParticipantInfo { // Define a type for each item in the participants list
  joinedAt?: string; // Assuming it's an ISO string if you select it
  user: ParticipantUser;
}

export interface DetailedMission {
  id: string;
  title: string;
  description: string;
  emoji: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  owner?: ParticipantUser; 
  tags?: string[];
  _count?: {
    participants?: number;
  };
  currentUserIsParticipant?: boolean;
  participants?: MissionParticipantInfo[];
  tasks?: MissionTaskData[]; 
}

async function getMissionDetails(missionId: string): Promise<DetailedMission | null> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${siteUrl}/api/missions/${missionId}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      console.error("Failed to fetch mission details (page):", response.status, await response.text());
      return null;
    }
    const data: DetailedMission = await response.json();
    return data;
  } catch (error) {
    console.error(`Error in getMissionDetails (page) for ID ${missionId}:`, error);
    return null;
  }
}

export default async function MissionDetailPage({ params }: MissionDetailPageProps) {
  const { missionId } = await params;

  // Fetch current user on the server to determine ownership and pass login status
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const mission = await getMissionDetails(missionId);

  if (!mission) {
    notFound();
  }

  const tasks = mission.tasks || [];
  const isOwner = !!currentUser && mission.owner?.id === currentUser.id;
  const participantCount = mission._count?.participants ?? 0;
  const participantsList = mission.participants || [];
  const currentUserIsParticipant = mission.currentUserIsParticipant ?? false;

  return (
    <div className="min-h-screen bg-black-950 text-white">
      <SwarmBackground />
      <Header /> {/* Ensure Header updates based on auth state if needed */}
      <main className="relative z-10 container mx-auto px-4 py-12 md:py-16">
        <article className="max-w-3xl mx-auto glass-dark p-6 md:p-8 rounded-2xl shadow-zwarm-dark">
          <div className="flex items-start gap-4 mb-6">
            <EmojiAvatar emoji={mission.emoji} size="lg" />
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2 break-words">
                {mission.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                <span>Owned by: {mission.owner?.username || 'Unknown User'} {mission.owner?.emoji}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-400 mb-1">
                <span>Status: </span>
                <Badge
                  variant={mission.status === 'OPEN' ? 'default' : mission.status === 'COMPLETED' ? 'secondary' : 'outline'}
                  className={
                    mission.status === 'OPEN' ? 'bg-green-600 text-white' :
                    mission.status === 'COMPLETED' ? 'bg-blue-600 text-white' :
                    'border-gray-600 text-gray-300'
                  }
                >
                  {mission.status}
                </Badge>
                <span>| Created: {new Date(mission.createdAt).toLocaleDateString()}</span>
              </div>
              {/* Display Participant Count */}
              <div className="text-sm text-gray-400 mb-3">
                <span>Participants: {participantCount}</span>
              </div>

              {/* Display Tags */}
              {mission.tags && mission.tags.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {mission.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="border-yellow-500 text-yellow-400">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed mb-8">
            <p>{mission.description}</p>
          </div>

          {/* Join/Leave Button Area */}
          <div className="mb-8">
            <JoinLeaveButton
              missionId={mission.id}
              initialIsJoined={currentUserIsParticipant}
              isOwner={isOwner}
              isLoggedIn={!!currentUser}
            />
          </div>

          {isOwner && (
            <div className="mt-6 mb-8 text-center sm:text-left flex gap-4"> {/* Added flex and gap */}
              <Button asChild variant="outline" className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10">
                <Link href={`/missions/${mission.id}/edit`}>
                  ✏️ Edit Mission
                </Link>
              </Button>
              <DeleteMissionButton missionId={mission.id} missionTitle={mission.title} />
            </div>
          )}  

          {/* Mission Control / Participants Section */}
          <div className="mt-10 border-t border-gray-700 pt-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Mission Control</h2>
            
            <h3 className="text-xl font-semibold text-yellow-400 mb-3">Participants ({participantCount})</h3>
            {participantsList.length > 0 ? (
              <ul className="space-y-3">
                {participantsList
                  .sort((a, b) => {
                    // Put current user at the top
                    if (a.user.id === currentUser?.id) return -1;
                    if (b.user.id === currentUser?.id) return 1;
                    // Then sort by join date
                    return new Date(a.joinedAt || '').getTime() - new Date(b.joinedAt || '').getTime();
                  })
                  .map((participant) => (
                    <li key={participant.user.id} className="flex items-center gap-3 p-3 bg-black-900/50 rounded-xl border border-gray-700/50">
                      <span className="text-2xl">
                        {participant.user.emoji || <UserCircle className="h-6 w-6 text-gray-400" />}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-200 font-medium">
                          {participant.user.username || 'Anonymous Participant'}
                        </span>
                        {participant.user.id === currentUser?.id && (
                          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            YOU
                          </Badge>
                        )}
                      </div>
                      {participant.joinedAt && (
                        <span className="text-xs text-gray-500 ml-auto">
                          Joined: {new Date(participant.joinedAt).toLocaleDateString()}
                        </span>
                      )}
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-gray-400">No participants have joined this mission yet. Be the first!</p>
            )}
            
            <p className="text-gray-400 mt-6">More mission tools (tasks, discussions) will appear here soon!</p>
          </div>

          <div className="mt-10 border-t border-gray-700 pt-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Mission Tasks</h2>
            
            {isOwner && (
              <div className="mb-6 rounded-xl overflow-hidden">
                <AddTaskForm missionId={mission.id} />
              </div>
            )}

            <div className="rounded-xl overflow-hidden">
              <TaskList
                tasks={tasks}
                missionId={mission.id}
                currentUserId={currentUser?.id}
                missionOwnerId={mission.owner?.id}
              />
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}