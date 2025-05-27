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

  // This useEffect ensures that if the parent page re-renders with a new participation status
  // (e.g., after router.refresh() has fetched new data), the button's local state is synced.
  useEffect(() => {
    setIsJoined(initialIsJoined);
  }, [initialIsJoined]);

  const handleClick = async () => {
    if (!isLoggedIn) {
      toast.error("Please sign in to join or leave missions.");
      router.push(`/sign-in?next=/missions/${missionId}`); // Redirect to sign-in
      return;
    }
    if (isOwner) {
      toast.info("As the owner, you are already part of this mission.");
      return;
    }

    // Determine the intended action based on the current client-side 'isJoined' state
    const intendedAction = isJoined ? 'leave' : 'join';
    const endpoint = `/api/missions/${missionId}/${intendedAction}`;

    startTransition(async () => {
      try {
        const response = await fetch(endpoint, { method: 'POST' });
        const data = await response.json();

        if (!response.ok) {
          // Even if the response isn't a 201 (created) for 'join', a 200 with "Already joined" is still an "ok" response.
          // We should only toast error for actual failures (4xx client errors, 5xx server errors).
          // Your 'join' route returns 200 for "already joined", which is fine.
          if (response.status >= 400) { // Treat 4xx and 5xx as errors for toast
            toast.error(data.error || `Failed to ${intendedAction} mission. Status: ${response.status}`);
            return; // Don't proceed if it's an actual error
          }
          // If it's a 200 for "already joined", data.message will be used.
        }

        toast.success(data.message || `Successfully ${intendedAction}ed mission!`);

        // Explicitly set the button's state based on the intended action's success.
        // This provides immediate UI feedback.
        if (intendedAction === 'join') {
          // If the 'join' action was attempted and the API call was successful (200 or 201),
          // it means the user is now (or already was) joined. So, set button to "Leave".
          setIsJoined(true);
        } else if (intendedAction === 'leave') {
          // If the 'leave' action was successful, set button to "Join".
          setIsJoined(false);
        }
        
        // router.refresh() will re-fetch data for Server Components on the page.
        // This updates the participant count and ensures the `initialIsJoined` prop
        // passed to this button on next render is accurate.
        router.refresh();
      } catch (error) {
        console.error(`Error ${intendedAction}ing mission:`, error);
        toast.error(`An unexpected error occurred while trying to ${intendedAction} the mission.`);
      }
    });
  };

  if (isOwner) {
    return <Button variant="outline" disabled className="w-full sm:w-auto">You are the owner</Button>;
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending || !isLoggedIn}
      className={`w-full sm:w-auto ${
        !isLoggedIn ? 'bg-gray-500 cursor-not-allowed' : // Added cursor-not-allowed
        isJoined ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
      } text-white transition-colors duration-150`}
    >
      {!isLoggedIn ? 'Sign in to interact' :
       isPending ? 'Processing...' :
       (isJoined ? 'Leave Mission' : 'Join Mission')}
    </Button>
  );
}