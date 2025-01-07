"use client";

import { useState, useEffect } from "react";
import { Heading } from "@/components/heading";
import { tools } from "../dashboard/config";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import api from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Loader2, Copy, RefreshCw, BookOpen, History, Save, Trash2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LearningHistory {
  id: string;
  query: string;
  answer: string;
  timestamp: number;
  notes?: string;
}

interface LearningResponse {
  answer: string;
}

export default function LearningPage() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<LearningHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeNote, setActiveNote] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [learningType, setLearningType] = useState("summary");

  const learningTool = tools.find(t => t.label === "Learning Path");

  useEffect(() => {
    const savedHistory = localStorage.getItem("learningHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  if (!learningTool) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Learning Path tool not found</p>
      </div>
    );
  }

  const saveToHistory = (query: string, answer: string) => {
    const newHistory: LearningHistory = {
      id: Date.now().toString(),
      query,
      answer,
      timestamp: Date.now(),
    };
    const updatedHistory = [newHistory, ...history].slice(0, 10); // Keep last 10 items
    setHistory(updatedHistory);
    localStorage.setItem("learningHistory", JSON.stringify(updatedHistory));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    if (!query.trim()) {
      toast.error("Please enter your content");
      return;
    }

    if (query.length > 2000) {
      toast.error("Content is too long. Maximum length is 2000 characters");
      return;
    }

    try {
      setIsLoading(true);
      setAnswer("");
      const response = await api.getStudyHelp(query, learningType);
      
      if (!response.success || !response.data?.answer) {
        throw new Error(response.error || "Failed to generate response");
      }

      const formattedAnswer = response.data.answer;
      setAnswer(formattedAnswer);
      saveToHistory(query, formattedAnswer);
      toast.success("Content processed!");
    } catch (error: any) {
      console.error("Learning error:", error);
      setError(error.message || "Something went wrong");
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { id: "science", label: "Science", topics: [
      "Explain quantum mechanics in simple terms",
      "How does photosynthesis work?",
      "Explain how the human immune system works"
    ]},
    { id: "history", label: "History", topics: [
      "Summarize the key events of the French Revolution",
      "Explain the significance of the Industrial Revolution",
      "What led to the fall of the Roman Empire?"
    ]},
    { id: "technology", label: "Technology", topics: [
      "Explain machine learning for beginners",
      "How does blockchain technology work?",
      "What is cloud computing?"
    ]},
    { id: "economics", label: "Economics", topics: [
      "What are the fundamental principles of economics?",
      "Explain supply and demand",
      "How do interest rates affect the economy?"
    ]}
  ];

  const learningTypes = [
    { value: "summary", label: "Summary" },
    { value: "flashcards", label: "Flashcards" },
    { value: "quiz", label: "Quiz" },
    { value: "mindmap", label: "Mind Map" },
    { value: "timeline", label: "Timeline" }
  ];

  const clearForm = () => {
    setQuery("");
    setAnswer("");
    setError(null);
    setActiveNote("");
  };

  const deleteHistoryItem = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem("learningHistory", JSON.stringify(updatedHistory));
    toast.success("Item deleted from history");
  };

  const saveNote = (id: string, note: string) => {
    const updatedHistory = history.map(item => 
      item.id === id ? { ...item, notes: note } : item
    );
    setHistory(updatedHistory);
    localStorage.setItem("learningHistory", JSON.stringify(updatedHistory));
    toast.success("Note saved!");
  };

  return (
    <div>
      <div className="h-full p-4 space-y-2">
        <Heading
          title="Learning Path"
          description="Your personal AI tutor to help you learn and understand any topic."
          icon={BookOpen}
          iconColor="text-violet-500"
          bgColor="bg-violet-500/10"
        />
        <div className="space-y-6">
          {/* Category Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Card
                key={category.id}
                className={cn(
                  "p-4 cursor-pointer hover:border-primary transition",
                  selectedCategory === category.id ? "border-primary" : ""
                )}
                onClick={() => setSelectedCategory(category.id)}
              >
                <h3 className="font-semibold mb-2">{category.label}</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {category.topics.map((topic, index) => (
                    <li
                      key={index}
                      className="hover:text-primary cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuery(topic);
                      }}
                    >
                      {topic}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="col-span-3">
                <Textarea
                  placeholder="Enter the content you want to learn about..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-40"
                />
              </div>
              <div className="space-y-4">
                <Select value={learningType} onValueChange={setLearningType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select learning type" />
                  </SelectTrigger>
                  <SelectContent>
                    {learningTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Learn
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full"
                >
                  <History className="w-4 h-4 mr-2" />
                  {showHistory ? "Hide History" : "Show History"}
                </Button>
                {query && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearForm}
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </form>

          {/* Results */}
          {answer && (
            <Card className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">Generated Content</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(answer);
                    toast.success("Copied to clipboard");
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{answer}</ReactMarkdown>
              </div>
            </Card>
          )}

          {/* History */}
          {showHistory && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Learning History</h3>
              {history.length === 0 ? (
                <p className="text-muted-foreground">No history yet</p>
              ) : (
                history.map((item) => (
                  <Card key={item.id} className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-medium">{item.query}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteHistoryItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{item.answer}</ReactMarkdown>
                    </div>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add notes..."
                        value={item.id === activeNote ? activeNote : item.notes || ""}
                        onChange={(e) => {
                          if (item.id === activeNote) {
                            setActiveNote(e.target.value);
                          }
                        }}
                        onFocus={() => setActiveNote(item.id)}
                      />
                      <Button
                        variant="outline"
                        onClick={() => saveNote(item.id, activeNote)}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
