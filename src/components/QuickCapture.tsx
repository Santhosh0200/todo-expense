import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Check, ListChecks, Pencil, RotateCcw, Sparkles, Wallet } from "lucide-react";
import { Card } from "./ui/Card";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Button } from "./ui/Button";
import { cn } from "../lib/cn";
import { formatINR } from "../lib/format";
import { CAT_COLORS, CATEGORIES } from "../lib/constants";
import { parseCapture } from "../lib/quickCapture";
import { scoreCapture } from "../lib/quickCapture/confidence";
import type { Confidence } from "../lib/quickCapture/confidence";
import { prepareDraft, expensePayload, taskPayload } from "../lib/quickCapture/draft";
import type { CaptureDraft, DraftFocus } from "../lib/quickCapture/draft";
import { subscribeQuickCaptureFocus } from "../lib/quickCapture/focusBus";

interface QuickCaptureProps {
  onCreateExpense: (e: { name: string; amount: number; category: string }) => Promise<string | number | null>;
  onCreateTask: (t: { text: string; due: string | null }) => Promise<string | number | null>;
  onUndo: (type: "expense" | "task", id: string | number) => void;
}

const EXAMPLES = ["₹250 lunch", "₹1200 fuel", "Call manager tomorrow", "Pay EB bill Friday"];

const CONFIDENCE_META: Record<Confidence, { label: string; className: string }> = {
  high: { label: "High confidence", className: "bg-success/10 text-success" },
  medium: { label: "Double-check", className: "bg-warning/10 text-warning" },
  "needs-review": { label: "Needs review", className: "bg-danger/10 text-danger" },
};

const categoryColor = (c: string): string =>
  (CAT_COLORS as Record<string, string>)[c] ?? CAT_COLORS.Other;

