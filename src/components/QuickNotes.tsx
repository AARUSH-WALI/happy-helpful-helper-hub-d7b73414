
import { useState, useEffect } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface Note {
  id: string;
  content: string;
  lastEdited: Date;
}

export const QuickNotes = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      content: "Remember to update the project timeline for the client presentation on Friday.",
      lastEdited: new Date(),
    },
  ]);
  const [activeNoteId, setActiveNoteId] = useState<string>("1");
  const [editableContent, setEditableContent] = useState<string>("");
  const { toast } = useToast();

  // When activeNoteId changes, update editableContent
  useEffect(() => {
    const activeNote = notes.find((note) => note.id === activeNoteId);
    if (activeNote) {
      setEditableContent(activeNote.content);
    }
  }, [activeNoteId, notes]);

  const handleSaveNote = () => {
    if (editableContent.trim() === "") return;

    setNotes(
      notes.map((note) =>
        note.id === activeNoteId
          ? { ...note, content: editableContent, lastEdited: new Date() }
          : note
      )
    );

    toast({
      title: "Note saved",
      description: "Your note has been saved successfully.",
    });
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      content: "",
      lastEdited: new Date(),
    };

    setNotes([...notes, newNote]);
    setActiveNoteId(newNote.id);
    setEditableContent("");
    
    toast({
      title: "New note created",
      description: "Start typing to add content to your note.",
    });
  };

  const handleDeleteNote = () => {
    if (notes.length <= 1) {
      toast({
        title: "Cannot delete",
        description: "You need at least one note.",
        variant: "destructive",
      });
      return;
    }

    const newNotes = notes.filter((note) => note.id !== activeNoteId);
    setNotes(newNotes);
    setActiveNoteId(newNotes[0].id);
    
    toast({
      title: "Note deleted",
      description: "The note has been deleted.",
      variant: "destructive",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="w-full shadow-sm border-gray-100">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Quick Notes</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-helper border-helper/30 hover:bg-helper/5"
          onClick={handleCreateNote}
        >
          <Plus size={16} className="mr-1" />
          New Note
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex h-[300px]">
          <div className="w-1/3 border-r border-gray-100 overflow-auto">
            {notes.map((note) => (
              <button
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={cn(
                  "w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors",
                  activeNoteId === note.id && "bg-blue-50"
                )}
              >
                <p className="text-sm truncate mb-1">
                  {note.content || "Empty note"}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(note.lastEdited)}
                </p>
              </button>
            ))}
          </div>
          <div className="w-2/3 p-4">
            <Textarea
              placeholder="Write your note here..."
              className="min-h-[220px] focus-visible:ring-helper"
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-4 bg-gray-50">
        <Button
          variant="outline"
          size="sm"
          className="text-red-500 border-red-200 hover:bg-red-50"
          onClick={handleDeleteNote}
        >
          <Trash2 size={16} className="mr-1" />
          Delete
        </Button>
        <Button
          size="sm"
          className="bg-helper hover:bg-helper-dark"
          onClick={handleSaveNote}
        >
          <Save size={16} className="mr-1" />
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
};
