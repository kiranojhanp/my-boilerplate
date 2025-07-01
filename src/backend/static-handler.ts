import { logger } from "@/backend/utils";

interface StaticFileOptions {
  basePath: string;
  fallbackFile?: string;
}

export class StaticFileHandler {
  private basePath: string;
  private fallbackFile: string;

  constructor(options: StaticFileOptions) {
    this.basePath = options.basePath;
    this.fallbackFile = options.fallbackFile || "/index.html";
  }

  async handleRequest(request: Request): Promise<Response | null> {
    const url = new URL(request.url);
    const filePath = url.pathname === "/" ? "/index.html" : url.pathname;

    try {
      // Try to serve the requested file (with compression support)
      const fileResponse = await this.tryServeFile(request, filePath);
      if (fileResponse) {
        return fileResponse;
      }

      // SPA fallback - serve index.html for client-side routing
      const fallbackResponse = await this.tryServeFile(request, this.fallbackFile);
      if (fallbackResponse) {
        return fallbackResponse;
      }

      return null;
    } catch (error) {
      logger.error("Error serving static file:", error);
      return null;
    }
  }

  private async tryServeFile(request: Request, filePath: string): Promise<Response | null> {
    const acceptEncoding = request.headers.get("accept-encoding") || "";
    
    // Determine the best file to serve based on client support
    const { fileToServe, contentEncoding } = await this.selectBestFile(filePath, acceptEncoding);
    
    const staticFile = Bun.file(fileToServe);
    if (!(await staticFile.exists())) {
      return null;
    }

    const headers = this.buildHeaders(filePath, contentEncoding);
    return new Response(staticFile, { headers });
  }

  private async selectBestFile(filePath: string, acceptEncoding: string) {
    const basePath = `${this.basePath}${filePath}`;
    
    // Try Brotli first (better compression), then Gzip, then original
    if (acceptEncoding.includes("br")) {
      const brotliFile = Bun.file(`${basePath}.br`);
      if (await brotliFile.exists()) {
        return { fileToServe: `${basePath}.br`, contentEncoding: "br" };
      }
    }
    
    if (acceptEncoding.includes("gzip")) {
      const gzipFile = Bun.file(`${basePath}.gz`);
      if (await gzipFile.exists()) {
        return { fileToServe: `${basePath}.gz`, contentEncoding: "gzip" };
      }
    }
    
    return { fileToServe: basePath, contentEncoding: undefined };
  }

  private buildHeaders(filePath: string, contentEncoding?: string): Record<string, string> {
    const headers: Record<string, string> = {};

    // Set content encoding for compressed files
    if (contentEncoding) {
      headers["Content-Encoding"] = contentEncoding;
    }

    // Set content type based on file extension
    const ext = filePath.split(".").pop()?.toLowerCase();
    headers["Content-Type"] = this.getContentType(ext);

    // Add cache headers
    if (ext !== "html") {
      // Static assets get long cache
      headers["Cache-Control"] = "public, max-age=31536000, immutable";
    } else {
      // HTML should be revalidated
      headers["Cache-Control"] = "public, max-age=0, must-revalidate";
    }

    return headers;
  }

  private getContentType(ext?: string): string {
    switch (ext) {
      case "html":
        return "text/html; charset=utf-8";
      case "js":
      case "mjs":
        return "application/javascript; charset=utf-8";
      case "css":
        return "text/css; charset=utf-8";
      case "json":
        return "application/json; charset=utf-8";
      case "svg":
        return "image/svg+xml";
      case "png":
        return "image/png";
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "ico":
        return "image/x-icon";
      default:
        return "application/octet-stream";
    }
  }
}
