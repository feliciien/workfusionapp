/** @format */

"use client";

import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import React, { useState } from "react";

interface ContractGeneratorProps {
  contractContent: string;
}

export const ContractGenerator: React.FC<ContractGeneratorProps> = ({
  contractContent
}) => {
  const [loading, setLoading] = useState(false);

  const generateWordDoc = async () => {
    setLoading(true);
    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: contractContent.split("\n").map((line) => {
              return new Paragraph({
                children: [
                  new TextRun({ text: line.replace(/\*\*/g, "").trim() })
                ]
              });
            })
          }
        ]
      });

      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      });
      saveAs(blob, "sale-agreement.docx");
    } catch (error) {
      console.error("Error generating Word document:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    setLoading(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

      const lines = contractContent
        .split("\n")
        .map((line) => line.replace(/\*\*/g, "").trim())
        .filter((line) => line.length > 0);

      let y = page.getHeight() - 50;
      const fontSize = 12;
      const lineHeight = 20;

      lines.forEach((line) => {
        if (y > 50) {
          page.drawText(line, {
            x: 50,
            y,
            size: fontSize,
            font,
            color: rgb(0, 0, 0)
          });
          y -= lineHeight;
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      saveAs(blob, "sale-agreement.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPlainText = () => {
    return contractContent.replace(/\*\*/g, "").trim();
  };

  return (
    <div className='space-y-4'>
      <pre className='whitespace-pre-wrap font-serif text-base p-6 bg-white rounded-lg shadow'>
        {getPlainText()}
      </pre>
      <div className='flex space-x-4'>
        <button
          onClick={generateWordDoc}
          disabled={loading}
          className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50'>
          Download as Word
        </button>
        <button
          onClick={generatePDF}
          disabled={loading}
          className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50'>
          Download as PDF
        </button>
      </div>
    </div>
  );
};
