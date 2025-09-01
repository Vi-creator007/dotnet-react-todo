import { useEffect, useMemo, useState } from "react";

type Todo = { id: string; title: string; done: boolean; createdAt: number };
const STORAGE_KEY = "todos.v1";
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) try { setTodos(JSON.parse(raw)); } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const visible = useMemo(() => {
    if (filter === "done") return todos.filter(t => t.done);
    if (filter === "open") return todos.filter(t => !t.done);
    return todos;
  }, [todos, filter]);

  function addTodo(e: React.FormEvent) {
    e.preventDefault();
    const title = text.trim();
    if (!title) return;
    setTodos([{ id: uid(), title, done: false, createdAt: Date.now() }, ...todos]);
    setText("");
  }
  const toggle = (id: string) => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const remove = (id: string) => setTodos(todos.filter(t => t.id !== id));
  const rename = (id: string, title: string) => setTodos(todos.map(t => t.id === id ? { ...t, title } : t));

  return (
    <div style={{ maxWidth: 560, margin: "40px auto", padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <h1 style={{ marginBottom: 12 }}>✅ To-Do</h1>

      <form onSubmit={addTodo} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a task…"
          style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" }}
        />
        <button type="submit" style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer" }}>
          Add
        </button>
      </form>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {(["all", "open", "done"] as const).map(k => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid #ddd",
              cursor: "pointer",
              background: filter === k ? "#efefef" : "white"
            }}
          >
            {k}
          </button>
        ))}
        <div style={{ marginLeft: "auto", color: "#666" }}>
          {todos.filter(t => !t.done).length} open / {todos.length} total
        </div>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
        {visible.map(t => (
          <li key={t.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
            <EditableText value={t.title} onChange={v => rename(t.id, v)} />
            <small style={{ marginLeft: "auto", color: "#999" }}>{new Date(t.createdAt).toLocaleString()}</small>
            <button onClick={() => remove(t.id)} style={{ marginLeft: 8, border: "1px solid #ddd", borderRadius: 8, padding: "6px 8px", cursor: "pointer" }}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {visible.length === 0 && <p style={{ color: "#666", marginTop: 16 }}>No tasks to show.</p>}
    </div>
  );
}

function EditableText({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  if (!editing) {
    return (
      <span onDoubleClick={() => setEditing(true)} style={{ flex: 1 }} title="Double-click to edit">
        {value}
      </span>
    );
  }
  return (
    <form
      onSubmit={e => { e.preventDefault(); onChange(draft.trim() || value); setEditing(false); }}
      style={{ flex: 1 }}
    >
      <input
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={() => { onChange(draft.trim() || value); setEditing(false); }}
        style={{ width: "100%", padding: "6px 8px", borderRadius: 8, border: "1px solid #ddd" }}
      />
    </form>
  );
}
