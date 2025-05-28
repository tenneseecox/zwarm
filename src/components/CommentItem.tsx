// src/components/CommentItem.tsx
"use client";

import { UserCircle } from 'lucide-react'; ///page.tsx]
import { formatTimeAgo } from '@/utils/time-helpers'; //

// Re-using the CommentWithUser type (or define it here if not shared)
interface CommentWithUser {
  id: string;
  content: string;
  createdAt: string; // Assuming ISO string
  user: {
    id: string;
    username: string | null;
    emoji: string | null;
  };
}

interface CommentItemProps {
  comment: CommentWithUser;
  currentUserId: string | null | undefined;
}

export function CommentItem({ comment, currentUserId }: CommentItemProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isAuthor = currentUserId === comment.user.id;

  // Basic function to make URLs clickable (can be improved)
  const linkify = (text: string) => {
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\bwww\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.split(urlRegex).map((part, index) => {
      if (urlRegex.test(part)) {
        const href = part.startsWith('www.') ? `http://${part}` : part;
        return <a href={href} key={index} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{part}</a>;
      }
      return part;
    });
  };

  return (
    <li className="py-3 px-4 bg-black-800/40 border border-gray-700/60 rounded-lg shadow-sm">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <span className="text-2xl bg-gray-700 p-1.5 rounded-full inline-flex items-center justify-center w-10 h-10">
            {comment.user.emoji || <UserCircle size={20} className="text-gray-400" />}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-yellow-400">
            {comment.user.username || "Anonymous User"}
          </p>
          <p className="text-xs text-gray-500">
            {formatTimeAgo(comment.createdAt)}
          </p>
          <div className="mt-1 text-sm text-gray-200 whitespace-pre-wrap break-words">
            {linkify(comment.content)}
          </div>
          {/* Placeholder for future actions like edit/delete */}
          {/* {isAuthor && (
            <div className="mt-2 flex space-x-2">
              <Button variant="ghost" size="sm" className="text-xs">Edit</Button>
              <Button variant="ghost" size="sm" className="text-xs text-red-500">Delete</Button>
            </div>
          )} */}
        </div>
      </div>
    </li>
  );
}