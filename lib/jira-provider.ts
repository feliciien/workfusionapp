import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth"

export interface JiraProfile {
  account_id: string
  email: string
  name: string
  picture: string
  active: boolean
}

export default function JiraProvider<P extends JiraProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  const { clientId, clientSecret } = options;
  
  return {
    id: "jira",
    name: "Jira",
    type: "oauth",
    authorization: {
      url: "https://auth.atlassian.com/authorize",
      params: {
        audience: "api.atlassian.com",
        client_id: clientId,
        scope: "read:me read:account read:jira-work manage:jira-project manage:jira-configuration read:jira-user write:jira-work manage:jira-webhook manage:jira-data-provider",
        response_type: "code",
        prompt: "consent",
      },
    },
    token: {
      url: "https://auth.atlassian.com/oauth/token",
    },
    userinfo: {
      url: "https://api.atlassian.com/me",
    },
    profile(profile: JiraProfile) {
      return {
        id: profile.account_id,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      }
    },
    style: {
      logo: "/jira-logo.svg",
      logoDark: "/jira-logo-dark.svg",
      bg: "#0052CC",
      text: "#fff",
      bgDark: "#0052CC",
      textDark: "#fff",
    },
    options,
  }
}
