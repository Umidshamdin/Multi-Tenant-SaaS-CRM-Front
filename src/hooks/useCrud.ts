
import { useCallback, useEffect, useState } from 'react';
import type { Paged } from '../api/types';
import { errorText } from '../api/http';

export function usePaged<T>(
    loader: (page: number) => Promise<Paged<T>>,
    dependencies: unknown[] = []
) {
    const [page, setPage] = useState(1);
    const [data, setData] = useState<Paged<T> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const refresh = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const result = await loader(page);
            setData(result);
        } catch (err) {
            setError(errorText(err));
        } finally {
            setLoading(false);
        }
    }, [loader, page]);

    useEffect(() => {
        void refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh, ...dependencies]);

    return {
        page,
        setPage,
        data,
        loading,
        error,
        refresh
    };
}
