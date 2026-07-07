# RSL Cards Observability & Monitoring Guide

This document is a comprehensive guide for monitoring, debugging, and analyzing the performance of the RSL Cards backend using **Grafana**, **Loki (Logs)**, and **Prometheus (Metrics)** across both local development and AWS EC2 production deployments.

---

## 1. Quick Access & Credentials

| Service | Local Dev URL | AWS EC2 / Prod URL | Default Credentials |
| :--- | :--- | :--- | :--- |
| **Grafana Dashboard** | `http://localhost:3001` | `http://<EC2-IP>:3000` | Username: `admin`<br>Password: `admin` |
| **Prometheus Targets** | `http://localhost:9090` | `http://<EC2-IP>:9090` | *No auth required* |
| **Backend Metrics API** | `http://localhost:8080/metrics` | `https://api.yourdomain.com/metrics` | *No auth required* |

---

## 2. How to Check & Filter Logs in Loki

Loki aggregates all Docker container logs in real-time. Our backend is instrumented with **Trace IDs (`tr_...`)** and **Per-Request Resource Snapshots** (Duration, CPU, and RAM).

### Step-by-Step:
1. Open **Grafana** in your browser.
2. In the left sidebar, navigate to **Explore** (compass icon).
3. From the top dropdown data source selector, choose **Loki**.
4. Enter a LogQL query (see cheat sheet below) and click **Run Query** or toggle **Live** for real-time streaming.

### LogQL Cheat Sheet & Examples:

| Goal / Use Case | LogQL Query | What It Displays |
| :--- | :--- | :--- |
| **All Backend Logs** | `{container="rsl-backend-dev"}` | Complete log stream from the backend container. |
| **Completed API Requests** | `{container="rsl-backend-dev"} \|= "END"` | Only finished HTTP request lines with performance metrics. |
| **Find Errors & Failures** | `{container="rsl-backend-dev"} \|= "ERROR"`<br>*or*<br>`{container="rsl-backend-dev"} \|= "500"` | Any server errors, unhandled exceptions, or HTTP 500 status codes. |
| **Trace a Specific Request** | `{container="rsl-backend-dev"} \|= "tr_mraap4ot_pwvxf"` | All log events (start, auth, DB queries, end) tied to a single request ID. |
| **Filter by API Endpoint** | `{container="rsl-backend-dev"} \|= "/v1/web-dashboard/top-movers"` | Every request made to the Top Movers endpoint. |
| **Filter by User ID** | `{container="rsl-backend-dev"} \|= "User: d75c79d6"` | All requests and auth events for a specific user ID. |

### Understanding the Request Performance Log Line
When an HTTP request completes, our middleware outputs a detailed telemetry line:
```text
[TRACE tr_mraau2py_ri1nh] ◄── END GET /v1/auth/session - 200 (3ms | CPU: 4.48ms (149.5%) | RSS: 165.1MB | Heap: 28.2MB)
```

* **`tr_mraau2py_ri1nh`**: Unique Trace ID for correlation across frontend and backend.
* **`3ms`**: Total wall-clock time taken from request arrival to response sent.
* **`CPU: 4.48ms (149.5%)`**: Microseconds of CPU time spent by the engine across cores during this request. *(Note: On multi-core processors, concurrent request execution across multiple cores can result in CPU % > 100%)*.
* **`RSS: 165.1MB`**: **Resident Set Size** — Total RAM allocated to the server process at that exact millisecond.
* **`Heap: 28.2MB`**: **V8/Bun Heap Memory** — Actual RAM utilized by JavaScript objects, variables, and data structures.

---

## 3. Prometheus Metrics Reference Table

Prometheus scrapes the `/metrics` endpoint every 5 seconds. Use the metric names below in **Grafana Dashboards** or **PromQL queries** to visualize server health over time.

### System & Resource Metrics (CPU & RAM)

