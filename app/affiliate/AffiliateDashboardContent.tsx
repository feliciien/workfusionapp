// app/affiliate/AffiliateDashboardContent.tsx

'use client';

import React from 'react';
import { Copy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { Heading } from '@/components/heading';
import { Card } from '@/components/ui/card';

interface Commission {
  id: string;
  affiliateId: string;
  referredUserId: string;
  amount: number;
  status: string;
  createdAt: string; // Changed to string
  updatedAt: string; // Changed to string
}

interface Affiliate {
  id: string;
  userId: string;
  referralCode: string;
  createdAt: string; // Changed to string
  updatedAt: string; // Changed to string
  commissions: Commission[];
}

export function AffiliateDashboardContent({ affiliate }: { affiliate: Affiliate }) {
  // Calculate total commissions earned
  const totalEarned = affiliate.commissions.reduce((total, commission) => {
    return total + commission.amount;
  }, 0);

  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?referralCode=${affiliate.referralCode}`;

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  return (
    <div className="px-4 lg:px-8">
      <Heading
        title="Affiliate Dashboard"
        description="Share your referral link and earn commissions"
        icon={Users}
        iconColor="text-blue-500"
        bgColor="bg-blue-500/10"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Referral Code Card */}
        <Card className="p-6 flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Your Referral Code</h2>
          <div className="flex items-center">
            <input
              type="text"
              readOnly
              value={affiliate.referralCode}
              className="w-full border border-gray-300 rounded-l-md px-4 py-2"
            />
            <Button
              variant="outline"
              onClick={() => copyToClipboard(affiliate.referralCode, 'Referral code copied!')}
              className="rounded-l-none"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Referral Link Card */}
        <Card className="p-6 flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Your Referral Link</h2>
          <div className="flex items-center">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="w-full border border-gray-300 rounded-l-md px-4 py-2"
            />
            <Button
              variant="outline"
              onClick={() => copyToClipboard(referralLink, 'Referral link copied!')}
              className="rounded-l-none"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Total Commissions */}
      <Card className="p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">Total Commissions Earned</h2>
        <p className="text-4xl font-bold">${totalEarned.toFixed(2)}</p>
      </Card>

      {/* Referrals Table */}
      <Card className="p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">Your Referrals</h2>
        {affiliate.commissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b">Referred User ID</th>
                  <th className="px-4 py-2 border-b">Amount</th>
                  <th className="px-4 py-2 border-b">Status</th>
                  <th className="px-4 py-2 border-b">Date Earned</th>
                </tr>
              </thead>
              <tbody>
                {affiliate.commissions.map((commission) => (
                  <tr key={commission.id}>
                    <td className="px-4 py-2 border-b">{commission.referredUserId}</td>
                    <td className="px-4 py-2 border-b">${commission.amount.toFixed(2)}</td>
                    <td className="px-4 py-2 border-b capitalize">{commission.status}</td>
                    <td className="px-4 py-2 border-b">
                      {new Date(commission.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">
            You have no referrals yet. Share your referral link to start earning commissions!
          </p>
        )}
      </Card>
    </div>
  );
}
