export interface Todo {
  id: string | number;
  text: string;
  done: boolean;
  due?: string;
  created_at: string;
}

export interface Expense {
  id: string | number;
  name: string;
  amount: number;
  category: string;
  date: string;
}

export interface Toast {
  msg: string;
  type: "info" | "success" | "error" | "warning";
}

export type View = "dashboard" | "tasks" | "expenses";

export type TaskFilter = "all" | "active" | "done" | "today" | "overdue";
