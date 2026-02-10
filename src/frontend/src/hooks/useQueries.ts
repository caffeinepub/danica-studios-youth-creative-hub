import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, IncomeRecordInput, IncomeRecord, StudioReport, UserRole, Podcast, RoleRequest } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAssignRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    },
  });
}

export function useRequestRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleRequest: RoleRequest) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestRole(roleRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useCreateIncomeRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: IncomeRecordInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createIncomeRecord(record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomeRecords'] });
    },
  });
}

export function useUpdatePodcastDetails() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId, podcast }: { recordId: bigint; podcast: Podcast }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePodcastDetails(recordId, podcast);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['incomeRecords'] });
      queryClient.invalidateQueries({ queryKey: ['incomeRecord', variables.recordId.toString()] });
    },
  });
}

export function useGetAllIncomeRecords() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<IncomeRecord[]>({
    queryKey: ['incomeRecords'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllIncomeRecords();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetIncomeRecord(id: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<IncomeRecord | null>({
    queryKey: ['incomeRecord', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getIncomeRecord(id);
    },
    enabled: !!actor && !actorFetching && id !== null,
  });
}

export function useGetMonthlyReport(year: bigint, month: bigint) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StudioReport>({
    queryKey: ['monthlyReport', year.toString(), month.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMonthlyReport(year, month);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllMonthlyReportsForYear(year: bigint) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StudioReport[]>({
    queryKey: ['yearlyReports', year.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllMonthlyReportsForYear(year);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useDeleteAllIncomeRecords() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAllIncomeRecords();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomeRecords'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyReport'] });
      queryClient.invalidateQueries({ queryKey: ['yearlyReports'] });
    },
  });
}
