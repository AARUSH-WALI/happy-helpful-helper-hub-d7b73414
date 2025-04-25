
import { useState } from "react";
import { 
  CheckCircle, 
  Circle, 
  Plus, 
  Trash2, 
  Filter, 
  MoreVertical 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "Complete project dashboard", completed: false },
    { id: "2", title: "Review analytics report", completed: false },
    { id: "3", title: "Schedule team meeting", completed: true },
  ]);
  
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const { toast } = useToast();

  const addTask = () => {
    if (!newTask.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.trim(),
      completed: false
    };
    
    setTasks([...tasks, task]);
    setNewTask("");
    
    toast({
      title: "Task added",
      description: `"${newTask}" has been added to your tasks.`,
    });
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find(task => task.id === id);
    setTasks(tasks.filter(task => task.id !== id));
    
    toast({
      title: "Task deleted",
      description: `"${taskToDelete?.title}" has been removed from your tasks.`,
      variant: "destructive",
    });
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const completedCount = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <Card className="w-full shadow-sm border-gray-100">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Tasks</CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 flex items-center gap-1"
            onClick={() => setFilter("all")}
          >
            <Filter size={14} />
            <span className={cn(filter === "all" ? "text-helper" : "")}>All</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 flex items-center gap-1"
            onClick={() => setFilter("active")}
          >
            <span className={cn(filter === "active" ? "text-helper" : "")}>Active</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 flex items-center gap-1"
            onClick={() => setFilter("completed")}
          >
            <span className={cn(filter === "completed" ? "text-helper" : "")}>Completed</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-6">
        <div className="flex items-center gap-2 mb-4">
          <Input 
            placeholder="Add a new task..." 
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            className="flex-1 focus-visible:ring-helper"
          />
          <Button onClick={addTask} className="bg-helper hover:bg-helper-dark">
            <Plus size={18} />
            <span className="ml-1">Add</span>
          </Button>
        </div>

        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              {filter === "all" 
                ? "No tasks yet. Add your first task above!" 
                : filter === "active" 
                  ? "No active tasks. All done?" 
                  : "No completed tasks yet."}
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-center justify-between py-2.5 px-3 rounded-md",
                  task.completed ? "bg-gray-50" : "bg-white hover:bg-gray-50",
                  "border border-gray-100 group transition-all"
                )}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "flex-shrink-0 h-5 w-5 rounded-full border transition-colors",
                      task.completed 
                        ? "border-helper text-helper hover:bg-helper-light/10" 
                        : "border-gray-300 text-transparent hover:border-helper"
                    )}
                  >
                    {task.completed ? (
                      <CheckCircle className="h-5 w-5 text-helper" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300" />
                    )}
                  </button>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      task.completed && "line-through text-gray-500"
                    )}
                  >
                    {task.title}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteTask(task.id)}
                >
                  <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between px-6 py-3 bg-gray-50 text-sm text-gray-500">
        <div className="flex items-center gap-3">
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-helper" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span>{progress}% complete</span>
        </div>
        <Badge variant="outline" className="text-gray-500">
          {completedCount}/{totalTasks} completed
        </Badge>
      </CardFooter>
    </Card>
  );
};
