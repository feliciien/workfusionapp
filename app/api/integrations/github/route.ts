import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

// Initialize GitHub client
const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
});

export async function POST(req: Request) {
  try {
    const { action, owner, repo, title, body, branch } = await req.json();

    switch (action) {
      case 'createPR':
        const pr = await octokit.pulls.create({
          owner,
          repo,
          title,
          body,
          head: branch,
          base: 'main',
        });
        return NextResponse.json({ success: true, pullRequest: pr.data });

      case 'listRepos':
        const repos = await octokit.repos.listForAuthenticatedUser();
        return NextResponse.json({ success: true, repositories: repos.data });

      case 'createWebhook':
        const webhook = await octokit.repos.createWebhook({
          owner,
          repo,
          config: {
            url: `${process.env.NEXT_PUBLIC_API_URL}/api/webhooks/github`,
            content_type: 'json',
          },
          events: ['push', 'pull_request'],
        });
        return NextResponse.json({ success: true, webhook: webhook.data });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('GitHub API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process GitHub request' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (code) {
      // Exchange code for access token
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
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
    console.error('GitHub OAuth Error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate with GitHub' },
      { status: 500 }
    );
  }
}
