"use client";

import { useState, useCallback } from "react";
import { Binary, Upload, Download, FileUp, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: number; data: any[] }>>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => toast.error('File reading was aborted');
      reader.onerror = () => toast.error('File reading has failed');
      reader.onload = async () => {
        try {
          // For CSV files
          if (file.type === 'text/csv') {
            const csvData = reader.result as string;
            const rows = csvData.split('\\n');
            const headers = rows[0].split(',');
            const data = rows.slice(1).map(row => {
              const values = row.split(',');
              return headers.reduce((obj, header, index) => {
                obj[header.trim()] = values[index]?.trim() || '';
                return obj;
              }, {} as any);
            });
            setUploadedFiles(prev => [...prev, { name: file.name, size: file.size, data }]);
            toast.success('File uploaded successfully!');
          }
          // For JSON files
          else if (file.type === 'application/json') {
            const jsonData = JSON.parse(reader.result as string);
            setUploadedFiles(prev => [...prev, { name: file.name, size: file.size, data: jsonData }]);
            toast.success('File uploaded successfully!');
          }
          else {
            toast.error('Unsupported file format. Please upload CSV or JSON files.');
          }
        } catch (error) {
          console.error('Error processing file:', error);
          toast.error('Error processing file. Please check the format.');
        }
      };
      reader.readAsText(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json']
    },
    maxSize: 5242880, // 5MB
  });

  const handleAnalysis = async () => {
    if (!selectedDataset && !uploadedFiles.length) return;

    try {
      setAnalyzing(true);
      const response = await fetch("/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          datasetId: selectedDataset,
          uploadedData: selectedDataset ? null : uploadedFiles[0].data 
        }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          proModal.onOpen();
          return;
        }
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResult(data);
      toast.success('Analysis completed successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to analyze data');
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
    ].join("\\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedDataset || 'analysis'}_results.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('File downloaded successfully!');
  };

  const removeUploadedFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(file => file.name !== fileName));
    setResult(null);
    toast.success('File removed');
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
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-2">Select Dataset</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose a sample dataset or upload your own
                  </p>
                </div>
                <Button
                  onClick={() => setShowUploadDialog(true)}
                  variant="outline"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Data
                </Button>
              </div>

              <Select
                value={selectedDataset}
                onValueChange={(value) => {
                  setSelectedDataset(value);
                  setResult(null);
                }}
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

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Uploaded Files</h4>
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted"
                    >
                      <div className="flex items-center space-x-2">
                        <FileUp className="h-4 w-4" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUploadedFile(file.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={handleAnalysis}
                disabled={(!selectedDataset && !uploadedFiles.length) || analyzing}
                className="w-full"
              >
                {analyzing ? "Analyzing..." : "Analyze Dataset"}
              </Button>
            </div>
          </Card>

          {analyzing && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          )}

          {!analyzing && !result && !selectedDataset && uploadedFiles.length === 0 && (
            <Empty label="Select a dataset or upload your own to begin analysis" />
          )}

          {result && (
            <div className="space-y-4">
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">{result.summary.title}</h3>
                  <Button onClick={downloadCSV} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Results
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
                <div className="rounded-md border overflow-x-auto">
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

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Dataset</DialogTitle>
            <DialogDescription>
              Upload your CSV or JSON file (max 5MB)
            </DialogDescription>
          </DialogHeader>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-sm text-muted-foreground">Drop the file here</p>
            ) : (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Drag & drop a file here, or click to select
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports CSV and JSON files
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataPage;
