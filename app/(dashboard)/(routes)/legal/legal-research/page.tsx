/** @format */

"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Scale } from "lucide-react";
import { useState } from "react";

export default function LegalResearchPage() {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState("");

  const onSubmit = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/legal/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error("Failed to perform legal research");
      }

      const data = await response.json();
      setResults(data.content || data.text || "");
    } catch (error) {
      console.error(error);
      setResults(
        "An error occurred while performing legal research. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className='mb-8 space-y-4'>
        <h2 className='text-2xl md:text-4xl font-bold text-center'>
          Legal Research Assistant
        </h2>
        <p className='text-muted-foreground font-light text-sm md:text-lg text-center'>
          AI-powered legal research and case analysis
        </p>
      </div>
      <div className='px-4 md:px-20 lg:px-32 space-y-4'>
        <Card className='p-6 border-black/5'>
          <div className='flex flex-col space-y-4'>
            <Textarea
              placeholder='Enter your legal research query...'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className='min-h-[100px]'
            />
            <Button
              onClick={onSubmit}
              disabled={loading || !query}
              className='w-full'>
              {loading ? "Researching..." : "Research"}
              <Scale className='w-4 h-4 ml-2' />
            </Button>
            {results && (
              <div className='mt-4 p-4 bg-secondary/50 rounded-lg'>
                <pre className='whitespace-pre-wrap'>{results}</pre>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
