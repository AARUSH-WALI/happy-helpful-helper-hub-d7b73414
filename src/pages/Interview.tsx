
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

export default function Interview() {
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    user: '',
    date: new Date()
  });

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.description || !newEvent.user) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all fields to create an event",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Event Created",
      description: `Your event "${newEvent.title}" has been scheduled for ${format(selectedDate, 'PPP')}`
    });
    
    setShowEventDialog(false);
    setNewEvent({ title: '', description: '', user: '', date: new Date() });
  };

  return (
    <div className="page-container">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden max-w-lg mx-auto">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold">Event Calendar</h1>
        </div>
        
        <div className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border w-full"
          />
          
          <div className="mt-4">
            <Button 
              onClick={() => setShowEventDialog(true)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>
      </div>
      
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Event for {format(selectedDate, 'PPP')}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Input
                placeholder="Event Title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>
            
            <div>
              <Textarea
                placeholder="Event Description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
            
            <div>
              <Select
                value={newEvent.user}
                onValueChange={(value) => setNewEvent({ ...newEvent, user: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select User" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ayushthakur1412@gmail.com">
                    ayushthakur1412@gmail.com
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateEvent}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Create Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
