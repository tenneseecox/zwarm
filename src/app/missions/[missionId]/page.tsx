// src/app/missions/[missionId]/page.tsx
import { Header } from '@/components/Header';
import { SwarmBackground } from '@/components/SwarmBackground';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { DeleteMissionButton } from '@/components/DeleteMissionButton';
import { AddTaskForm } from '@/components/AddTaskForm';
import { TaskList } from '@/components/TaskList';
import { AddCommentForm } from '@/components/AddCommentForm';
import { CommentList } from '@/components/CommentList';
import AddResourceForm from '@/components/AddResourceForm';
import { ResourceList } from '@/components/ResourceList';
import { JoinLeaveButton } from '@/components/JoinLeaveButton';
import { createClient } from '@/utils/supabase/server';
import { getAbsoluteUrl } from '@/utils/site-url';

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
  emoji: string | null;
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

interface CommentWithUser {
  id: string;
  content: string;
  createdAt: string; // Or Date, adjust based on how you handle dates
  user: {
    id: string;
    username: string | null;
    emoji: string | null;
  };
  missionId: string;
  // userId: string; // Already nested in user
}

interface MissionResourceData {
  id: string;
  title: string;
  url: string;
  description: string | null;
  createdAt: string; // Or Date
  user: { // User who added it
    id: string;
    username: string | null;
    emoji: string | null;
  };
  // missionId: string; // If needed
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
  comments?: CommentWithUser[];
  resources?: MissionResourceData[]; 
}

async function getMissionDetails(missionId: string): Promise<DetailedMission | null> {
  try {
    const response = await fetch(getAbsoluteUrl(`/api/missions/${missionId}`), {
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
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const mission = await getMissionDetails(missionId);

  if (!mission) {
    notFound();
  }

  const resources = mission.resources || [];
  const comments = mission.comments || [];
  const tasks = mission.tasks || [];
  const isOwner = !!currentUser && mission.owner?.id === currentUser.id;
  const participantCount = mission._count?.participants ?? 0;
  const participantsList = mission.participants || [];
  const currentUserIsParticipant = mission.currentUserIsParticipant ?? false;

  return (
    <div className="min-h-screen bg-black-950 text-white">
      <SwarmBackground />
      <Header />
      <main className="relative z-10 container mx-auto px-4 py-12 md:py-16">
        <article className="max-w-3xl mx-auto glass-dark rounded-2xl p-8 shadow-zwarm-dark border border-yellow-500/10 hover:border-yellow-500/20 transition-all duration-300">
          <div className="flex items-start gap-6 mb-8">
            <div className="text-4xl bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-4 w-16 h-16 flex items-center justify-center shadow-zwarm-glow border-2 border-yellow-100 transform hover:scale-105 transition-transform duration-300">
              {mission.emoji || '❓'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent mb-3 break-words">
                {mission.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <span>Owned by: </span>
                {mission.owner ? (
                  <Link 
                    href={`/profile/${mission.owner.id}`}
                    className="flex items-center gap-1.5 hover:text-yellow-400 transition-colors duration-300"
                  >
                    <span>{mission.owner.username || 'Anonymous User'}</span>
                    <span className="text-lg">{mission.owner.emoji}</span>
                  </Link>
                ) : (
                  <span>Unknown User</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/50"></span>
                  <Badge
                    variant="secondary"
                    className={
                      mission.status === 'OPEN' ? 'bg-green-600/20 text-green-400' :
                      mission.status === 'COMPLETED' ? 'bg-blue-600/20 text-blue-400' :
                      'bg-gray-600/20 text-gray-400'
                    }
                  >
                    {mission.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500/50"></span>
                  <span>Created: {new Date(mission.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500/50"></span>
                  <span>{participantCount} participants</span>
                </div>
              </div>
            </div>
          </div>

          {mission.tags && mission.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {mission.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-yellow-500/20 text-yellow-400"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="prose prose-invert max-w-none mb-8">
            <p className="text-gray-300 whitespace-pre-wrap">{mission.description}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <JoinLeaveButton
              missionId={mission.id}
              initialIsJoined={currentUserIsParticipant}
              isOwner={isOwner}
              isLoggedIn={!!currentUser}
            />
          </div>

          {isOwner && (
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                asChild
                variant="outline"
                className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 transition-all duration-300"
              >
                <Link href={`/missions/${mission.id}/edit`}>
                  ✏️ Edit Mission
                </Link>
              </Button>
              <DeleteMissionButton missionId={mission.id} missionTitle={mission.title} />
            </div>
          )}

          {/* Mission Control / Participants Section */}
          <div className="mt-10 border-t border-yellow-500/10 pt-8">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                Mission Control
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4">Participants ({participantCount})</h3>
              {participantsList.length > 0 ? (
                <ul className="space-y-3">
                  {participantsList
                    .sort((a, b) => {
                      // Put current user first
                      if (currentUser && a.user.id === currentUser.id) return -1;
                      if (currentUser && b.user.id === currentUser.id) return 1;
                      // Then sort by join date
                      return new Date(a.joinedAt || '').getTime() - new Date(b.joinedAt || '').getTime();
                    })
                    .map((participant) => (
                      <li
                        key={participant.user.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-black-500/20 border border-yellow-500/10"
                      >
                        <span className="text-2xl">{participant.user.emoji}</span>
                        <Link
                          href={`/profile/${participant.user.id}`}
                          className="flex-1 text-gray-300 hover:text-yellow-400 transition-colors duration-300"
                        >
                          {participant.user.username || 'Anonymous User'}
                        </Link>
                        {currentUser && participant.user.id === currentUser.id && (
                          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                            You
                          </Badge>
                        )}
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-gray-400 italic">No participants yet.</p>
              )}
            </div>

            {/* Tasks Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4">Tasks</h3>
              {currentUser && (
                <div className="mb-6">
                  <AddTaskForm missionId={mission.id} />
                </div>
              )}
              <TaskList
                tasks={tasks}
                missionId={mission.id}
                currentUserId={currentUser?.id}
                missionOwnerId={mission.owner?.id}
              />
            </div>

            {/* Comments Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4">Comments</h3>
              {currentUser && (
                <div className="mb-6">
                  <AddCommentForm missionId={mission.id} currentUserId={currentUser.id} />
                </div>
              )}
              <CommentList comments={comments} currentUserId={currentUser?.id} />
            </div>

            {/* Resources Section */}
            <div>
              <h3 className="text-xl font-semibold text-yellow-400 mb-4">Resources</h3>
              {currentUser && (
                <div className="mb-6">
                  <AddResourceForm missionId={mission.id} />
                </div>
              )}
              <ResourceList
                resources={resources}
                missionId={mission.id}
                isOwner={isOwner}
              />
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}