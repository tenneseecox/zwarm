// src/components/CommentList.tsx
"use client";

import { CommentItem } from './CommentItem';

// Re-using the CommentWithUser type
interface CommentWithUser {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string | null;
    emoji: string | null;
  };
}

interface CommentListProps {
  comments: CommentWithUser[];
  currentUserId: string | null | undefined;
}

export function CommentList({ comments, currentUserId }: CommentListProps) {
  if (!comments || comments.length === 0) {
    return <p className="text-gray-400 italic text-center py-4">No comments yet. Be the first to share your thoughts!</p>;
  }

  return (
    <ul className="space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} currentUserId={currentUserId} />
      ))}
    </ul>
  );
}