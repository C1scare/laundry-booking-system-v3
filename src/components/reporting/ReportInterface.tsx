import React, { useState, useEffect } from 'react';
import { AlertTriangle, WashingMachine, User, Send } from 'lucide-react';
import { useReports } from '../../hooks/useReports';
import { useMachines } from '../../hooks/useMachines';
import { Machine } from '../../backend/types';

type ReportType = 'machine' | 'user';
type MachineIssue = 'not-starting' | 'leaking' | 'noise' | 'door' | 'smell' | 'other';
type UserIssue = 'time-violation' | 'machine-misuse' | 'hygiene' | 'other';

interface ReportInterfaceProps {
  userId: string;
  initialType?: ReportType;
}

export const ReportInterface: React.FC<ReportInterfaceProps> = ({
  userId,
  initialType = 'machine'
}) => {
  const { createReport, isLoading: isSubmitting } = useReports();
  const { getAllMachines, isLoading: isLoadingMachines } = useMachines();
  const [reportType, setReportType] = useState<ReportType>(initialType);
  const [availableMachines, setAvailableMachines] = useState<Machine[]>([]);
  const [form, setForm] = useState<{
    machineId?: string;
    issueType: MachineIssue | UserIssue;
    description: string;
    urgency: 'low' | 'medium' | 'high';
  }>({
    issueType: initialType === 'machine' ? 'not-starting' : 'time-violation',
    description: '',
    urgency: 'medium'
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadMachines();
  }, []);

  const loadMachines = async () => {
    const machines = await getAllMachines();
    if (machines) {
      setAvailableMachines(machines);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await createReport({
      type: reportType,
      reporterId: userId,
      machineId: form.machineId,
      issueType: form.issueType,
      description: form.description,
      urgency: form.urgency
    });

    if (result) {
      setSuccessMessage('Report submitted successfully!');
      setForm({
        issueType: reportType === 'machine' ? 'not-starting' : 'time-violation',
        description: '',
        urgency: 'medium'
      });
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const machineIssues: { value: MachineIssue; label: string }[] = [
    { value: 'not-starting', label: 'Machine not starting' },
    { value: 'leaking', label: 'Water leakage' },
    { value: 'noise', label: 'Unusual noise' },
    { value: 'door', label: 'Door problems' },
    { value: 'smell', label: 'Bad smell' },
    { value: 'other', label: 'Other issue' }
  ];

  const userIssues: { value: UserIssue; label: string }[] = [
    { value: 'time-violation', label: 'Time slot violation' },
    { value: 'machine-misuse', label: 'Machine misuse' },
    { value: 'hygiene', label: 'Hygiene concerns' },
    { value: 'other', label: 'Other issue' }
  ];

  const isLoading = isSubmitting || isLoadingMachines;

  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => {
            setReportType('machine');
            setForm(prev => ({ ...prev, issueType: 'not-starting' }));
          }}
          className={`flex-1 p-4 rounded-lg border transition-colors ${
            reportType === 'machine' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-blue-200'
          }`}
        >
          <WashingMachine className="w-6 h-6 mx-auto mb-2" />
          <div className="text-center">Machine Issue</div>
        </button>
        <button
          type="button"
          onClick={() => {
            setReportType('user');
            setForm(prev => ({ ...prev, issueType: 'time-violation' }));
          }}
          className={`flex-1 p-4 rounded-lg border transition-colors ${
            reportType === 'user' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-blue-200'
          }`}
        >
          <User className="w-6 h-6 mx-auto mb-2" />
          <div className="text-center">User Report</div>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {reportType === 'machine' && (
          <div>
            <label className="block text-sm font-medium mb-1">Select Machine</label>
            <select
              value={form.machineId}
              onChange={e => setForm(prev => ({ ...prev, machineId: e.target.value }))}
              className="w-full p-2 border rounded-lg"
              required
            >
              <option value="">Select a machine</option>
              {availableMachines.map(machine => (
                <option key={machine.id} value={machine.id}>
                  {machine.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Issue Type</label>
          <select
            value={form.issueType}
            onChange={e => setForm(prev => ({ ...prev, issueType: e.target.value as any }))}
            className="w-full p-2 border rounded-lg"
            required
          >
            {(reportType === 'machine' ? machineIssues : userIssues).map(issue => (
              <option key={issue.value} value={issue.value}>
                {issue.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-2 border rounded-lg h-32 resize-none"
            placeholder="Please provide details about the issue..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Urgency</label>
          <div className="flex space-x-4">
            {['low', 'medium', 'high'].map((urgency) => (
              <label key={urgency} className="flex-1">
                <input
                  type="radio"
                  name="urgency"
                  value={urgency}
                  checked={form.urgency === urgency}
                  onChange={e => setForm(prev => ({ ...prev, urgency: e.target.value as any }))}
                  className="hidden"
                />
                <div className={`
                  p-2 text-center rounded-lg cursor-pointer transition-colors
                  ${form.urgency === urgency
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                  }
                `}>
                  {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 
                   bg-blue-500 text-white py-3 px-4 rounded-lg
                   hover:bg-blue-600 transition-colors
                   disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
          <span>{isLoading ? 'Submitting...' : 'Submit Report'}</span>
        </button>
      </form>

      <div className="text-sm text-gray-500">
        <p>Note: All reports are handled confidentially and will be reviewed by building management.</p>
        <p>For urgent issues requiring immediate attention, please contact the emergency maintenance number.</p>
      </div>
    </div>
  );
};

export default ReportInterface;