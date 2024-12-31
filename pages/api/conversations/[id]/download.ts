import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from "@clerk/nextjs";
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
    const { userId } = await auth();
    const { id } = req.query;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const conversation = await db.conversation.findUnique({
      where: {
        id: id as string,
        userId
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const formattedMessages = conversation.messages.map((message: any) => {
      return `${message.role}: ${message.content}\n`;
    }).join('\n');

    const fileName = `conversation-${conversation.id}.txt`;
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'text/plain');
    return res.send(formattedMessages);
  } catch (error) {
    console.log("[CONVERSATION_DOWNLOAD_ERROR]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}
