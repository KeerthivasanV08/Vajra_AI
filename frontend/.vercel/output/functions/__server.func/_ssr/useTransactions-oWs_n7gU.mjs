import { b as useQueryClient, a as useQuery, u as useMutation } from "../_libs/tanstack__react-query.mjs";
import { normalizeTransaction, client, extractTransactions } from "./router-DXMls9-H.mjs";
async function fetchRecentTransactions() {
  const raw = await client.request({ path: "/api/transactions/recent" });
  return extractTransactions(raw);
}
async function analyzeTransaction(body) {
  const raw = await client.request({ method: "POST", path: "/api/transactions", body });
  return normalizeTransaction(raw);
}
function useRecentTransactions() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["transactions", "recent"],
    queryFn: async () => {
      const data = await fetchRecentTransactions();
      return (data || []).map(normalizeTransaction);
    },
    staleTime: 1e4,
    retry: 2,
    refetchInterval: 3e4
  });
  const mutation = useMutation({
    mutationFn: (tx) => analyzeTransaction(tx),
    onSuccess: (res) => {
      qc.setQueryData(["transactions", "recent"], (old) => {
        const arr = old || [];
        return [res, ...arr.filter((t) => t.id !== res.id)].slice(0, 500);
      });
    }
  });
  return { ...q, analyze: mutation.mutateAsync };
}
export {
  useRecentTransactions as u
};
