import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

interface DataItem {
  date: string;
  region: string;
  category: string;
  sales: number;
  units: number;
  profit_margin: string;
}

interface CustomerData {
  customer_id: string;
  segment: string;
  preferred_channel: string;
  lifetime_value: number;
  purchase_frequency: number;
  satisfaction_score: number;
}

interface MarketingData {
  campaign_name: string;
  platform: string;
  spend: number;
  impressions: number;
  conversions: number;
  roi: string;
}

const generateSalesData = () => {
  const regions = ["North", "South", "East", "West"];
  const categories = ["Electronics", "Clothing", "Food", "Home"];
  const data: DataItem[] = [];

  for (let i = 0; i < 1000; i++) {
    const date = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    data.push({
      date: date.toISOString().split("T")[0],
      region: regions[Math.floor(Math.random() * regions.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      sales: Math.floor(Math.random() * 10000) + 1000,
      units: Math.floor(Math.random() * 100) + 10,
      profit_margin: (Math.random() * 0.4 + 0.1).toFixed(2)
    });
  }

  return {
    summary: {
      title: "Sales Performance Analysis 2024",
      metrics: [
        { label: "Total Sales", value: "$" + data.reduce((sum, row) => sum + row.sales, 0).toLocaleString() },
        { label: "Total Units", value: data.reduce((sum, row) => sum + row.units, 0).toLocaleString() },
        { label: "Avg Profit Margin", value: (data.reduce((sum, row) => sum + parseFloat(row.profit_margin), 0) / data.length * 100).toFixed(1) + "%" },
        { label: "Best Region", value: "West" }
      ]
    },
    insights: [
      "Electronics category shows highest profit margins at 32%",
      "West region leads in sales performance",
      "Seasonal peaks observed in Q4 2024",
      "Food category shows most consistent sales patterns",
      "Premium products drive higher margins in urban areas"
    ],
    trends: [
      {
        name: "Sales by Category",
        data: categories.map(category => ({
          category,
          value: data.filter(row => row.category === category)
            .reduce((sum, row) => sum + row.sales, 0)
        }))
      }
    ],
    recommendations: [
      "Expand electronics inventory in Western region",
      "Implement seasonal promotions for clothing category",
      "Optimize food category supply chain",
      "Increase marketing budget for Q4 2024",
      "Focus on premium product lines in urban centers"
    ],
    data: data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  };
};

const generateCustomerData = () => {
  const segments = ["Premium", "Standard", "Basic"];
  const channels = ["Web", "Mobile", "Store"];
  const data: CustomerData[] = [];

  for (let i = 0; i < 500; i++) {
    data.push({
      customer_id: "CUS" + (1000 + i),
      segment: segments[Math.floor(Math.random() * segments.length)],
      preferred_channel: channels[Math.floor(Math.random() * channels.length)],
      lifetime_value: Math.floor(Math.random() * 5000) + 500,
      purchase_frequency: Math.floor(Math.random() * 12) + 1,
      satisfaction_score: Math.floor(Math.random() * 5) + 1
    });
  }

  return {
    summary: {
      title: "Customer Demographics Analysis",
      metrics: [
        { label: "Total Customers", value: data.length.toLocaleString() },
        { label: "Avg LTV", value: "$" + (data.reduce((sum, row) => sum + row.lifetime_value, 0) / data.length).toFixed(0) },
        { label: "Top Segment", value: "Premium" },
        { label: "Avg Satisfaction", value: "4.2/5" }
      ]
    },
    insights: [
      "Premium segment shows 3x higher LTV",
      "Mobile channel preferred by younger demographics",
      "High correlation between purchase frequency and satisfaction",
      "Store visitors show highest loyalty rates",
      "Web channel drives most new customer acquisition"
    ],
    trends: [
      {
        name: "Customer Value by Segment",
        data: segments.map(segment => ({
          category: segment,
          value: data.filter(row => row.segment === segment)
            .reduce((sum, row) => sum + row.lifetime_value, 0) / data.filter(row => row.segment === segment).length
        }))
      }
    ],
    recommendations: [
      "Launch premium loyalty program",
      "Enhance mobile app experience",
      "Implement omnichannel strategy",
      "Personalize marketing campaigns",
      "Focus on customer retention in basic segment"
    ],
    data
  };
};

const generateMarketingData = () => {
  const campaigns = ["Social Media", "Email", "Display Ads", "Search", "Influencer"];
  const platforms = ["Instagram", "Facebook", "Google", "TikTok", "LinkedIn"];
  const data: MarketingData[] = [];

  for (let i = 0; i < 750; i++) {
    const spend = Math.floor(Math.random() * 5000) + 1000;
    const conversions = Math.floor(Math.random() * 100) + 10;
    data.push({
      campaign_name: campaigns[Math.floor(Math.random() * campaigns.length)],
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      spend,
      impressions: Math.floor(Math.random() * 100000) + 10000,
      conversions,
      roi: ((conversions * 100 - spend) / spend * 100).toFixed(1)
    });
  }

  return {
    summary: {
      title: "Marketing Campaign Analysis",
      metrics: [
        { label: "Total Spend", value: "$" + data.reduce((sum, row) => sum + row.spend, 0).toLocaleString() },
        { label: "Total Conversions", value: data.reduce((sum, row) => sum + row.conversions, 0).toLocaleString() },
        { label: "Avg ROI", value: (data.reduce((sum, row) => sum + parseFloat(row.roi), 0) / data.length).toFixed(1) + "%" },
        { label: "Best Platform", value: "TikTok" }
      ]
    },
    insights: [
      "Social media campaigns show highest ROI",
      "Email marketing most cost-effective",
      "TikTok growing fastest in engagement",
      "Search ads drive highest quality leads",
      "Influencer campaigns best for brand awareness"
    ],
    trends: [
      {
        name: "ROI by Platform",
        data: platforms.map(platform => ({
          category: platform,
          value: parseFloat(
            (data.filter(row => row.platform === platform)
              .reduce((sum, row) => sum + parseFloat(row.roi), 0) /
              data.filter(row => row.platform === platform).length)
              .toFixed(1)
          )
        }))
      }
    ],
    recommendations: [
      "Increase investment in TikTok advertising",
      "Optimize email marketing automation",
      "Scale successful influencer partnerships",
      "Improve search ad targeting",
      "Focus on video content across platforms"
    ],
    data
  };
};

const datasets: Record<string, () => any> = {
  sales_data: generateSalesData,
  customer_data: generateCustomerData,
  marketing_data: generateMarketingData,
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { datasetId } = body;

    if (!datasetId || !datasets[datasetId]) {
      return new NextResponse("Invalid dataset ID", { status: 400 });
    }

    const freeTrial = await checkApiLimit(session.user.id);
    const isPro = await checkSubscription(session.user.id);

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    // Generate dataset
    const data = datasets[datasetId]();

    // Increment the API limit
    if (!isPro) {
      await increaseApiLimit(session.user.id);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.log("[DATA_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
