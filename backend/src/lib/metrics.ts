export const promMetrics = {
  totalRequests: 0,
  statusCodes: {} as Record<string, number>,
  requestDurations: [] as number[],
  errorCount: 0,
};

export function getPrometheusOutput(): string {
  const avgDuration = promMetrics.requestDurations.length
    ? (promMetrics.requestDurations.reduce((a, b) => a + b, 0) / promMetrics.requestDurations.length).toFixed(2)
    : "0";

  let promOutput = `# HELP http_requests_total Total number of HTTP requests\n`;
  promOutput += `# TYPE http_requests_total counter\n`;
  promOutput += `http_requests_total ${promMetrics.totalRequests}\n\n`;

  promOutput += `# HELP http_errors_total Total number of HTTP errors\n`;
  promOutput += `# TYPE http_errors_total counter\n`;
  promOutput += `http_errors_total ${promMetrics.errorCount}\n\n`;

  promOutput += `# HELP http_request_duration_ms_avg Average HTTP request duration in milliseconds\n`;
  promOutput += `# TYPE http_request_duration_ms_avg gauge\n`;
  promOutput += `http_request_duration_ms_avg ${avgDuration}\n\n`;

  for (const [status, count] of Object.entries(promMetrics.statusCodes)) {
    promOutput += `http_responses_total{status="${status}"} ${count}\n`;
  }

  // ── Process Memory Metrics (in bytes) ──
  const mem = process.memoryUsage();
  promOutput += `\n# HELP process_resident_memory_bytes Resident memory size (RSS) in bytes\n`;
  promOutput += `# TYPE process_resident_memory_bytes gauge\n`;
  promOutput += `process_resident_memory_bytes ${mem.rss}\n\n`;

  promOutput += `# HELP process_heap_total_bytes Total V8/Bun heap size in bytes\n`;
  promOutput += `# TYPE process_heap_total_bytes gauge\n`;
  promOutput += `process_heap_total_bytes ${mem.heapTotal}\n\n`;

  promOutput += `# HELP process_heap_used_bytes Used V8/Bun heap size in bytes\n`;
  promOutput += `# TYPE process_heap_used_bytes gauge\n`;
  promOutput += `process_heap_used_bytes ${mem.heapUsed}\n\n`;

  // ── Process CPU Metrics (in seconds) ──
  const cpu = process.cpuUsage();
  promOutput += `# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds\n`;
  promOutput += `# TYPE process_cpu_user_seconds_total counter\n`;
  promOutput += `process_cpu_user_seconds_total ${(cpu.user / 1e6).toFixed(4)}\n\n`;

  promOutput += `# HELP process_cpu_system_seconds_total Total system CPU time spent in seconds\n`;
  promOutput += `# TYPE process_cpu_system_seconds_total counter\n`;
  promOutput += `process_cpu_system_seconds_total ${(cpu.system / 1e6).toFixed(4)}\n\n`;

  // ── Process Uptime (in seconds) ──
  promOutput += `# HELP process_uptime_seconds Total time the backend process has been running in seconds\n`;
  promOutput += `# TYPE process_uptime_seconds gauge\n`;
  promOutput += `process_uptime_seconds ${process.uptime().toFixed(2)}\n\n`;

  return promOutput;
}

