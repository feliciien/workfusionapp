import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

export async function POST(req: Request) {
  try {
    const { action, ...data } = await req.json();
    
    // Initialize Notion client with user's access token
    const notion = new Client({
      auth: data.accessToken || process.env.NOTION_ACCESS_TOKEN,
    });

    switch (action) {
      case 'createPage':
        const page = await notion.pages.create({
          parent: { database_id: data.databaseId },
          properties: {
            title: {
              title: [{ text: { content: data.title } }],
            },
            ...data.properties,
          },
        });
        return NextResponse.json({ success: true, page });

      case 'searchDatabase':
        const searchResults = await notion.databases.query({
          database_id: data.databaseId,
          filter: data.filter,
          sorts: data.sorts,
        });
        return NextResponse.json({ success: true, results: searchResults });

      case 'createDatabase':
        const database = await notion.databases.create({
          parent: { page_id: data.pageId },
          title: [{ text: { content: data.title } }],
          properties: data.schema,
        });
        return NextResponse.json({ success: true, database });

      case 'syncContent':
        // Implement two-way sync between WorkFusion and Notion
        const syncedContent = await notion.blocks.children.append({
          block_id: data.pageId,
          children: data.content,
        });
        return NextResponse.json({ success: true, content: syncedContent });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Notion API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process Notion request' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (code) {
      // Exchange the temporary code for an access token
      const response = await fetch('https://api.notion.com/v1/oauth/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
          ).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code,
          redirect_uri: `${process.env.NEXT_PUBLIC_API_URL}/api/integrations/notion/callback`,
        }),
      });

      const data = await response.json();
      
      // Store tokens securely (implement your token storage logic here)
      
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'No authorization code provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Notion OAuth Error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate with Notion' },
      { status: 500 }
    );
  }
}
