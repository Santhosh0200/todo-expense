import { useState, useEffect, useCallback } from "react";
import { SUPABASE_URL, SUPABASE_KEY } from "./lib/supabase";
import { AppShell } from "./components/AppShell";
import { DashboardView } from "./views/DashboardView";
import { TasksView } from "./views/TasksView";
import { ExpensesView } from "./views/ExpensesView";
import { isOverdue, isDueToday } from "./lib/dates";
import { CATEGORIES } from "./lib/constants";
import type { Todo, Expense, Toast, View, TaskFilter } from "./types";

interface ProxyResponse {
  status: number;
  data: any;
}

async function sbProxy(method: string, table: string, body: any, query: string = ""): Promise<ProxyResponse> {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = resp.status === 204 ? null : await resp.json().catch(() => null);
  return { status: resp.status, data };
}

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);

  const [taskText, setTaskText] = useState("");
  const [taskDue, setTaskDue] = useState("");
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");

  const [expName, setExpName] = useState("");
  const [expAmt, setExpAmt] = useState("");
  const [expCat, setExpCat] = useState("Food");
  const [expFilter, setExpFilter] = useState("All");

  const [budget, setBudget] = useState(localStorage.getItem("planner_budget") || "");
  const [budgetEdit, setBudgetEdit] = useState("");
  const [showBudgetInput, setShowBudgetInput] = useState(false);

  const showToast = (msg: string, type: "info" | "success" | "error" | "warning" = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tr, er] = await Promise.all([
        sbProxy("GET", "todos", "", "?select=*&order=created_at.desc"),
        sbProxy("GET", "expenses", "", "?select=*&order=date.desc"),
      ]);
      const t = Array.isArray(tr.data) ? tr.data : [];
      const e = Array.isArray(er.data) ? er.data : [];
      setTodos(t);
      setExpenses(e);
      const overdue = t.filter((x) => !x.done && isOverdue(x.due));
      const today = t.filter((x) => !x.done && isDueToday(x.due));
      if (overdue.length) showToast(`⚠️ ${overdue.length} overdue task(s)!`, "error");
      else if (today.length) showToast(`📅 ${today.length} task(s) due today`, "warning");
    } catch {
      showToast("Could not load data", "error");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addTodo = async () => {
    if (!taskText.trim()) return;
    showToast("Saving...", "info");
    try {
      const r = await sbProxy("POST", "todos", { text: taskText.trim(), done: false, due: taskDue || null });
      const row = Array.isArray(r.data) ? r.data[0] : r.data;
      if (row?.id) {
        setTodos((prev) => [row, ...prev]);
        setTaskText("");
        setTaskDue("");
        showToast("Task added ✓", "success");
      } else {
        showToast("Failed to add task", "error");
      }
    } catch {
      showToast("Failed to add task", "error");
    }
  };

  const toggleTodo = async (id: string | number, done: boolean) => {
    try {
      await sbProxy("PATCH", "todos", { done: !done }, `?id=eq.${id}`);
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !done } : t)));
      if (!done) showToast("Task completed! 🎉", "success");
    } catch {
      showToast("Failed to update", "error");
    }
  };

  const deleteTodo = async (id: string | number) => {
    try {
      await sbProxy("DELETE", "todos", null, `?id=eq.${id}`);
      setTodos((prev) => prev.filter((t) => t.id !== id));
      showToast("Deleted", "info");
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  const addExpense = async () => {
    const amt = parseFloat(expAmt);
    if (!expName.trim() || isNaN(amt) || amt <= 0) {
      showToast("Enter a valid name and amount", "warning");
      return;
    }
    showToast("Saving...", "info");
    try {
      const r = await sbProxy("POST", "expenses", {
        name: expName.trim(),
        amount: amt,
        category: expCat,
        date: new Date().toISOString(),
      });
      let row = r.data;
      if (Array.isArray(row)) row = row[0];
      if (row?.id) {
        setExpenses((prev) => [row, ...prev]);
        setExpName("");
        setExpAmt("");
        showToast("Expense logged ✓", "success");
      } else {
        const fallback = {
          id: Date.now().toString(),
          name: expName.trim(),
          amount: amt,
          category: expCat,
          date: new Date().toISOString(),
        };
        setExpenses((prev) => [fallback, ...prev]);
        setExpName("");
        setExpAmt("");
        showToast("Expense logged ✓", "success");
        loadData();
      }
    } catch {
      showToast("Failed to log expense", "error");
    }
  };

  const deleteExpense = async (id: string | number) => {
    try {
      await sbProxy("DELETE", "expenses", null, `?id=eq.${id}`);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      showToast("Deleted", "info");
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  const saveBudget = () => {
    const v = parseFloat(budgetEdit);
    if (!isNaN(v) && v > 0) {
      setBudget(v.toString());
      localStorage.setItem("planner_budget", v.toString());
      setShowBudgetInput(false);
      showToast("Budget saved ✓", "success");
    }
  };

  const filteredTodos = todos.filter((t) => {
    if (taskFilter === "active") return !t.done;
    if (taskFilter === "done") return t.done;
    if (taskFilter === "overdue") return !t.done && isOverdue(t.due);
    if (taskFilter === "today") return !t.done && isDueToday(t.due);
    return true;
  });

  const filteredExpenses = expFilter === "All" ? expenses : expenses.filter((e) => e.category === expFilter);
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const budgetNum = parseFloat(budget);
  const remaining = !isNaN(budgetNum) && budgetNum > 0 ? budgetNum - total : null;
  const pct = remaining !== null ? Math.min(100, (total / budgetNum) * 100) : 0;
  const barColor = pct > 90 ? "#E24B4A" : pct > 70 ? "#BA7517" : "#1D9E75";
  const catTotals = CATEGORIES.map((c) => ({
    c,
    v: expenses.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0),
  })).filter((x) => x.v > 0);
  const overdueCount = todos.filter((t) => !t.done && isOverdue(t.due)).length;
  const todayCount = todos.filter((t) => !t.done && isDueToday(t.due)).length;
  const activeCount = todos.filter((t) => !t.done).length;
  const doneCount = todos.filter((t) => t.done).length;

  const notice = (
    <>
      {overdueCount > 0 && (
        <div
          style={{
            background: "#fcebeb",
            border: "0.5px solid #f09595",
            borderRadius: "var(--border-radius-md)",
            padding: "10px 14px",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <i className="ti ti-alert-triangle" style={{ fontSize: 16, color: "#E24B4A" }} aria-hidden="true" />
          <span style={{ fontSize: 13, color: "#A32D2D", fontWeight: 500 }}>
            ⚠️ {overdueCount} task{overdueCount > 1 ? "s" : ""} overdue!
          </span>
        </div>
      )}
      {todayCount > 0 && overdueCount === 0 && (
        <div
          style={{
            background: "#faeeda",
            border: "0.5px solid #FAC775",
            borderRadius: "var(--border-radius-md)",
            padding: "10px 14px",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <i className="ti ti-clock" style={{ fontSize: 16, color: "#BA7517" }} aria-hidden="true" />
          <span style={{ fontSize: 13, color: "#854F0B", fontWeight: 500 }}>
            📅 {todayCount} task{todayCount > 1 ? "s" : ""} due today
          </span>
        </div>
      )}
    </>
  );

  return (
    <>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 18,
            right: 18,
            zIndex: 999,
            background:
              toast.type === "error"
                ? "#E24B4A"
                : toast.type === "success"
                  ? "#1D9E75"
                  : toast.type === "warning"
                    ? "#BA7517"
                    : "#378ADD",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: "var(--border-radius-md)",
            fontSize: 13,
            fontWeight: 500,
            maxWidth: 280,
          }}
        >
          {toast.msg}
        </div>
      )}

      <AppShell view={view} onNavigate={setView} onRefresh={loadData} notice={notice}>
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem 0",
              color: "var(--color-text-tertiary)",
              fontSize: 14,
            }}
          >
            <i
              className="ti ti-loader"
              style={{ fontSize: 24, display: "block", marginBottom: 8 }}
              aria-hidden="true"
            />{" "}
            Connecting to database...
          </div>
        ) : view === "dashboard" ? (
          <DashboardView onNavigate={setView} />
        ) : view === "tasks" ? (
          <TasksView
            filteredTodos={filteredTodos}
            counts={{
              all: todos.length,
              active: activeCount,
              today: todayCount,
              overdue: overdueCount,
              done: doneCount,
            }}
            taskFilter={taskFilter}
            setTaskFilter={setTaskFilter}
            taskText={taskText}
            setTaskText={setTaskText}
            taskDue={taskDue}
            setTaskDue={setTaskDue}
            addTodo={addTodo}
            toggleTodo={toggleTodo}
            deleteTodo={deleteTodo}
          />
        ) : (
          <ExpensesView
            filteredExpenses={filteredExpenses}
            total={total}
            budget={budget}
            showBudgetInput={showBudgetInput}
            setShowBudgetInput={setShowBudgetInput}
            budgetEdit={budgetEdit}
            setBudgetEdit={setBudgetEdit}
            saveBudget={saveBudget}
            remaining={remaining}
            pct={pct}
            barColor={barColor}
            catTotals={catTotals}
            expName={expName}
            setExpName={setExpName}
            expAmt={expAmt}
            setExpAmt={setExpAmt}
            expCat={expCat}
            setExpCat={setExpCat}
            addExpense={addExpense}
            expFilter={expFilter}
            setExpFilter={setExpFilter}
            deleteExpense={deleteExpense}
          />
        )}
      </AppShell>
    </>
  );
}
