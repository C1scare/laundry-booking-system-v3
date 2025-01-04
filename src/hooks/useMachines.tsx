import { useBackendBase } from './useBackendBase';
import { machineService } from '../backend/services';
import { Machine } from '../backend/types';

export const useMachines = () => {
  const { handleRequest, isLoading, error } = useBackendBase();

  return {
    isLoading,
    error,
    getAllMachines: () =>
      handleRequest(() => machineService.getAllMachines()),
    getMachineStatus: (machineId: string) =>
      handleRequest(() => machineService.getMachineStatus(machineId)),
    updateMachineStatus: (machineId: string, status: Machine['status'], error?: string) =>
      handleRequest(() => machineService.updateMachineStatus(machineId, status, error))
  };
};