/** @format */

import prismadb from "@/lib/prismadb";

export class ToolsService {
  static async logToolUsage(userId: string, toolName: string, params: any) {
    try {
      return await prismadb.toolUsage.create({
        data: {
          userId,
          toolName,
          params: JSON.stringify(params),
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error("[LOG_TOOL_USAGE_ERROR]", error);
      throw error;
    }
  }

  static async createLegalDocument(
    userId: string,
    title: string,
    content: string,
    type: string
  ) {
    try {
      return await prismadb.legalDocument.create({
        data: {
          userId,
          title,
          content,
          type,
          status: "draft"
        }
      });
    } catch (error) {
      console.error("[CREATE_LEGAL_DOCUMENT_ERROR]", error);
      throw error;
    }
  }

  static async createCodeAnalysis(
    userId: string,
    codeContent: string,
    language: string,
    result: string
  ) {
    try {
      return await prismadb.codeAnalysis.create({
        data: {
          userId,
          codeContent,
          language,
          result
        }
      });
    } catch (error) {
      console.error("[CREATE_CODE_ANALYSIS_ERROR]", error);
      throw error;
    }
  }

  static async updateToolStatus(
    id: string,
    status: string,
    result?: string,
    error?: string
  ) {
    try {
      return await prismadb.toolUsage.update({
        where: { id },
        data: {
          status,
          result,
          error
        }
      });
    } catch (error) {
      console.error("[UPDATE_TOOL_STATUS_ERROR]", error);
      throw error;
    }
  }
}
