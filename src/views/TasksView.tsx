import { AnimatePresence } from "framer-motion";
import { CalendarCheck, CheckCircle2, Inbox, ListChecks, PartyPopper } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Todo, TaskFilter } from "../types";
import { TaskComposer } from "../components/tasks/TaskComposer";
import { TaskFilters } from "../components/tasks/TaskFilters";
import type { TaskCounts } from "../components/tasks/TaskFilters";
import { TaskCard } from "../components/tasks/TaskCard";
import { EmptyState } from "../components/ui/EmptyState";

interface TasksViewProps {
  filteredTodos: Todo[];
  counts: TaskCounts;
  taskFilter: TaskFilter;
  setTaskFilter: (f: TaskFilter) => void;
  taskText: string;
  setTaskText: (v: string) => void;
  taskDue: string;
  setTaskDue: (v: string) => void;
  addTodo: () => void;
  toggleTodo: (id: string | number, done: boolean) => void;
  deleteTodo: (id: string | number) => void;
}

const EMPTY: Record<TaskFilter, { icon: LucideIcon; title: string; description: string }> = {
  all: {
    icon: Inbox,
    title: "Your flow starts here",
    description: "Add your first task above and let Fluxa keep things moving.",
  },
  active: {
    icon: CheckCircle2,
    title: "All caught up!",
    description: "You have no pending tasks right now.",
  },
  today: {
    icon: CalendarCheck,
    title: "Nothing due today",
    description: "Enjoy the breathing room.",
  },
  overdue: {
    icon: PartyPopper,
    title: "No overdue tasks",
    description: "You're on top of everything. 🎉",
  },
  done: {
    icon: ListChecks,
    title: "No completed tasks yet",
    description: "Finished tasks will show up here.",
  },
};

export function TasksView({
  filteredTodos,
  counts,
  taskFilter,
  setTaskFilter,
  taskText,
  setTaskText,
  taskDue,
  setTaskDue,
  addTodo,
  toggleTodo,
  deleteTodo,
}: TasksViewProps) {
  const empty = EMPTY[taskFilter];

  return (
    <div className="space-y-4">
      <TaskComposer
        taskText={taskText}
        setTaskText={setTaskText}
        taskDue={taskDue}
        setTaskDue={setTaskDue}
        addTodo={addTodo}
      />

      <TaskFilters filter={taskFilter} setFilter={setTaskFilter} counts={counts} />

      {filteredTodos.length === 0 ? (
        <EmptyState icon={empty.icon} title={empty.title} description={empty.description} />
      ) : (
        <div className="flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {filteredTodos.map((t) => (
              <TaskCard
                key={t.id}
                todo={t}
                onToggle={() => toggleTodo(t.id, t.done)}
                onDelete={() => deleteTodo(t.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
