import React, { useState, useEffect } from 'react';
import { WashingMachine, Timer, AlertCircle, Clock } from 'lucide-react';
import { useMachines } from '../../hooks/useMachines';
import { Machine } from '../../backend/types';

export const MachineStatus: React.FC = () => {
  const { getAllMachines, isLoading, error } = useMachines();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  useEffect(() => {
    loadMachines();
    // Refresh machine status every 30 seconds
    const interval = window.setInterval(loadMachines, 30000);
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const loadMachines = async () => {
    const result = await getAllMachines();
    if (result) {
      setMachines(result);
    }
  };

  const getStatusColor = (status: Machine['status']) => {
    switch (status) {
      case 'available':
        return 'text-green-600';
      case 'in-use':
        return 'text-blue-600';
      case 'maintenance':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
    }
  };

  const getStatusIcon = (status: Machine['status']) => {
    switch (status) {
      case 'available':
        return <WashingMachine className="w-6 h-6" />;
      case 'in-use':
        return <Timer className="w-6 h-6" />;
      case 'maintenance':
        return <Clock className="w-6 h-6" />;
      case 'error':
        return <AlertCircle className="w-6 h-6" />;
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  if (isLoading && machines.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        Loading machine status...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-4">
        Error loading machine status: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Machine Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {machines.map((machine) => (
          <div
            key={machine.id}
            className="p-4 border rounded-lg hover:border-blue-500 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className={getStatusColor(machine.status)}>
                    {getStatusIcon(machine.status)}
                  </span>
                  <span className="font-semibold">{machine.name}</span>
                </div>
                
                <div className="space-y-1">
                  <p className={`text-sm ${getStatusColor(machine.status)}`}>
                    Status: {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
                  </p>
                  
                  {machine.timeRemaining !== undefined && machine.status === 'in-use' && (
                    <p className="text-sm text-gray-600">
                      Time Remaining: {machine.timeRemaining} min
                    </p>
                  )}

                  {machine.lastUsed && (
                    <p className="text-sm text-gray-600">
                      Last Used: {formatDateTime(machine.lastUsed)}
                    </p>
                  )}

                  {machine.nextBooking && (
                    <p className="text-sm text-gray-600">
                      Next Booking: {formatDateTime(machine.nextBooking)}
                    </p>
                  )}

                  {machine.error && (
                    <p className="text-sm text-red-600">
                      Error: {machine.error}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MachineStatus;