/** Formats a YYYY-MM-DD due date as a short local label (e.g. "Fri, 19 Jun"). */
function formatDue(due: string): string {
  const [y, m, d] = due.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface text-muted hover:bg-surface-2 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function QuickCapture({ onCreateExpense, onCreateTask, onUndo }: QuickCaptureProps) {
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<CaptureDraft | null>(null);
  const [focusField, setFocusField] = useState<DraftFocus>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<{
    type: "expense" | "task";
    id: string | number;
    label: string;
  } | null>(null);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const pendingFocusRef = useRef(false);

  // Callback ref: focuses the input the instant it (re)mounts if a focus was
  // requested while it was absent (e.g. coming back from confirm mode).
  const attachInput = useCallback((el: HTMLInputElement | null) => {
    inputRef.current = el;
    if (el && pendingFocusRef.current) {
      pendingFocusRef.current = false;
      el.focus();
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  // Dock "+" → always return to the capture input and focus it reliably,
  // regardless of whether we're mid-edit or just saved.
  useEffect(
    () =>
      subscribeQuickCaptureFocus(() => {
        pendingFocusRef.current = true;
        setDraft(null);
        setLastSaved(null);
        if (inputRef.current) {
          pendingFocusRef.current = false;
          inputRef.current.focus();
          inputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }),
    [],
  );

  // Rotate the placeholder examples while the field is empty.
  useEffect(() => {
    const t = setInterval(() => setPlaceholderIdx((i) => (i + 1) % EXAMPLES.length), 3500);
    return () => clearInterval(t);
  }, []);

  // Auto-dismiss the undo affordance.
  useEffect(() => {
    if (!lastSaved) return;
    const t = setTimeout(() => setLastSaved(null), 6000);
    return () => clearTimeout(t);
  }, [lastSaved]);

  const trimmed = text.trim();
  const result = useMemo(() => (trimmed ? parseCapture(text) : null), [text, trimmed]);
  const confidence = useMemo(
    () => (result ? scoreCapture(result, text) : null),
    [result, text],
  );

  const reset = () => {
    setText("");
    setDraft(null);
    setFocusField(null);
  };

  const review = () => {
    if (!result) return;
    const prepared = prepareDraft(result);
    setFocusField(prepared.focus);
    setDraft(prepared.draft);
  };

  const finishSave = (type: "expense" | "task", id: string | number | null) => {
    setSaving(false);
    if (id != null) {
      setLastSaved({ type, id, label: type === "expense" ? "Expense added" : "Task added" });
      reset();
    }
  };

  const oneTapSave = async () => {
    if (!result) return;
    setSaving(true);
    if (result.type === "expense") {
      const id = await onCreateExpense({
        name: result.name,
        amount: result.amount,
        category: result.category,
      });
      finishSave("expense", id);
    } else {
      const id = await onCreateTask({ text: result.text, due: result.due });
      finishSave("task", id);
    }
  };

  const onEnter = () => {
    if (!result) return;
    if (confidence === "high") void oneTapSave();
    else review();
  };

  const setField = (field: keyof CaptureDraft, value: string) =>
    setDraft((d) => (d ? { ...d, [field]: value } : d));

  const isValid =
    draft != null &&
    (draft.type === "expense"
      ? draft.name.trim() !== "" && parseFloat(draft.amount) > 0
      : draft.text.trim() !== "");

  const saveDraft = async () => {
    if (!draft || !isValid) return;
    setSaving(true);
    const id =
      draft.type === "expense"
        ? await onCreateExpense(expensePayload(draft))
        : await onCreateTask(taskPayload(draft));
    finishSave(draft.type, id);
  };

  const undo = () => {
    if (!lastSaved) return;
    onUndo(lastSaved.type, lastSaved.id);
    setLastSaved(null);
  };

  return (
    <Card className="space-y-3">
      <AnimatePresence initial={false} mode="wait">
        {draft ? (
          /* ---------- Confirmation / edit mode ---------- */
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="space-y-3"
          >
            <div className="flex gap-2">
              <ToggleButton active={draft.type === "expense"} onClick={() => setField("type", "expense")}>
                <Wallet className="h-4 w-4" aria-hidden />
                Expense
              </ToggleButton>
              <ToggleButton active={draft.type === "task"} onClick={() => setField("type", "task")}>
                <ListChecks className="h-4 w-4" aria-hidden />
                Task
              </ToggleButton>
            </div>

            {draft.type === "expense" ? (
              <div className="space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative sm:w-36">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                      ₹
                    </span>
                    <Input
                      value={draft.amount}
                      onChange={(e) => setField("amount", e.target.value)}
                      inputMode="decimal"
                      placeholder="0"
                      aria-label="Amount"
                      className="pl-7 tabular-nums"
                      autoFocus={focusField === "amount"}
                    />
                  </div>
                  <Select
                    value={draft.category}
                    onChange={(e) => setField("category", e.target.value)}
                    aria-label="Category"
                    className="sm:flex-1"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </div>
                <Input
                  value={draft.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="What was it for?"
                  aria-label="Expense name"
                  autoFocus={focusField === "name"}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  value={draft.text}
                  onChange={(e) => setField("text", e.target.value)}
                  placeholder="What needs to be done?"
                  aria-label="Task description"
                  autoFocus={focusField === "text"}
                />
                <label className="flex items-center gap-2 text-xs font-medium text-muted">
                  <span className="whitespace-nowrap">Due date</span>
                  <Input
                    type="date"
                    value={draft.due}
                    onChange={(e) => setField("due", e.target.value)}
                    aria-label="Due date"
                  />
                </label>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setDraft(null)} disabled={saving}>
                Back
              </Button>
              <Button onClick={saveDraft} disabled={!isValid || saving} className="flex-1">
                <Check className="h-4 w-4" aria-hidden />
                {saving ? "Saving…" : draft.type === "expense" ? "Save expense" : "Save task"}
              </Button>
            </div>
          </motion.div>
        ) : (
          /* ---------- Capture mode (live preview) ---------- */
          <motion.div
            key="capture"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-[18px] w-[18px] flex-shrink-0 text-primary" aria-hidden />
              <Input
                ref={attachInput}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onEnter()}
                placeholder={`Try "${EXAMPLES[placeholderIdx]}"`}
                aria-label="Quick capture"
                enterKeyHint="done"
              />
            </div>

            {lastSaved && (
              <div className="flex items-center justify-between gap-2 rounded-xl bg-success/10 px-3 py-2 text-sm text-success">
                <span className="flex items-center gap-1.5 font-medium">
                  <Check className="h-4 w-4" aria-hidden />
                  {lastSaved.label}
                </span>
                <button
                  type="button"
                  onClick={undo}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold hover:bg-success/15"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                  Undo
                </button>
              </div>
            )}

            {result && confidence ? (
              <div className="space-y-2" aria-live="polite">
                <div className="flex flex-wrap items-center gap-2">
                  {result.type === "expense" ? (
                    <>
                      <Chip className="bg-primary/10 text-primary">
                        <Wallet className="h-3.5 w-3.5" aria-hidden />
                        Expense
                      </Chip>
                      <Chip className="bg-surface-2 text-foreground tabular-nums">
                        {formatINR(result.amount)}
                      </Chip>
                      <Chip className="bg-surface-2 text-foreground">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: categoryColor(result.category) }}
                          aria-hidden
                        />
                        {result.category}
                      </Chip>
                    </>
                  ) : (
                    <>
                      <Chip className="bg-surface-2 text-foreground">
                        <ListChecks className="h-3.5 w-3.5" aria-hidden />
                        Task
                      </Chip>
                      {result.due ? (
                        <Chip className="bg-primary/10 text-primary">
                          <Calendar className="h-3.5 w-3.5" aria-hidden />
                          {formatDue(result.due)}
                        </Chip>
                      ) : (
                        <Chip className="bg-surface-2 text-muted">
                          <Calendar className="h-3.5 w-3.5" aria-hidden />
                          No due date
                        </Chip>
                      )}
                    </>
                  )}
                  <Chip className={CONFIDENCE_META[confidence].className}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                    {CONFIDENCE_META[confidence].label}
                  </Chip>
                </div>

                <Button onClick={onEnter} disabled={saving} className="w-full sm:w-auto">
                  {confidence === "high" ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden />
                      {saving ? "Saving…" : result.type === "expense" ? "Save expense" : "Save task"}
                    </>
                  ) : (
                    <>
                      <Pencil className="h-4 w-4" aria-hidden />
                      Review &amp; edit
                    </>
                  )}
                </Button>
              </div>
            ) : (
              !lastSaved && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-muted">Try:</span>
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => {
                        setText(ex);
                        inputRef.current?.focus();
                      }}
                      className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
