"use client";

import { useState } from "react";
import { Binary, Upload, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/heading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { useProModal } from "@/hooks/use-pro-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const sampleDatasets = [
  {
    id: "sales_data",
    name: "Sales Performance 2024",
    description: "Monthly sales data with product categories and regions",
    rows: 1000,
  },
  {
    id: "customer_data",
    name: "Customer Demographics",
    description: "Customer segmentation and behavior analysis",
    rows: 500,
  },
  {
    id: "marketing_data",
    name: "Marketing Campaign Results",
    description: "Performance metrics from recent marketing campaigns",
    rows: 750,
  },
];

const DataPage = () => {
  const router = useRouter();
  const proModal = useProModal();
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    summary: {
      title: string;
      metrics: { label: string; value: string }[];
    };
    insights: string[];
    trends: {
      name: string;
      data: { category: string; value: number }[];
    }[];
    recommendations: string[];
    data: any[];
  } | null>(null);

  const handleAnalysis = async () => {
    if (!selectedDataset) return;

    try {
      setAnalyzing(true);
      const response = await fetch("/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ datasetId: selectedDataset }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          proModal.onOpen();
        }
        return;
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setAnalyzing(false);
      router.refresh();
    }
  };

  const downloadCSV = () => {
    if (!result) return;

    const headers = Object.keys(result.data[0]);
    const csvContent = [
      headers.join(","),
      ...result.data.map(row => headers.map(header => row[header]).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedDataset}_analysis.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Heading
        title="Data Analysis"
        description="Analyze datasets and uncover valuable insights."
        icon={Binary}
        iconColor="text-indigo-700"
        bgColor="bg-indigo-700/10"
      />
      <div className="px-4 lg:px-8">
        <div className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Select Dataset</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose a sample dataset to analyze or upload your own
                </p>
                <Select
                  value={selectedDataset}
                  onValueChange={setSelectedDataset}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleDatasets.map((dataset) => (
                      <SelectItem key={dataset.id} value={dataset.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{dataset.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {dataset.description} ({dataset.rows} rows)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAnalysis}
                disabled={!selectedDataset || analyzing}
                className="w-full"
              >
                Analyze Dataset
              </Button>
            </div>
          </Card>

          {analyzing && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          )}

          {!analyzing && !result && !selectedDataset && (
            <Empty label="Select a dataset to begin analysis" />
          )}

          {result && (
            <div className="space-y-4">
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">{result.summary.title}</h3>
                  <Button onClick={downloadCSV} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {result.summary.metrics.map((metric, index) => (
                    <div
                      key={index}
                      className="p-4 bg-muted rounded-lg text-center"
                    >
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {metric.label}
                      </p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Key Insights</h4>
                    <ul className="list-disc pl-4 space-y-1">
                      {result.insights.map((insight, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                    <ul className="list-disc pl-4 space-y-1">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Data Preview</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(result.data[0]).map((header) => (
                          <TableHead key={header}>
                            {header.split("_").map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(" ")}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.data.slice(0, 5).map((row, index) => (
                        <TableRow key={index}>
                          {Object.values(row).map((value: any, cellIndex) => (
                            <TableCell key={cellIndex}>
                              {typeof value === "number"
                                ? value.toLocaleString()
                                : value}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataPage;
