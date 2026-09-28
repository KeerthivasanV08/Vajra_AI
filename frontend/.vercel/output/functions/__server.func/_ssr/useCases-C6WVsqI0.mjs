import { a as useQuery, u as useMutation } from "../_libs/tanstack__react-query.mjs";
import { f as fetchCases, c as createCase, a as assignCase, b as freezeCase, s as sarCase } from "./cases-CBs17Qbj.mjs";
function useCases() {
  return useQuery({ queryKey: ["cases", "list"], queryFn: fetchCases, staleTime: 3e4, retry: 2 });
}
function useCreateCase() {
  return useMutation({ mutationFn: (p) => createCase(p) });
}
function useAssignCase() {
  return useMutation({ mutationFn: ({ id, officerId }) => assignCase(id, officerId) });
}
function useFreezeCase() {
  return useMutation({ mutationFn: (id) => freezeCase(id) });
}
function useSarCase() {
  return useMutation({ mutationFn: (id) => sarCase(id) });
}
export {
  useCases as a,
  useCreateCase as b,
  useFreezeCase as c,
  useSarCase as d,
  useAssignCase as u
};