| Prometheus Metric Name | Type | Description / Use Case | Recommended PromQL Query in Grafana |
| :--- | :--- | :--- | :--- |
| **`process_resident_memory_bytes`** | Gauge | **Total RAM Usage (RSS)**.<br>The total physical memory used by the backend process. | `process_resident_memory_bytes / 1024 / 1024`<br>*(Displays live RAM usage in MB)* |
| **`process_heap_used_bytes`** | Gauge | **Active Heap RAM Usage**.<br>Memory actively used by JS objects and database rows. | `process_heap_used_bytes / 1024 / 1024`<br>*(Displays heap usage in MB)* |
| **`process_heap_total_bytes`** | Gauge | **Total Allocated Heap**.<br>Total heap size reserved by the runtime. | `process_heap_total_bytes / 1024 / 1024`<br>*(Displays heap capacity in MB)* |
| **`process_cpu_user_seconds_total`** | Counter | **User CPU Time**.<br>Total seconds spent executing application logic. | `rate(process_cpu_user_seconds_total[1m]) * 100`<br>*(Displays % of CPU used by app code)* |
| **`process_cpu_system_seconds_total`** | Counter | **System/Kernel CPU Time**.<br>Total seconds spent in OS kernel (network, I/O, file reads). | `rate(process_cpu_system_seconds_total[1m]) * 100`<br>*(Displays % of CPU used by OS/IO)* |
| **`process_uptime_seconds`** | Gauge | **Server Uptime**.<br>How long the server process has been running continuously without restart. | `process_uptime_seconds / 3600`<br>*(Displays uptime in Hours)* |

---

### HTTP Request & Performance Metrics

| Prometheus Metric Name | Type | Description / Use Case | Recommended PromQL Query in Grafana |
| :--- | :--- | :--- | :--- |
| **`http_requests_total`** | Counter | **Total Traffic Volume**.<br>Cumulative count of all incoming HTTP requests. | `rate(http_requests_total[1m])`<br>*(Displays Requests Per Second - RPS)* |
| **`http_request_duration_ms_avg`** | Gauge | **Average Request Latency**.<br>Rolling average duration of HTTP requests in milliseconds. | `http_request_duration_ms_avg`<br>*(Displays average latency chart in ms)* |
| **`http_errors_total`** | Counter | **Total Error Count**.<br>Cumulative count of failed requests (5xx / unhandled errors). | `rate(http_errors_total[1m])`<br>*(Displays Errors Per Second)* |
| **`http_responses_total`** | Counter | **Status Code Breakdown**.<br>Requests categorized by HTTP status code label (`200`, `400`, `401`, `500`). | `rate(http_responses_total{status="500"}[1m])`<br>*(Displays rate of specific HTTP status codes)* |

---

## 4. How to Create a Custom Monitoring Dashboard in Grafana

1. Click the **`+` (Create)** button in the Grafana sidebar and select **Dashboard**.
2. Click **Add visualization** and select **Prometheus** as the data source.
3. **Panel 1: Live RAM Consumption (MB)**
   * Enter Query: `process_resident_memory_bytes / 1024 / 1024`
   * Under **Standard options** on the right, set Unit to **Data $\rightarrow$ Megabytes (MB)**.
   * Click **Apply**.
4. **Panel 2: Server CPU Utilization (%)**
   * Enter Query: `(rate(process_cpu_user_seconds_total[1m]) + rate(process_cpu_system_seconds_total[1m])) * 100`
   * Set Unit to **Misc $\rightarrow$ Percent (0-100)**.
   * Click **Apply**.
5. **Panel 3: Average Request Latency (ms)**
   * Enter Query: `http_request_duration_ms_avg`
   * Set Unit to **Time $\rightarrow$ milliseconds (ms)**.
   * Click **Apply** and save your dashboard as **"RSL Backend Performance"**.

---

## 5. AWS EC2 Production Deployment Notes

When deploying your backend Docker containers to an AWS EC2 instance:
* **Why Performance is Better in Cloud:** On a local development laptop, your CPU and RAM are shared with Docker Desktop VM virtualization, web browsers, media players, and code editors. On an EC2 Linux server, the OS is stripped down and dedicated 100% to your containers, resulting in much lower idle CPU usage and faster response times.
* **EC2 Security Group (Firewall) Configuration:**
  * **Port `80` & `443`**: Open to `0.0.0.0/0` (Allows Vercel frontend and mobile apps to reach your API).
  * **Port `3000` (Grafana)**: Open to your IP address or admin team (Allows you to view dashboards and Loki logs from your web browser).
  * **Port `5432` (Postgres) & `6379` (Redis)**: Keep **closed** to public traffic (accessed internally via Docker network).
