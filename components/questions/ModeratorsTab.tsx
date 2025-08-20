import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import axios from 'axios';

interface Moderator {
  id: string;
  username: string;
  role: string;
}

interface ModeratorsTabProps {
  questionId: string;
  onSave: (data: any) => Promise<void>;
  onDataChange: () => void;
}

export const ModeratorsTab: React.FC<ModeratorsTabProps> = ({
  questionId,
  onSave,
  onDataChange,
}) => {
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [availableUsers, setAvailableUsers] = useState<Array<{value: string, label: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchModerators();
    // fetchAvailableUsers();
  }, [questionId]);

  const fetchModerators = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/problems/moderator/${questionId}`, {
        withCredentials: true
      });
      setModerators(response.data);
    } catch (error) {
      console.error('Error fetching moderators:', error);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        withCredentials: true
      });
      const users = response.data;
      setAvailableUsers(users.map((user: any) => ({
        value: user.username,
        label: `${user.username} (${user.email})`,
      })));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const addModerator = (username: string) => {
    const newModerator = {
      id: Date.now().toString(),
      username,
      role: 'moderator',
    };
    setModerators(prev => [...prev, newModerator]);
    onDataChange();
  };

  const removeModerator = (moderatorId: string) => {
    setModerators(prev => prev.filter(mod => mod.id !== moderatorId));
    onDataChange();
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave({ moderators });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Moderator
        </label>
        <div className="flex gap-3">
          <div className="flex-1">
            <Select
              placeholder="Select a user..."
              onChange={(value) => addModerator(value)}
              options={availableUsers.filter(user => 
                !moderators.some(mod => mod.username === user.value)
              )}
            />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Enter moderator's HackerRank username. Moderators can edit this challenge.
        </p>
      </div>

      <div className="space-y-4">
        {moderators.map(moderator => (
          <div key={moderator.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium">
                  {moderator.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{moderator.username}</p>
                <p className="text-sm text-gray-500">{moderator.role}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeModerator(moderator.id)}
              className="text-red-600 hover:text-red-700"
            >
              Remove
            </Button>
          </div>
        ))}
        
        {moderators.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No moderators added yet. Add moderators to help manage this question.
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default ModeratorsTab;