import { ZodError } from "zod";
import type { ContactService } from "./contact.service.js";
import { ContactSubmissionSchema } from "./contact.schema.js";

export class ContactController {
  constructor(private readonly service: ContactService) {}

  private getRequestMeta(request: Request) {
    return {
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
      userAgent: request.headers.get("user-agent") || null,
    };
  }

  submit = async ({ body, request, set }: { body: any; request: Request; set: any }) => {
    try {
      const data = ContactSubmissionSchema.parse(body);
      return await this.service.submit(data, this.getRequestMeta(request));
    } catch (error) {
      if (error instanceof ZodError) {
        set.status = 400;
        return {
          success: false,
          error: {
            code: "CONTACT_VALIDATION_ERROR",
            message: "Please check the contact form fields and try again.",
            details: error.flatten().fieldErrors,
          },
        };
      }

      throw error;
    }
  };
}

