"use client";

import { useState, useEffect } from "react";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

type Filter = "all" | "active" | "completed";

const STORAGE_KEY = "nextjs-todo-items";

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTodos(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setTodos((prev) => [
      { id: crypto.randomUUID(), text, completed: false },
      ...prev,
    ]);
    setInput("");
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((t) => !t.completed));
  };

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className="mb-6 text-center text-5xl font-bold tracking-widest text-indigo-600">
        TODO
      </h1>

      {/* Add form */}
      <form onSubmit={addTodo} className="mb-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="新しいタスクを入力..."
          maxLength={200}
          className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-indigo-500"
        />
        <button
          type="submit"
          className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 active:scale-95"
        >
          追加
        </button>
      </form>

      {/* Filters */}
      <div className="mb-4 flex gap-2">
        {(["all", "active", "completed"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 rounded-lg border-2 py-2 text-sm font-medium transition ${
              filter === f
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-gray-200 bg-white text-gray-500 hover:border-indigo-500 hover:text-indigo-600"
            }`}
          >
            {f === "all" ? "すべて" : f === "active" ? "未完了" : "完了済み"}
          </button>
        ))}
      </div>

      {/* Todo list */}
      <ul className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <li className="py-10 text-center text-gray-400">タスクはありません</li>
        ) : (
          filtered.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="h-5 w-5 cursor-pointer accent-indigo-600"
              />
              <span
                className={`flex-1 break-words text-base ${
                  todo.completed ? "text-gray-400 line-through" : "text-gray-800"
                }`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                aria-label="削除"
                className="rounded-md px-1 text-xl text-gray-300 transition hover:bg-red-50 hover:text-red-500"
              >
                ×
              </button>
            </li>
          ))
        )}
      </ul>

      {/* Footer */}
      {todos.length > 0 && (
        <div className="mt-4 flex items-center justify-between px-1 text-sm text-gray-500">
          <span>残り {activeCount} 件</span>
          {completedCount > 0 && (
            <button
              onClick={clearCompleted}
              className="rounded px-2 py-1 transition hover:bg-red-50 hover:text-red-500"
            >
              完了済みを削除
            </button>
          )}
        </div>
      )}
    </div>
  );
}
