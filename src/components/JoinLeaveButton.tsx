// src/components/JoinLeaveButton.tsx
"use client";

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner'; // Or your preferred toast library

interface JoinLeaveButtonProps {
  missionId: string;
  initialIsJoined: boolean;
  isOwner: boolean;
  isLoggedIn: boolean;
}

export function JoinLeaveButton({ missionId, initialIsJoined, isOwner, isLoggedIn }: JoinLeaveButtonProps) {
  const router = useRouter();
  const [isJoined, setIsJoined] = useState(initialIsJoined);
  const [isPending, startTransition] = useTransition();

  // Sync with server state whenever initialIsJoined changes
  useEffect(() => {
    setIsJoined(initialIsJoined);
  }, [initialIsJoined]);

  const handleClick = async () => {
    if (!isLoggedIn) {
      toast.error("Please sign in to join or leave missions.");
      router.push(`/sign-in?next=/missions/${missionId}`);
      return;
    }
    if (isOwner) {
      toast.info("As the owner, you are already part of this mission.");
      return;
    }

    const intendedAction = isJoined ? 'leave' : 'join';
    const endpoint = `/api/missions/${missionId}/${intendedAction}`;

    startTransition(async () => {
      try {
        const response = await fetch(endpoint, { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();

        if (!response.ok) {
          if (response.status >= 400) {
            toast.error(data.error || `Failed to ${intendedAction} mission. Status: ${response.status}`);
            // Revert optimistic update on error
            setIsJoined(!isJoined);
            return;
          }
        }

        toast.success(data.message || `Successfully ${intendedAction}ed mission!`);
        
        // Update local state optimistically
        setIsJoined(intendedAction === 'join');
        
        // Refresh server state
        router.refresh();
      } catch (error) {
        console.error(`Error ${intendedAction}ing mission:`, error);
        toast.error(`An unexpected error occurred while trying to ${intendedAction} the mission.`);
        // Revert optimistic update on error
        setIsJoined(!isJoined);
      }
    });
  };

  if (isOwner) {
    return <Button variant="outline" disabled className="w-full sm:w-auto">You are the owner</Button>;
  }

  const buttonVariant = isJoined ? 'destructive' : 'default';
  const buttonText = !isLoggedIn ? 'Sign in to interact' :
                    isPending ? 'Processing...' :
                    (isJoined ? 'Leave Mission' : 'Join Mission');

  return (
    <Button
      onClick={handleClick}
      disabled={isPending || !isLoggedIn}
      variant={buttonVariant}
      className={`w-full sm:w-auto ${
        !isLoggedIn ? 'bg-gray-500 cursor-not-allowed' :
        isJoined ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
      } text-white transition-colors duration-150`}
    >
      {buttonText}
    </Button>
  );
}