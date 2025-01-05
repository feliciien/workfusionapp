import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthSession } from "@/lib/auth-helper";
import { db } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { userId } = await getAuthSession();
    const { modelId } = req.query;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const model = await db.customModel.findUnique({
      where: {
        id: modelId as string,
        userId
      }
    });

    if (!model) {
      return res.status(404).json({ error: "Model not found" });
    }

    return res.status(200).json({
      status: model.status,
      error: model.error
    });
  } catch (error) {
    console.log("[MODEL_STATUS_ERROR]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}
