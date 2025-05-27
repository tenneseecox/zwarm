// src/components/ui/TagInput.tsx (or a suitable location)
"use client";

import React, { useState, KeyboardEvent, ChangeEvent, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react'; // Assuming you have lucide-react for icons

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  maxTagLength?: number;
  validateTag?: (tag: string) => boolean; // Optional custom validation for a tag
}

export function TagInput({
  value = [],
  onChange,
  placeholder = "Add tags...",
  maxTags = 5,
  maxTagLength = 25,
  validateTag = (tag) => /^[a-zA-Z0-9-]+$/.test(tag) && tag.length > 0 && tag.length <= maxTagLength,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [localTags, setLocalTags] = useState<string[]>(value);

  useEffect(() => {
    // Sync with external value if needed, though react-hook-form handles this
    // This useEffect might be simplified if react-hook-form controls it directly
    setLocalTags(value);
  }, [value]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const addTag = (tagToAdd: string) => {
    const newTag = tagToAdd.trim();
    if (
      newTag &&
      !localTags.includes(newTag) &&
      localTags.length < maxTags &&
      validateTag(newTag)
    ) {
      const updatedTags = [...localTags, newTag];
      setLocalTags(updatedTags);
      onChange(updatedTags); // Notify react-hook-form or parent
    }
    setInputValue(''); // Clear input field
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault(); // Prevent form submission on Enter
      addTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && localTags.length > 0) {
      // Optional: remove last tag on backspace if input is empty
      const lastTag = localTags[localTags.length - 1];
      removeTag(lastTag);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = localTags.filter((tag) => tag !== tagToRemove);
    setLocalTags(updatedTags);
    onChange(updatedTags); // Notify react-hook-form or parent
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {localTags.map((tag) => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
            {tag}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 rounded-full"
              onClick={() => removeTag(tag)}
            >
              <XIcon className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={localTags.length >= maxTags ? `Max ${maxTags} tags reached` : placeholder}
        disabled={localTags.length >= maxTags}
      />
      {localTags.length > 0 && localTags.length < maxTags && (
        <p className="text-xs text-muted-foreground mt-1">
          {maxTags - localTags.length} tags remaining.
        </p>
      )}
       {/* You can add more detailed validation messages here based on your Zod schema */}
    </div>
  );
}