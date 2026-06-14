import { Plus } from "lucide-react";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

interface TaskComposerProps {
  taskText: string;
  setTaskText: (v: string) => void;
  taskDue: string;
  setTaskDue: (v: string) => void;
  addTodo: () => void;
}

export function TaskComposer({
  taskText,
  setTaskText,
  taskDue,
  setTaskDue,
  addTodo,
}: TaskComposerProps) {
  return (
    <Card className="space-y-3">
      <Input
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && addTodo()}
        placeholder="What needs to be done?"
        aria-label="Task description"
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="flex flex-1 items-center gap-2 text-xs font-medium text-muted">
          <span className="whitespace-nowrap">Due date</span>
          <Input
            type="date"
            value={taskDue}
            onChange={(e) => setTaskDue(e.target.value)}
            aria-label="Due date"
          />
        </label>
        <Button onClick={addTodo} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" aria-hidden />
          Add task
        </Button>
      </div>
    </Card>
  );
}
