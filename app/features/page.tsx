/** @format */

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Layout } from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "AI-Powered Chat Assistant",
    description:
      "Get instant help and answers with our intelligent chat assistant powered by advanced language models.",
    icon: "🤖",
    link: "/conversation"
  },
  {
    title: "Code Generation & Analysis",
    description:
      "Automate your development workflow with AI-powered code generation, analysis, and optimization tools.",
    icon: "💻",
    link: "/code"
  },
  {
    title: "Content Creation",
    description:
      "Generate high-quality content efficiently with our AI-powered content creation services.",
    icon: "✍️",
    link: "/content"
  },
  {
    title: "Image & Music Generation",
    description:
      "Create unique visual and audio content using our advanced AI generation capabilities.",
    icon: "🎨",
    link: "/music"
  },
  {
    title: "Voice Synthesis & Translation",
    description:
      "Break language barriers with our advanced voice synthesis and translation services.",
    icon: "🗣️",
    link: "/voice"
  },
  {
    title: "Website Performance Analysis",
    description:
      "Optimize your website's performance with AI-powered analysis and recommendations.",
    icon: "📊",
    link: "/website-performance"
  }
];

export default function FeaturesPage() {
  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      <Heading
        title='Features & Capabilities'
        description='Explore our comprehensive suite of AI-powered tools and services'
        icon={Layout}
        iconColor='text-blue-500'
        bgColor='bg-blue-500/10'
      />

      <div className='mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {features.map((feature, index) => (
          <Card
            key={index}
            className='p-6 hover:shadow-lg transition-shadow flex flex-col'>
            <div className='text-4xl mb-4'>{feature.icon}</div>
            <h3 className='text-xl font-semibold mb-2'>{feature.title}</h3>
            <p className='text-gray-600 mb-4 flex-grow'>
              {feature.description}
            </p>
            <Link href={feature.link} className='mt-auto'>
              <Button className='w-full'>Try Now</Button>
            </Link>
          </Card>
        ))}
      </div>

      <div className='mt-16 text-center'>
        <h2 className='text-2xl font-bold mb-4'>Ready to get started?</h2>
        <p className='text-gray-600 mb-6'>
          Join thousands of users who are already leveraging our AI-powered
          platform
        </p>
        <Link href='/auth/signin'>
          <Button size='lg' className='mx-2'>
            Sign Up Now
          </Button>
        </Link>
        <Link href='/pricing'>
          <Button variant='outline' size='lg' className='mx-2'>
            View Pricing
          </Button>
        </Link>
      </div>
    </div>
  );
}
