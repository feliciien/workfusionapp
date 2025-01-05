import Image from 'next/image';

const integrations = [
  {
    name: 'Slack',
    icon: '/logos/slack.svg',
    description: 'Real-time notifications and workflow automation'
  },
  {
    name: 'GitHub',
    icon: '/logos/github.svg',
    description: 'Code repository integration and CI/CD automation'
  },
  {
    name: 'Jira',
    icon: '/logos/jira.svg',
    description: 'Project management and issue tracking'
  },
  {
    name: 'Notion',
    icon: '/logos/notion.svg',
    description: 'Knowledge base and documentation'
  }
];

export const IntegrationsSection = () => {
  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Powerful Integrations
          </h2>
          <p className="text-xl text-gray-400">
            Connect with your favorite tools and platforms
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="bg-gray-800/50 rounded-lg p-6 hover:bg-gray-800/70 transition-colors duration-200 group"
            >
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl group-hover:bg-purple-500/30 transition-colors duration-200" />
                <Image
                  src={integration.icon}
                  alt={integration.name}
                  width={64}
                  height={64}
                  className="relative z-10"
                />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 text-center">
                {integration.name}
              </h3>
              <p className="text-gray-400 text-center">
                {integration.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
