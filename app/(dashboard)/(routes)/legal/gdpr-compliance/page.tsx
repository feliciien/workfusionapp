/** @format */

"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield } from "lucide-react";
import { useState } from "react";

export default function GDPRCompliancePage() {
  const [loading, setLoading] = useState(false);
  const [checklist, setChecklist] = useState({
    dataConsent: false,
    dataProtection: false,
    dataRetention: false,
    dataAccess: false,
    dataBreach: false
  });

  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const analyzeCompliance = () => {
    const complianceRecommendations = [];

    if (!checklist.dataConsent) {
      complianceRecommendations.push(
        "Implement explicit consent mechanisms for data collection and processing"
      );
    }
    if (!checklist.dataProtection) {
      complianceRecommendations.push(
        "Establish robust data protection measures including encryption and access controls"
      );
    }
    if (!checklist.dataRetention) {
      complianceRecommendations.push(
        "Define and document clear data retention policies and deletion procedures"
      );
    }
    if (!checklist.dataAccess) {
      complianceRecommendations.push(
        "Implement processes for handling data subject access requests"
      );
    }
    if (!checklist.dataBreach) {
      complianceRecommendations.push(
        "Develop and document data breach notification procedures"
      );
    }

    return complianceRecommendations;
  };

  const onSubmit = async () => {
    try {
      setLoading(true);
      const results = analyzeCompliance();
      setRecommendations(results);
      setShowResults(true);

      // Save compliance data to the API
      const response = await fetch("/api/gdpr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ checklist })
      });

      if (!response.ok) {
        throw new Error("Failed to save compliance data");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className='mb-8 space-y-4'>
        <h2 className='text-2xl md:text-4xl font-bold text-center'>
          GDPR Compliance Checker
        </h2>
        <p className='text-muted-foreground font-light text-sm md:text-lg text-center'>
          Ensure your business complies with GDPR requirements
        </p>
      </div>
      <div className='px-4 md:px-20 lg:px-32 space-y-4'>
        <Card className='p-6 border-black/5'>
          <div className='flex flex-col space-y-4'>
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='dataConsent'
                  checked={checklist.dataConsent}
                  onCheckedChange={(checked) =>
                    setChecklist({
                      ...checklist,
                      dataConsent: checked as boolean
                    })
                  }
                />
                <label htmlFor='dataConsent'>Data Collection Consent</label>
              </div>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='dataProtection'
                  checked={checklist.dataProtection}
                  onCheckedChange={(checked) =>
                    setChecklist({
                      ...checklist,
                      dataProtection: checked as boolean
                    })
                  }
                />
                <label htmlFor='dataProtection'>Data Protection Measures</label>
              </div>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='dataRetention'
                  checked={checklist.dataRetention}
                  onCheckedChange={(checked) =>
                    setChecklist({
                      ...checklist,
                      dataRetention: checked as boolean
                    })
                  }
                />
                <label htmlFor='dataRetention'>Data Retention Policies</label>
              </div>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='dataAccess'
                  checked={checklist.dataAccess}
                  onCheckedChange={(checked) =>
                    setChecklist({
                      ...checklist,
                      dataAccess: checked as boolean
                    })
                  }
                />
                <label htmlFor='dataAccess'>Data Access Rights</label>
              </div>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='dataBreach'
                  checked={checklist.dataBreach}
                  onCheckedChange={(checked) =>
                    setChecklist({
                      ...checklist,
                      dataBreach: checked as boolean
                    })
                  }
                />
                <label htmlFor='dataBreach'>Data Breach Procedures</label>
              </div>
            </div>
            <Button onClick={onSubmit} disabled={loading} className='w-full'>
              Check Compliance
              <Shield className='w-4 h-4 ml-2' />
            </Button>
            {showResults && (
              <div className='mt-4 space-y-2'>
                <h3 className='text-lg font-semibold'>
                  {recommendations.length > 0
                    ? "Compliance Recommendations:"
                    : "Fully Compliant!"}
                </h3>
                {recommendations.length > 0 ? (
                  <ul className='list-disc pl-5 space-y-2'>
                    {recommendations.map((recommendation, index) => (
                      <li key={index} className='text-sm text-muted-foreground'>
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='text-sm text-green-600'>
                    Your organization appears to have implemented all key GDPR
                    requirements. Continue monitoring and updating your
                    practices regularly.
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
