import { BatchService } from "./batch.service.js";

export class BatchController {
  constructor(private readonly service: BatchService) {}

  uploadFile = async ({ request, body }: any) => {
    const userId = request.headers.get("x-user-id");
    if (!userId) throw new Error("Missing user ID");
    const { rawText } = body;
    if (!rawText) throw new Error("Missing rawText");
    return this.service.createFileUploadJob(userId, rawText);
  };

  scanMulti = async ({ request, body }: any) => {
    const userId = request.headers.get("x-user-id");
    if (!userId) throw new Error("Missing user ID");
    const { image } = body;
    if (!image) throw new Error("Missing image (base64)");
    return this.service.createMultiScanJob(userId, image);
  };

  listJobs = async ({ request }: any) => {
    const userId = request.headers.get("x-user-id");
    if (!userId) throw new Error("Missing user ID");

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const fromDate = url.searchParams.get("fromDate") || undefined;
    const toDate = url.searchParams.get("toDate") || undefined;

    return this.service.getUserJobs(userId, page, limit, fromDate, toDate);
  };

  getJob = async ({ request, params }: any) => {
    const userId = request.headers.get("x-user-id");
    if (!userId) throw new Error("Missing user ID");
    return this.service.getJob(userId, params.id);
  };
}
