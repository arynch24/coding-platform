import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import axios from 'axios';

interface Moderator {
  id: string;
  moderatorId: string;
  name: string;
  email: string;
  designation: string | null;
}

interface AssistantTeacher {
  id: string;
  name: string;
  email: string;
  designation: string | null;
}

interface ModeratorsTabProps {
  questionId: string;
}

export const ModeratorsTab: React.FC<ModeratorsTabProps> = ({
  questionId,
}) => {
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<Array<{value: string, label: string}>>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchModerators();
    fetchAvailableTeachers();
  }, [questionId]);

  const fetchModerators = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/problems/moderator/${questionId}`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setModerators(response.data.data.moderators);
      } else {
        setModerators(response.data); // fallback if API doesn't follow standard format
      }
    } catch (error) {
      console.error('Error fetching moderators:', error);
      setModerators([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableTeachers = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teachers/assistant-teachers`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        const teachers = response.data.data.assistant_teachers;
        setAvailableTeachers(teachers.map((teacher: AssistantTeacher) => ({
          value: teacher.id,
          label: `${teacher.name} ${teacher.email ? `(${teacher.email})` : ''} ${teacher.designation ? `- ${teacher.designation}` : ''}`,
        })));
      }
    } catch (error) {
      console.error('Error fetching available teachers:', error);
      setAvailableTeachers([]);
    }
  };

  const addSelectedTeacher = (teacherId: string) => {
    if (!selectedTeachers.includes(teacherId)) {
      setSelectedTeachers(prev => [...prev, teacherId]);
    }
  };

  const removeSelectedTeacher = (teacherId: string) => {
    setSelectedTeachers(prev => prev.filter(id => id !== teacherId));
  };

  const addModerators = async () => {
    if (selectedTeachers.length === 0) return;
    
    setIsSaving(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/problems/moderator`, {
        problemId: questionId,
        moderatorIds: selectedTeachers
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        // Refresh moderators list after successful addition
        await fetchModerators();
        setSelectedTeachers([]); // Clear selected teachers
      }
    } catch (error) {
      console.error('Error adding moderators:', error);
      // You might want to show an error toast/notification here
    } finally {
      setIsSaving(false);
    }
  };

  const removeModerator = async (moderatorId: string) => {
    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/problems/moderator/${moderatorId}`, {
        withCredentials: true
      });

      if (response.data.success || response.status === 200) {
        // Remove from local state
        setModerators(prev => prev.filter(mod => mod.moderatorId !== moderatorId));
      }
    } catch (error) {
      console.error('Error removing moderator:', error);
      // You might want to show an error toast/notification here
    }
  };

  // Filter out already assigned moderators and selected teachers from available teachers
  const getFilteredTeachers = () => {
    return availableTeachers.filter(teacher => 
      !moderators.some(mod => mod.id === teacher.value) &&
      !selectedTeachers.includes(teacher.value)
    );
  };

  // Get selected teacher details for display
  const getSelectedTeacherDetails = () => {
    return availableTeachers.filter(teacher => 
      selectedTeachers.includes(teacher.value)
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Loading moderators...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Moderators
        </label>
        <div className="flex gap-3">
          <div className="flex-1">
            <Select
              placeholder="Select teachers to add..."
              onChange={(value) => addSelectedTeacher(value)}
              options={getFilteredTeachers()}
              disabled={getFilteredTeachers().length === 0}
            />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Select teachers from your center to add as moderators. Click "Save Changes" to confirm.
        </p>
      </div>

      {/* Selected Teachers Section */}
      {selectedTeachers.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Teachers to Add:</h3>
          <div className="space-y-2">
            {getSelectedTeacherDetails().map(teacher => (
              <div key={teacher.value} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center">
                    <span className="text-blue-700 font-medium text-sm">
                      {teacher.label.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{teacher.label}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeSelectedTeacher(teacher.value)}
                  className="text-red-600 hover:text-red-700 h-8 px-2 text-xs"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={addModerators}
              disabled={isSaving || selectedTeachers.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? 'Adding...' : `Add ${selectedTeachers.length} Moderator${selectedTeachers.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      )}

      {/* Current Moderators Section */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Current Moderators:</h3>
      </div>

      <div className="space-y-4">
        {moderators.map(moderator => (
          <div key={moderator.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium">
                  {moderator.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{moderator.name}</p>
                <p className="text-sm text-gray-500">{moderator.email}</p>
                {moderator.designation && (
                  <p className="text-xs text-gray-400">{moderator.designation}</p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeModerator(moderator.moderatorId)}
              className="text-red-600 hover:text-red-700"
              disabled={isSaving}
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

      {getFilteredTeachers().length === 0 && selectedTeachers.length === 0 && moderators.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            All available teachers have been assigned as moderators.
          </p>
        </div>
      )}

      {availableTeachers.length === 0 && moderators.length === 0 && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-700">
            No teachers available in your center to assign as moderators.
          </p>
        </div>
      )}
    </div>
  );
};

export default ModeratorsTab;