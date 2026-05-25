import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import api from '#/api/axiosInstance';

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: async ({ queryKey }: { queryKey: readonly unknown[] }) => {
          const [url] = queryKey;
          if (typeof url !== 'string') {
            throw new Error('Query key must be a string URL');
          }
          const { data } = await api.get(url);
          return data;
        },
      },
    },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
