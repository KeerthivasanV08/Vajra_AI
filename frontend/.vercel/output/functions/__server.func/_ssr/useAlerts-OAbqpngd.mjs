import { b as useQueryClient, a as useQuery, u as useMutation } from "../_libs/tanstack__react-query.mjs";
import { fetchAlerts, fetchP1Alerts, fetchAlertsQueue, fetchAlertEscalations, closeAlert, escalateAlert, acknowledgeAlert } from "./router-DXMls9-H.mjs";
function useAlerts() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["alerts", "list"], queryFn: fetchAlerts, staleTime: 5e3, retry: 2, refetchInterval: 2e4 });
  const q1 = useQuery({ queryKey: ["alerts", "p1"], queryFn: fetchP1Alerts, staleTime: 5e3, retry: 2 });
  const queue = useQuery({ queryKey: ["alerts", "queue"], queryFn: fetchAlertsQueue, staleTime: 1e4, retry: 2, refetchInterval: 3e4 });
  const escalations = useQuery({ queryKey: ["alerts", "escalations"], queryFn: fetchAlertEscalations, staleTime: 3e4, retry: 2, refetchInterval: 6e4 });
  const refresh = () => {
    qc.invalidateQueries();
  };
  const ack = useMutation({ mutationFn: (id) => acknowledgeAlert(id), onSuccess: refresh });
  const esc = useMutation({ mutationFn: (id) => escalateAlert(id), onSuccess: refresh });
  const closeM = useMutation({ mutationFn: (id) => closeAlert(id), onSuccess: refresh });
  return {
    ...q,
    p1: q1,
    queue,
    escalations,
    acknowledge: ack.mutateAsync,
    escalate: esc.mutateAsync,
    close: closeM.mutateAsync
  };
}
export {
  useAlerts as u
};
