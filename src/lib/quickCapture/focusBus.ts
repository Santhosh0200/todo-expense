// A tiny decoupled focus channel so the FloatingDock "+" can focus the
// QuickCapture input without threading state through App.tsx. If no listener
// is mounted yet (e.g. the dock triggers a navigation to the Dashboard first),
// the request is held as pending and consumed when QuickCapture mounts.
type Listener = () => void;

const listeners = new Set<Listener>();
let pending = false;

/** Ask the QuickCapture input to focus itself. */
export function requestQuickCaptureFocus(): void {
  if (listeners.size === 0) {
    pending = true;
    return;
  }
  listeners.forEach((listener) => listener());
}

/** Subscribe the QuickCapture input; consumes any pending request immediately. */
export function subscribeQuickCaptureFocus(listener: Listener): () => void {
  listeners.add(listener);
  if (pending) {
    pending = false;
    listener();
  }
  return () => {
    listeners.delete(listener);
  };
}
