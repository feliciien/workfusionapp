/** @format */

"use client";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  contractType: z.string().min(1, { message: "Contract type is required" }),
  partyOne: z.string().min(1, { message: "First party is required" }),
  partyTwo: z.string().min(1, { message: "Second party is required" }),
  terms: z
    .string()
    .min(10, { message: "Terms must be at least 10 characters" }),
  effectiveDate: z.string().min(1, { message: "Effective date is required" }),
  outputFormat: z.string().min(1, { message: "Output format is required" })
});

export default function ContractPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContract, setGeneratedContract] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractType: "",
      partyOne: "",
      partyTwo: "",
      terms: "",
      effectiveDate: "",
      outputFormat: "word"
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        throw new Error("Failed to generate contract");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contract.${values.outputFormat === "word" ? "docx" : "pdf"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Heading
        title='Contract Generator'
        description='Generate legal contracts with ease'
        icon='file-text'
        iconColor='text-gray-700'
        bgColor='bg-gray-700/10'
      />
      <div className='px-4 lg:px-8'>
        <Card className='p-4 border-black/5 shadow-sm'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='contractType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Type</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a contract type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='service'>
                          Service Agreement
                        </SelectItem>
                        <SelectItem value='employment'>
                          Employment Contract
                        </SelectItem>
                        <SelectItem value='nda'>
                          Non-Disclosure Agreement
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='outputFormat'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Output Format</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select output format' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='word'>
                          Word Document (.docx)
                        </SelectItem>
                        <SelectItem value='pdf'>PDF Document (.pdf)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='partyOne'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Party</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          placeholder='Enter first party name'
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='partyTwo'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Second Party</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          placeholder='Enter second party name'
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='terms'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Terms</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isLoading}
                        placeholder='Enter contract terms and conditions'
                        {...field}
                        className='resize-none'
                        rows={5}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='effectiveDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective Date</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} type='date' {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                className='w-full'
                type='submit'
                disabled={isLoading}
                size='lg'>
                {isLoading ? "Generating..." : "Generate Contract"}
              </Button>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
