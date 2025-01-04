import { useBackendBase } from './useBackendBase';
import { reportService } from '../backend/services';
import { Report } from '../backend/types';

export const useReports = () => {
  const { handleRequest, isLoading, error } = useBackendBase();

  return {
    isLoading,
    error,
    createReport: (report: Omit<Report, 'id' | 'status' | 'createdAt'>) =>
      handleRequest(() => reportService.createReport(report)),
    getUserReports: (userId: string) =>
      handleRequest(() => reportService.getUserReports(userId)),
    getMachineReports: (machineId: string) =>
      handleRequest(() => reportService.getMachineReports(machineId))
  };
};