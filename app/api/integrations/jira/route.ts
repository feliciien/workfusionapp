import { NextResponse } from 'next/server';
import JiraApi from 'jira-client';

export async function POST(req: Request) {
  try {
    const { action, ...data } = await req.json();
    
    // Initialize Jira client with user's credentials
    const jira = new JiraApi({
      protocol: 'https',
      host: data.host,
      username: data.email,
      password: data.apiToken,
      apiVersion: '2',
      strictSSL: true,
    });

    switch (action) {
      case 'createIssue':
        const issue = await jira.addNewIssue({
          fields: {
            project: { key: data.projectKey },
            summary: data.summary,
            description: data.description,
            issuetype: { name: data.issueType },
          },
        });
        return NextResponse.json({ success: true, issue });

      case 'getIssue':
        const issueData = await jira.findIssue(data.issueId);
        return NextResponse.json({ success: true, issue: issueData });

      case 'listProjects':
        const projects = await jira.listProjects();
        return NextResponse.json({ success: true, projects });

      case 'createWebhook':
        const webhook = await jira.addWebhook({
          name: 'WorkFusion Integration',
          url: `${process.env.NEXT_PUBLIC_API_URL}/api/webhooks/jira`,
          events: ['jira:issue_created', 'jira:issue_updated'],
          filters: {
            'issue-related-events-section': 'true',
          },
        });
        return NextResponse.json({ success: true, webhook });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Jira API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process Jira request' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const siteId = url.searchParams.get('siteId');
    const cloudId = url.searchParams.get('cloudId');

    if (siteId && cloudId) {
      // Exchange OAuth tokens with Atlassian
      const response = await fetch('https://auth.atlassian.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: process.env.JIRA_CLIENT_ID,
          client_secret: process.env.JIRA_CLIENT_SECRET,
          code: siteId,
          redirect_uri: `${process.env.NEXT_PUBLIC_API_URL}/api/integrations/jira/callback`,
        }),
      });

      const data = await response.json();
      
      // Store tokens securely (implement your token storage logic here)
      
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Jira OAuth Error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate with Jira' },
      { status: 500 }
    );
  }
}
