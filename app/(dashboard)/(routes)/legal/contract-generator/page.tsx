/** @format */

"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Document, Packer, Paragraph, TextRun } from "docx";
import jsPDF from "jspdf";
import { Download, FileText, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function ContractGeneratorPage() {
  const [loading, setLoading] = useState(false);
  const [contractType, setContractType] = useState("employment");
  const [party1Name, setParty1Name] = useState("");
  const [party2Name, setParty2Name] = useState("");
  const [requirements, setRequirements] = useState("");
  const [generatedContract, setGeneratedContract] = useState("");

  const onSubmit = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contractType,
          party1Name,
          party2Name,
          requirements
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate contract");
      }

      const data = await response.json();
      setGeneratedContract(data.content);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className='mb-8 space-y-4'>
        <h2 className='text-2xl md:text-4xl font-bold text-center'>
          Contract Generator
        </h2>
        <p className='text-muted-foreground font-light text-sm md:text-lg text-center'>
          Generate legally compliant contracts tailored to your needs
        </p>
      </div>
      <div className='px-4 md:px-20 lg:px-32 space-y-4'>
        <Card className='p-6 border-black/5'>
          <div className='flex flex-col space-y-4'>
            <div className='space-y-4'>
              <Select
                value={contractType}
                onValueChange={setContractType}
                defaultValue='employment'>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select contract type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='employment'>
                    Employment Contract
                  </SelectItem>
                  <SelectItem value='service'>Service Agreement</SelectItem>
                  <SelectItem value='nda'>Non-Disclosure Agreement</SelectItem>
                  <SelectItem value='lease'>Lease Agreement</SelectItem>
                  <SelectItem value='sale'>Sales Contract</SelectItem>
                </SelectContent>
              </Select>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Input
                  placeholder='Party 1 Name'
                  value={party1Name}
                  onChange={(e) => setParty1Name(e.target.value)}
                />
                <Input
                  placeholder='Party 2 Name'
                  value={party2Name}
                  onChange={(e) => setParty2Name(e.target.value)}
                />
              </div>

              <Textarea
                placeholder='Additional terms and requirements...'
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={5}
              />

              <Button onClick={onSubmit} disabled={loading} className='w-full'>
                {loading ? (
                  "Generating..."
                ) : (
                  <>
                    Generate Contract
                    <FileText className='w-4 h-4 ml-2' />
                  </>
                )}
              </Button>
            </div>

            {generatedContract && (
              <div className='mt-8 space-y-4'>
                <div className='p-4 border rounded-lg whitespace-pre-wrap'>
                  {generatedContract}
                </div>
                <div className='flex justify-end space-x-2'>
                  <Button
                    variant='outline'
                    onClick={() => {
                      toast.success("Contract saved to your account");
                    }}>
                    <Save className='w-4 h-4 mr-2' />
                    Save
                  </Button>
                  <div className='flex space-x-2'>
                    <Button
                      variant='outline'
                      onClick={async () => {
                        const doc = new Document({
                          styles: {
                            paragraphStyles: [
                              {
                                id: "Heading1",
                                name: "Heading 1",
                                basedOn: "Normal",
                                next: "Normal",
                                quickFormat: true,
                                run: {
                                  size: 32,
                                  bold: true,
                                  color: "000000"
                                }
                              },
                              {
                                id: "Normal",
                                name: "Normal",
                                next: "Normal",
                                quickFormat: true,
                                run: {
                                  size: 24,
                                  color: "000000"
                                },
                                paragraph: {
                                  spacing: {
                                    line: 360,
                                    before: 240,
                                    after: 240
                                  }
                                }
                              }
                            ]
                          },
                          sections: [
                            {
                              properties: {
                                page: {
                                  margin: {
                                    top: 1440,
                                    right: 1440,
                                    bottom: 1440,
                                    left: 1440
                                  }
                                }
                              },
                              children: generatedContract
                                .split("\n")
                                .map((line) => {
                                  const isHeading = line.startsWith("#");
                                  return new Paragraph({
                                    style: isHeading ? "Heading1" : "Normal",
                                    children: [
                                      new TextRun(line.replace("#", "").trim())
                                    ]
                                  });
                                })
                            }
                          ]
                        });
                        const blob = await Packer.toBlob(doc);
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${contractType}_contract.docx`;
                        a.click();
                        window.URL.revokeObjectURL(url);
                        toast.success("Downloaded as Word document");
                      }}>
                      <Download className='w-4 h-4 mr-2' />
                      Word
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => {
                        const pdf = new jsPDF();
                        const splitText = pdf.splitTextToSize(
                          generatedContract,
                          pdf.internal.pageSize.width - 20
                        );
                        let yPosition = 20;

                        // Add title
                        pdf.setFontSize(18);
                        pdf.text(
                          `${contractType.toUpperCase()} CONTRACT`,
                          pdf.internal.pageSize.width / 2,
                          yPosition,
                          { align: "center" }
                        );
                        yPosition += 20;

                        // Add content
                        pdf.setFontSize(12);
                        splitText.forEach((line) => {
                          if (yPosition >= pdf.internal.pageSize.height - 20) {
                            pdf.addPage();
                            yPosition = 20;
                          }
                          pdf.text(line, 10, yPosition);
                          yPosition += 10;
                        });
                        pdf.save(`${contractType}_contract.pdf`);
                        toast.success("Downloaded as PDF");
                      }}>
                      <Download className='w-4 h-4 mr-2' />
                      PDF
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
