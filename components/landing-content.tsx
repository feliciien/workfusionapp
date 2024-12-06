"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Analytics } from "@vercel/analytics/react";

const testimonials = [
  {
    name: "Franck",
    title: "Software Engineer",
    description: "I can build apps in just a few minutes!",
  },
  {
    name: "Marie",
    title: "AI Expert",
    description: "This platform has become my go-to tool.",
  },
  {
    name: "Andrew",
    title: "Singer",
    description: "It writes amazing lyrics. Such a time-saver!",
  },
  {
    name: "John Doe",
    title: "Software Engineer",
    description: "This is the best application I've ever used.",
  },
];

export const LandingContent = () => {
  return (
    <div className="px-8 pb-10">
      <h2 className="text-center text-2xl font-bold text-gray-900 mb-4">
        User Feedback
      </h2>
      <p className="text-center text-sm text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
        Insights from professionals and creators who rely on our platform daily.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {testimonials.map((item) => {
          const initial = item.name.charAt(0).toUpperCase();
          return (
            <Card key={item.description} className="border border-gray-200 bg-white text-gray-900">
              <CardHeader className="flex flex-col items-start pb-2">
                <div className="flex items-center gap-x-3">
                  <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-medium">
                    {initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.title}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-2">
                <p className="text-sm text-gray-700 leading-normal">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Analytics />
    </div>
  );
};

export default LandingContent;