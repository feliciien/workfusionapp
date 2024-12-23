"use client";

import { useState, useEffect } from "react";
import { ToolPage } from "@/components/tool-page";
import { tools } from "../dashboard/config";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import api from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Loader2, Copy, RefreshCw, BookOpen, History, Save, Trash2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";

interface StudyHistory {
  id: string;
  query: string;
  answer: string;
  timestamp: number;
  notes?: string;
}

interface StudyResponse {
  answer: string;
}

export default function StudyPage() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<StudyHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeNote, setActiveNote] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const tool = tools.find(t => t.label === "Study Assistant")!;

  useEffect(() => {
    const savedHistory = localStorage.getItem("studyHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (query: string, answer: string) => {
    const newHistory: StudyHistory = {
      id: Date.now().toString(),
      query,
      answer,
      timestamp: Date.now(),
    };
    const updatedHistory = [newHistory, ...history].slice(0, 10); // Keep last 10 items
    setHistory(updatedHistory);
    localStorage.setItem("studyHistory", JSON.stringify(updatedHistory));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    if (!query.trim()) {
      toast.error("Please enter a question");
      return;
    }

    if (query.length > 1000) {
      toast.error("Question is too long. Maximum length is 1000 characters");
      return;
    }

    try {
      setIsLoading(true);
      setAnswer("");
      const response = await api.getStudyHelp(query);
      
      if (!response.success || !response.data?.answer) {
        throw new Error(response.error || "Failed to generate response");
      }

      const formattedAnswer = response.data.answer;
      setAnswer(formattedAnswer);
      saveToHistory(query, formattedAnswer);
      toast.success("Answer generated!");
    } catch (error: any) {
      console.error("Study error:", error);
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

  const clearForm = () => {
    setQuery("");
    setAnswer("");
    setError(null);
    setActiveNote("");
  };

  const deleteHistoryItem = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem("studyHistory", JSON.stringify(updatedHistory));
    toast.success("Item deleted from history");
  };

  const saveNote = (id: string, note: string) => {
    const updatedHistory = history.map(item => 
      item.id === id ? { ...item, notes: note } : item
    );
    setHistory(updatedHistory);
    localStorage.setItem("studyHistory", JSON.stringify(updatedHistory));
    toast.success("Note saved!");
  };

  return (
    <ToolPage tool={tool} isLoading={isLoading}>
      <div className="space-y-6">
        {/* Category Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className={cn(
                "text-sm h-auto whitespace-normal p-2",
                selectedCategory === category.id && "bg-primary text-primary-foreground"
              )}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Topic Suggestions */}
        {selectedCategory && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {categories.find(c => c.id === selectedCategory)?.topics.map((topic) => (
              <Button
                key={topic}
                variant="outline"
                className="text-xs md:text-sm text-left h-auto whitespace-normal p-2"
                onClick={() => {
                  setQuery(topic);
                  setError(null);
                }}
                disabled={isLoading}
              >
                {topic}
              </Button>
            ))}
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">What would you like to learn about?</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2"
                >
                  <History className="w-4 h-4" />
                  {showHistory ? "Hide History" : "Show History"}
                </Button>
              </div>
              <Textarea
                placeholder="Ask any question or topic you'd like to understand better..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setError(null);
                }}
                className="h-24"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Get Answer
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={clearForm}
                disabled={isLoading || (!query && !answer)}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </form>

        {/* Answer Display */}
        {answer && (
          <Card className="p-4 space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">Answer</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(answer);
                  toast.success("Copied to clipboard!");
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{answer}</ReactMarkdown>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Notes</label>
              <Textarea
                placeholder="Add your notes here..."
                value={activeNote}
                onChange={(e) => setActiveNote(e.target.value)}
                className="h-24"
              />
              <Button
                onClick={() => {
                  if (history[0]) {
                    saveNote(history[0].id, activeNote);
                  }
                }}
                disabled={!activeNote}
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Notes
              </Button>
            </div>
          </Card>
        )}

        {/* Study History */}
        {showHistory && history.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Study History</h3>
            <div className="space-y-4">
              {history.map((item) => (
                <Card key={item.id} className="p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{item.query}</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setQuery(item.query);
                          setAnswer(item.answer);
                          setActiveNote(item.notes || "");
                          setShowHistory(false);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <BookOpen className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteHistoryItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {item.notes && (
                    <div className="bg-muted p-2 rounded-md">
                      <p className="text-sm">{item.notes}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  );
}
