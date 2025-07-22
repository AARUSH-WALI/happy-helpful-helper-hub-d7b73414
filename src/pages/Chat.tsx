import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Settings, LogOut, Menu, Send, Mic, MicOff, Sparkles, ChefHat, Coffee, Volume2, VolumeX, Copy, Check } from "lucide-react";
import cooksyLogo from "@/assets/cooksy-logo.png";
import { AppSidebar } from "@/components/AppSidebar";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListeningForWakeWord, setIsListeningForWakeWord] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentRecipeStep, setCurrentRecipeStep] = useState(0);
  const [isInRecipeMode, setIsInRecipeMode] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [hasStartedConversation, setHasStartedConversation] = useState(false);
  const [isWakeWordAnimating, setIsWakeWordAnimating] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isVoiceInputEnabled, setIsVoiceInputEnabled] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const wakeWordRecognitionRef = useRef<any>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const conversationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handleLogout = () => {
    navigate("/");
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-enable voice mode and wake word detection on component mount
  useEffect(() => {
    // Start wake word listening immediately when component mounts
    const timer = setTimeout(() => {
      if (isVoiceMode) {
        startWakeWordListening();
      }
    }, 1000); // Small delay to ensure proper initialization
    
    return () => clearTimeout(timer);
  }, [isVoiceMode]);

  const isCookingRelated = (message: string): boolean => {
    const cookingKeywords = [
      'recipe', 'cook', 'cooking', 'kitchen', 'ingredient', 'food', 'dish', 'meal',
      'bake', 'baking', 'fry', 'boil', 'roast', 'grill', 'steam', 'sauté',
      'spice', 'seasoning', 'flavor', 'taste', 'chef', 'cuisine', 'menu',
      'breakfast', 'lunch', 'dinner', 'snack', 'appetizer', 'dessert',
      'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'protein', 'carbs',
      'nutrition', 'calories', 'healthy', 'diet', 'eat', 'eating', 'prepare'
    ];
    
    return cookingKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  };

  const speakText = (text: string, messageId: string) => {
    try {
      // Stop any currently speaking message
      if (speechSynthesisRef.current) {
        speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Try to use a female voice
      const voices = speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.includes('female') || 
        voice.name.includes('Female') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Karen') ||
        voice.name.includes('Victoria')
      ) || voices[0];
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpeakingMessageId(messageId);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        
        // Restart wake word listening after speaking ends
        if (isVoiceMode && !isRecording) {
          setTimeout(() => {
            if (wakeWordRecognitionRef.current) {
              startWakeWordListening();
            }
          }, 500);
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        toast({
          title: "Speech Error",
          description: "Failed to read the message aloud.",
          variant: "destructive",
        });
      };

      speechSynthesisRef.current = utterance;
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error with speech synthesis:', error);
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeakingMessageId(null);
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      
      // Main speech recognition
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');

        // Clear existing timeout
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
        }

        // Set timeout to stop recording after 2-3 seconds of silence
        speechTimeoutRef.current = setTimeout(() => {
          if (recognitionRef.current && isRecording) {
            recognitionRef.current.stop();
          }
        }, 2500);

        setInputMessage(transcript);
        
        if (event.results[event.results.length - 1].isFinal) {
          setIsRecording(false);
          if (transcript.trim()) {
            // For voice mode, clear input and send message
            if (isVoiceMode) {
              setInputMessage(""); // Clear input for voice mode
              handleSendMessage(transcript.trim(), true); // true flag for voice mode
            } else {
              // For regular mode, show in input and let user send manually
              setInputMessage(transcript.trim());
            }
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
        }
        
        // Always restart wake word listening after recording ends if in voice mode
        if (isVoiceMode && !isSpeaking) {
          setTimeout(() => {
            if (wakeWordRecognitionRef.current) {
              startWakeWordListening();
            }
          }, 500);
        }
      };

      // Wake word recognition
      wakeWordRecognitionRef.current = new SpeechRecognition();
      wakeWordRecognitionRef.current.continuous = true;
      wakeWordRecognitionRef.current.interimResults = false;
      wakeWordRecognitionRef.current.lang = 'en-US';

      wakeWordRecognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log('Wake word listening:', transcript);
        
        // More flexible wake word detection
        if (transcript.includes('cooksy') || transcript.includes('cookie') || 
            transcript.includes('cooks') || transcript.includes('cooky') ||
            transcript.includes('cooking') || transcript.includes('kukshi') || transcript.includes('kuksi') || transcript.includes('kuki') || transcript.includes('kuks')) {
          console.log('Wake word detected!');
          
          // Show Siri-like animation
          setIsWakeWordAnimating(true);
          setTimeout(() => setIsWakeWordAnimating(false), 3000);
          
          if (isSpeaking) {
            stopSpeaking();
          }
          
          // Stop wake word listening temporarily and start recording
          if (wakeWordRecognitionRef.current) {
            wakeWordRecognitionRef.current.stop();
          }
          
          setTimeout(() => {
            setIsRecording(true);
            if (recognitionRef.current) {
              recognitionRef.current.start();
            }
          }, 500);
          
          toast({
            title: "🎙️ Wake word detected!",
            description: "I'm listening... How can I help you cook today?",
          });
        }
      };

      wakeWordRecognitionRef.current.onerror = (event: any) => {
        console.error('Wake word recognition error:', event.error);
        if (isListeningForWakeWord) {
          setTimeout(() => {
            if (wakeWordRecognitionRef.current && isListeningForWakeWord) {
              try {
                wakeWordRecognitionRef.current.start();
              } catch (error) {
                console.error('Error restarting wake word recognition:', error);
              }
            }
          }, 1000);
        }
      };

      wakeWordRecognitionRef.current.onend = () => {
        // Always restart wake word listening if in voice mode and not currently recording
        if (isVoiceMode && !isRecording && !isSpeaking) {
          setTimeout(() => {
            if (wakeWordRecognitionRef.current && isVoiceMode && !isRecording) {
              try {
                setIsListeningForWakeWord(true);
                wakeWordRecognitionRef.current.start();
                console.log('Wake word listening restarted successfully');
              } catch (error) {
                console.error('Error restarting wake word recognition:', error);
                // Retry after a longer delay
                setTimeout(() => {
                  if (wakeWordRecognitionRef.current && isVoiceMode) {
                    try {
                      setIsListeningForWakeWord(true);
                      wakeWordRecognitionRef.current.start();
                    } catch (retryError) {
                      console.error('Retry failed:', retryError);
                    }
                  }
                }, 2000);
              }
            }
          }, 500);
        }
      };
    }

    return () => {
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
      if (conversationTimeoutRef.current) {
        clearTimeout(conversationTimeoutRef.current);
      }
    };
  }, [isRecording, isVoiceMode, isListeningForWakeWord, isSpeaking]);

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      setIsRecording(false);
      recognitionRef.current.stop();
    }
  };

  const startWakeWordListening = () => {
    if (wakeWordRecognitionRef.current && !isListeningForWakeWord) {
      setIsListeningForWakeWord(true);
      try {
        wakeWordRecognitionRef.current.start();
        console.log('Wake word listening started successfully');
        if (hasStartedConversation) {
          toast({
            title: "Wake word activated",
            description: "Say 'Cooksy' to start voice conversation",
          });
        }
      } catch (error) {
        console.error('Error starting wake word recognition:', error);
        setIsListeningForWakeWord(false);
      }
    }
  };

  const stopWakeWordListening = () => {
    if (wakeWordRecognitionRef.current && isListeningForWakeWord) {
      setIsListeningForWakeWord(false);
      try {
        wakeWordRecognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping wake word recognition:', error);
      }
    }
  };

  const toggleVoiceMode = () => {
    if (isVoiceMode) {
      setIsVoiceMode(false);
      stopWakeWordListening();
      if (isSpeaking) {
        stopSpeaking();
      }
      if (isRecording) {
        stopRecording();
      }
      toast({
        title: "Voice mode disabled",
        description: "Voice conversation mode is now off",
      });
    } else {
      setIsVoiceMode(true);
      startWakeWordListening();
    }
  };

  const getGeminiResponse = async (userMessage: string): Promise<string> => {
    try {
      // Check if the message is cooking-related
      if (!isCookingRelated(userMessage)) {
        return "I'm Cooksy, your cooking assistant! I'm here to help you with recipes, cooking techniques, meal planning, and kitchen tips. Could you ask me something related to cooking or food?";
      }

      // Build conversation context from recent messages
      const recentMessages = messages.slice(-6); // Last 6 messages for context
      const conversationContext = recentMessages
        .map(msg => `${msg.isUser ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const enhancedPrompt = `You are Cooksy AI, an expert culinary assistant and professional chef with extensive knowledge in:

🍳 COOKING EXPERTISE:
- International cuisines and traditional recipes
- Advanced cooking techniques and food science
- Ingredient substitutions and dietary adaptations
- Kitchen equipment recommendations and usage
- Food safety and proper storage methods
- Meal planning and nutrition optimization
- Baking science and pastry techniques
- Wine pairing and beverage recommendations

🎯 RESPONSE STYLE:
- Provide step-by-step instructions with precise measurements
- Include cooking times, temperatures, and techniques
- Suggest ingredient alternatives for dietary restrictions
- Offer helpful tips and pro chef secrets
- Be encouraging and enthusiastic about cooking
- Format recipes clearly with ingredients and instructions
- Include nutritional benefits when relevant
${isVoiceMode ? `- Keep responses conversational and suitable for voice interaction
- For step-by-step recipes, number each step clearly and keep steps concise
- End with questions like "Ready for the next step?" or "Any questions about this step?"` : ''}

📝 CONVERSATION CONTEXT:
${conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ''}

Current question: ${userMessage}

Please provide a detailed, helpful, and engaging response focused on cooking and culinary arts.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDhUzf3y6JkGexIbmY_jwhpTu6BA3FbDYs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: enhancedPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 50,
            topP: 0.9,
            maxOutputTokens: 2048,
            candidateCount: 1,
            stopSequences: ["User:", "Assistant:"]
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        if (response.status === 503) {
          return "🔄 The AI service is currently experiencing high demand. Please try again in a few moments, or feel free to ask me another cooking question!";
        } else if (response.status === 429) {
          return "⏱️ We've hit the rate limit. Please wait a moment before sending another message.";
        } else if (response.status === 400) {
          return "❌ There was an issue with your request. Please try rephrasing your question.";
        } else {
          console.error('API Error:', errorData);
          return "🔧 I'm experiencing technical difficulties. Please try again in a moment, and I'll do my best to help with your cooking questions!";
        }
      }

      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || "I'm sorry, I couldn't generate a response. Please try asking your cooking question again.";
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return "🌐 Unable to connect to the AI service. Please check your internet connection and try again.";
      }
      return "🤖 I'm having trouble processing your request right now. Please try again in a moment, and I'll be happy to help with your cooking questions!";
    }
  };

  const handleSendMessage = async (messageText?: string, isVoiceInput = false) => {
    const messageToSend = messageText || inputMessage.trim();
    if (!messageToSend) return;

    // Mark conversation as started
    setHasStartedConversation(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageToSend,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Get AI response from Gemini
    try {
      const aiResponseContent = await getGeminiResponse(messageToSend);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponseContent,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);

      // For voice mode, auto-speak the response
      if (isVoiceMode && isVoiceInput) {
        speakText(aiResponseContent, aiResponse.id);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedPrompts = [
    "Give me a quick dinner recipe",
    "How do I make perfect pasta?",
    "Suggest a healthy breakfast",
    "What can I cook with chicken?",
  ];

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      });
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-gradient-warm">
        {/* Fixed Header */}
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-background/95 backdrop-blur-md border-b border-border/50">
          {/* Left Section with Sidebar Toggle and Logo */}
          <div className="flex items-center space-x-4">
            <SidebarTrigger className="hover:bg-accent/50 hover:text-primary transition-all duration-200 p-2 rounded-md">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <div className="flex items-center space-x-3">
              <img 
                src={cooksyLogo} 
                alt="Cooksy Logo" 
                className="h-10 w-10 rounded-lg shadow-card"
              />
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-foreground bg-gradient-hero bg-clip-text text-transparent">
                  Cooksy AI
                </h1>
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              </div>
            </div>
          </div>

          {/* Right Section - Account */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle 
              onChange={(isDark) => setIsDarkMode(isDark)}
              className="mr-2"
            />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:shadow-glow transition-all duration-300">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback className="bg-gradient-hero text-primary-foreground font-semibold">
                      JD
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-background/95 backdrop-blur-md border-border/50 shadow-glow" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">john.doe@gmail.com</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Welcome back!
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-accent/50">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-accent/50 text-destructive focus:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Layout with Sidebar */}
        <div className="flex w-full">
          <AppSidebar />
          
          {/* Chat Interface */}
          <main className="flex-1 pt-20 flex flex-col h-screen">
            {/* Voice Mode Status */}
            {isVoiceMode && (
              <div className="px-6 py-2 bg-gradient-hero/10 border-b border-border/50">
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <Volume2 className="w-4 h-4 text-primary" />
                  <span className="text-primary font-medium">
                    {isListeningForWakeWord ? "Say 'Cooksy' to start" : 
                     isRecording ? "Listening..." : 
                     isSpeaking ? "Speaking..." : "Voice mode active"}
                  </span>
                  {(isRecording || isSpeaking) && (
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            )}

            {/* Welcome Screen - Center Layout */}
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center px-4 transition-all duration-1000 ease-out">
                <div className="text-center space-y-8 max-w-2xl animate-fade-in">
                  {/* Welcome Header */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-3">
                      <img 
                        src={cooksyLogo} 
                        alt="Cooksy Logo" 
                        className="h-16 w-16 rounded-2xl shadow-glow animate-pulse"
                      />
                      <div>
                        <h1 className="text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                          Cooksy AI
                        </h1>
                        <div className="flex items-center justify-center space-x-2 mt-2">
                          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                          <span className="text-lg text-muted-foreground">Your AI Cooking Assistant</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Personalized Greeting */}
                    <div className="space-y-2">
                      <h2 className="text-3xl font-semibold text-primary">
                        Hello, Saksham Gupta
                      </h2>
                      <p className="text-lg text-muted-foreground">
                        What can I help you cook today?
                      </p>
                    </div>
                  </div>

                  {/* Suggested Prompts */}
                  <div className="space-y-6">
                    <p className="text-muted-foreground">Try asking me about:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {suggestedPrompts.map((prompt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="text-left justify-start h-auto p-6 border-border/30 hover:bg-accent/30 hover:border-primary/30 transition-all duration-300 hover:scale-105"
                          onClick={() => {
                            setInputMessage(prompt);
                            handleSendMessage(prompt);
                          }}
                        >
                          <Coffee className="h-5 w-5 mr-3 text-primary" />
                          <span className="text-base">{prompt}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Voice Mode Status */}
                  {isVoiceMode && (
                    <div className="bg-gradient-hero/10 border border-primary/20 rounded-xl p-6 space-y-3">
                      <div className="flex items-center justify-center space-x-2">
                        <Volume2 className="w-5 h-5 text-primary" />
                        <span className="text-primary font-semibold">Voice Mode Active</span>
                        {(isRecording || isSpeaking) && (
                          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isListeningForWakeWord ? "Say 'Cooksy' to start voice conversation" : 
                         isRecording ? "I'm listening..." : 
                         isSpeaking ? "Speaking..." : "Ready for voice commands"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chat Messages - Bottom Layout */}
            {messages.length > 0 && (
              <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 transition-all duration-1000 ease-out">
                
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto space-y-6 py-6">
                  {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? "justify-end" : "justify-start"} animate-fade-in group`}
                  >
                    <div className={`flex items-start space-x-3 max-w-3xl ${message.isUser ? "flex-row-reverse space-x-reverse" : ""} relative`}>
                      <Avatar className="h-8 w-8 mt-1">
                        {message.isUser ? (
                          <AvatarFallback className="bg-gradient-hero text-primary-foreground text-sm font-semibold">
                            JD
                          </AvatarFallback>
                        ) : (
                          <AvatarFallback className="bg-gradient-accent text-accent-foreground">
                            <ChefHat className="h-4 w-4" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <Card className={`${
                        message.isUser 
                          ? "bg-gradient-hero text-primary-foreground border-primary/20" 
                          : "bg-background/90 backdrop-blur-md border-border/30 shadow-card hover:shadow-glow"
                      } transition-all duration-300 relative`}>
                        <CardContent className="p-4">
                          <div className={`${!message.isUser ? 'prose prose-sm max-w-none' : ''}`}>
                            {!message.isUser ? (
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2 mb-3">
                                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                                    Cooksy AI
                                  </span>
                                </div>
                                 <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                                   {message.content.replace(/\*\*/g, '').replace(/^\s+/gm, '').split('\n').map((line, index) => {
                                     // Remove any extra spaces and clean up formatting
                                     const cleanLine = line.trim().replace(/^\*+\s*/, '').replace(/^\#+\s*/, '');
                                     
                                     if (!cleanLine) {
                                       return <br key={index} />;
                                     }
                                     
                                     // Recipe titles or section headers
                                     if (cleanLine.includes('RECIPE') || cleanLine.includes('INGREDIENTS') || cleanLine.includes('INSTRUCTIONS')) {
                                       return (
                                         <h3 key={index} className="font-bold text-primary mt-4 mb-2 text-base">
                                           {cleanLine}
                                         </h3>
                                       );
                                     }
                                     
                                     // Special sections with emojis
                                     if (cleanLine.match(/^[🍳🎯📝🥘🔥⏰]/)) {
                                       return (
                                         <div key={index} className="bg-accent/20 p-3 rounded-lg my-3 border-l-4 border-primary">
                                           <p className="font-medium text-foreground">{cleanLine}</p>
                                         </div>
                                       );
                                     }
                                     
                                     // List items
                                     if (cleanLine.match(/^[-•]\s/)) {
                                       return (
                                         <li key={index} className="ml-4 text-foreground my-1">
                                           {cleanLine.replace(/^[-•]\s*/, '')}
                                         </li>
                                       );
                                     }
                                     
                                     // Numbered list items
                                     if (cleanLine.match(/^\d+\.\s/)) {
                                       return (
                                         <div key={index} className="flex items-start space-x-2 my-2">
                                           <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                             {cleanLine.match(/^(\d+)/)?.[1]}
                                           </span>
                                           <p className="text-foreground flex-1">
                                             {cleanLine.replace(/^\d+\.\s*/, '')}
                                           </p>
                                         </div>
                                       );
                                     }
                                     
                                     // Regular paragraphs
                                     return (
                                       <p key={index} className="text-foreground my-2 leading-relaxed">
                                         {cleanLine}
                                       </p>
                                     );
                                   })}
                                  </div>
                                  
                                  {/* Read Aloud Button for AI messages */}
                                  <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-border/20">
                                    <Button
                                      onClick={() => speakText(message.content, message.id)}
                                      disabled={isSpeaking && speakingMessageId === message.id}
                                      size="sm"
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      <Volume2 className="w-3 h-3 mr-1" />
                                      {isSpeaking && speakingMessageId === message.id ? 'Speaking...' : 'Read Aloud'}
                                    </Button>
                                    
                                    {isSpeaking && speakingMessageId === message.id && (
                                      <Button
                                        onClick={stopSpeaking}
                                        size="sm"
                                        variant="destructive"
                                        className="text-xs"
                                      >
                                        <VolumeX className="w-3 h-3 mr-1" />
                                        Stop
                                      </Button>
                                    )}
                                  </div>
                               </div>
                             ) : (
                               <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                 {message.content}
                               </p>
                             )}
                           </div>
                          <div className="flex items-center justify-between mt-3">
                            <p className={`text-xs ${
                              message.isUser ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}>
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <button
                              onClick={() => copyToClipboard(message.content, message.id)}
                              className={`opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-md hover:bg-accent/50 ${
                                message.isUser ? 'text-primary-foreground/70 hover:text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                              }`}
                              title="Copy message"
                            >
                              {copiedMessageId === message.id ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
                 
                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="flex items-start space-x-3 max-w-3xl">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-gradient-accent text-accent-foreground">
                          <ChefHat className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <Card className="bg-background/80 backdrop-blur-md border-border/30 shadow-card">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-sm text-muted-foreground">AI is thinking...</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
                </div>

                {/* Input Area for Chat Messages */}
                <div className="border-t border-border/30 bg-background/50 backdrop-blur-md p-4">
                  <div className="flex items-end space-x-3 max-w-4xl mx-auto">
                    <div className="flex-1 relative">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={isVoiceMode ? "Voice mode active - say 'Cooksy' or type here..." : "Ask me about cooking, recipes, or food..."}
                        className="bg-background/80 border-border/30 focus:border-primary/50 transition-all duration-300 min-h-[48px] text-base"
                        disabled={isLoading}
                      />
                    </div>
                    
                    {/* Voice Input Toggle Button */}
                    <Button
                      onClick={() => setIsVoiceInputEnabled(!isVoiceInputEnabled)}
                      variant={isVoiceInputEnabled ? "default" : "outline"}
                      size="lg"
                      className="px-3"
                      title={isVoiceInputEnabled ? "Disable Voice Input" : "Enable Voice Input"}
                    >
                      {isVoiceInputEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </Button>
                    
                    {/* Manual Voice Input Button */}
                    {isVoiceInputEnabled && (
                      <Button
                        onClick={startRecording}
                        disabled={isRecording || isLoading}
                        variant={isRecording ? "default" : "outline"}
                        size="lg"
                        className="px-3"
                        title="Voice Input"
                      >
                        {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={!inputMessage.trim() || isLoading}
                      size="lg"
                      className="px-6 bg-gradient-hero hover:shadow-glow transition-all duration-300"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Siri-like Animation Overlay */}
            {isWakeWordAnimating && (
              <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-background/90 backdrop-blur-md border border-primary/30 rounded-2xl p-8 space-y-4 shadow-glow animate-scale-in">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center">
                        <Mic className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <div className="absolute inset-0 w-16 h-16 bg-primary/30 rounded-full animate-ping"></div>
                      <div className="absolute inset-2 w-12 h-12 bg-primary/20 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-primary">Listening...</h3>
                    <p className="text-muted-foreground">How can I help you cook today?</p>
                  </div>
                </div>
              </div>
            )}


            {/* Fixed Input Area for Welcome Screen */}
            {messages.length === 0 && (
              <div className="border-t border-border/30 bg-background/50 backdrop-blur-md p-4">
                <div className="flex items-end space-x-3 max-w-2xl mx-auto">
                  <div className="flex-1 relative">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask anything..."
                      className="bg-background/80 border-border/30 focus:border-primary/50 transition-all duration-300 min-h-[56px] text-lg rounded-full px-6"
                      disabled={isLoading}
                    />
                  </div>
                  
                  {/* Speech-to-Text Button for Welcome Screen */}
                  {isVoiceInputEnabled && (
                    <Button
                      onClick={startRecording}
                      disabled={isRecording || isLoading}
                      variant={isRecording ? "default" : "outline"}
                      size="lg"
                      className="px-3 rounded-full h-[56px]"
                      title="Voice Input"
                    >
                      {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                    size="lg"
                    className="px-6 bg-gradient-hero hover:shadow-glow transition-all duration-300 rounded-full h-[56px]"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Chat;
