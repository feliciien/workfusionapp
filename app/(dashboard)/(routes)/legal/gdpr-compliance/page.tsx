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

  const onSubmit = async () => {
    try {
      setLoading(true);
      // TODO: Implement GDPR compliance check logic
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
          </div>
        </Card>
      </div>
    </div>
  );
}
