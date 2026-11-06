import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import { useToast } from '../contexts/ToastContext';
import { ApiError } from '../api/http';
import { useAuth } from '../contexts/AuthContext';
export function useAction<TArgs, TResult>(action: (args: TArgs) => Promise<TResult>, keys: QueryKey[], successText = 'Əməliyyat uğurla tamamlandı') {
    const client = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: action,
        onSuccess: async () => { await Promise.all(keys.map(key => client.invalidateQueries({ queryKey: key }))); toast(successText); },
        onError: error => toast(error instanceof ApiError ? error.message : 'Əməliyyat zamanı xəta yarandı.', 'error')
    });
}
export function useWorkspaceKey(resource: string): QueryKey {
    const { workspace } = useAuth();
    return [resource, workspace?.tenantId || 'none'];
}
