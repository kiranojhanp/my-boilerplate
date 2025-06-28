import { router, loggedProcedure } from "../../shared/trpc/trpc";
import { HealthService } from "./service";

export const healthRouter = router({
  // Basic health check
  check: loggedProcedure.query(() => {
    return HealthService.getHealthCheck();
  }),

  // Readiness check (for Kubernetes)
  ready: loggedProcedure.query(() => {
    return HealthService.getReadinessCheck();
  }),

  // Liveness check (for Kubernetes)
  live: loggedProcedure.query(() => {
    return HealthService.getLivenessCheck();
  }),
});
