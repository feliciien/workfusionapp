import { NextResponse } from 'next/server';
import { WebClient } from '@slack/web-api';

// Initialize Slack client
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function POST(req: Request) {
  try {
    const { action, channelName, message } = await req.json();

    switch (action) {
      case 'createChannel':
        const channelResult = await slack.conversations.create({
          name: channelName,
        });
        return NextResponse.json({ success: true, channel: channelResult.channel });

      case 'sendMessage':
        const messageResult = await slack.chat.postMessage({
          channel: channelName,
          text: message,
        });
        return NextResponse.json({ success: true, message: messageResult });

      case 'listChannels':
        const channels = await slack.conversations.list();
        return NextResponse.json({ success: true, channels: channels.channels });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Slack API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process Slack request' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // Get OAuth URL for Slack installation
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (code) {
      // Exchange code for access token
      const result = await slack.oauth.v2.access({
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code,
      });

      // Store tokens securely (implement your token storage logic here)
      
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'No authorization code provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Slack OAuth Error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate with Slack' },
      { status: 500 }
    );
  }
}
