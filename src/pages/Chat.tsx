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
import { useChat } from "@/hooks/useChat";

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { messages, isLoading, sendMessage, speechToText, createSession, loadSession, getSessions } = useChat();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isListeningForWakeWord, setIsListeningForWakeWord] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [hasStartedConversation, setHasStartedConversation] = useState(false);
  const [isWakeWordAnimating, setIsWakeWordAnimating] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isVoiceInputEnabled, setIsVoiceInputEnabled] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const wakeWordRecognitionRef = useRef<any>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  const handleSendMessage = async (messageText?: string, isVoiceInput = false) => {
    const message = messageText || inputMessage.trim();
    if (!message || isLoading) return;

    setHasStartedConversation(true);

    // Clear input immediately for better UX
    if (!isVoiceInput) {
      setInputMessage("");
    }

    try {
      // Send message using the chat hook
      const aiMessage = await sendMessage(message);

      // Read response aloud if voice mode is enabled and we got a response
      if (isVoiceMode && aiMessage) {
        setTimeout(() => {
          speakText(aiMessage.content, aiMessage.id);
        }, 500);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Connection Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
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
                        Hello there!
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
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? "justify-end" : "justify-start"} mb-4`}
                    >
                      <div
                        className={`max-w-[75%] flex items-start space-x-3 ${
                          message.role === 'user' ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                      >
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage 
                            src={message.role === 'user' ? "/placeholder.svg" : cooksyLogo} 
                            alt={message.role === 'user' ? "User" : "Cooksy"} 
                          />
                          <AvatarFallback className={message.role === 'user' ? "bg-primary text-primary-foreground" : "bg-orange-500 text-white"}>
                            {message.role === 'user' ? "U" : <ChefHat className="w-4 h-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <Card className={`${
                          message.role === 'user'
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border-border/50 shadow-sm"
                        }`}>
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                  {message.content}
                                </p>
                                <p className={`text-xs mt-2 ${
                                  message.role === 'user'
                                    ? "text-primary-foreground/70" 
                                    : "text-muted-foreground"
                                }`}>
                                  {message.timestamp.toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                              <div className="flex gap-1 ml-2">
                                {message.role === 'assistant' && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={`h-6 w-6 p-0 ${
                                        speakingMessageId === message.id
                                          ? "text-orange-500"
                                          : "text-muted-foreground hover:text-foreground"
                                      }`}
                                      onClick={() => {
                                        if (speakingMessageId === message.id) {
                                          stopSpeaking();
                                        } else {
                                          speakText(message.content, message.id);
                                        }
                                      }}
                                    >
                                      {speakingMessageId === message.id ? (
                                        <VolumeX className="h-3 w-3" />
                                      ) : (
                                        <Volume2 className="h-3 w-3" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                      onClick={() => {
                                        navigator.clipboard.writeText(message.content);
                                        setCopiedMessageId(message.id);
                                        setTimeout(() => setCopiedMessageId(null), 2000);
                                        toast({
                                          title: "Copied!",
                                          description: "Message copied to clipboard",
                                        });
                                      }}
                                    >
                                      {copiedMessageId === message.id ? (
                                        <Check className="h-3 w-3" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </Button>
                                  </>
                                )}
                              </div>
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
                              <span className="text-sm text-muted-foreground">Cooksy is thinking...</span>
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