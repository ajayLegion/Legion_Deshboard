import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Smile } from 'lucide-react';

interface AddIconModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (icon: string) => void;
}

export const AddIconModal: React.FC<AddIconModalProps> = ({ isOpen, onClose, onSelectIcon }) => {
  const [search, setSearch] = useState('');
  const commonEmojis = [
    '😀', '😂', '🤔', '👍', '❤️', '🔥', '📝', '💡', '🚀', '🌟',
    '📱', '💻', '📚', '🎯', '⚡', '🛡️', '🎨', '🔒', '📊', '🗓️'
  ].filter(emoji => emoji.includes(search)); // Simple filter, enhance with better search if needed

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg max-w-sm w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Smile className="h-5 w-5" />
            Add Icon
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search emojis..."
          className="mb-4"
        />
        <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto mb-4">
          {commonEmojis.map((emoji, i) => (
            <Button
              key={i}
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 text-2xl"
              onClick={() => {
                onSelectIcon(emoji);
                onClose();
              }}
            >
              {emoji}
            </Button>
          ))}
        </div>
        <Button onClick={onClose} variant="outline" className="w-full">
          Cancel
        </Button>
      </div>
    </div>
  );
};