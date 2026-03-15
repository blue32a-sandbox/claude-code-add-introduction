import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import TodoApp from "@/components/TodoApp";

beforeEach(() => {
  localStorage.clear();
});

// -------------------------
// タスクの追加
// -------------------------
describe("タスクの追加", () => {
  it("テキストを入力して追加ボタンを押すとリストに表示される", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);

    await user.type(screen.getByPlaceholderText("新しいタスクを入力..."), "買い物をする");
    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(screen.getByText("買い物をする")).toBeInTheDocument();
  });

  it("追加後に入力フィールドが空になる", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);

    const input = screen.getByPlaceholderText("新しいタスクを入力...");
    await user.type(input, "買い物をする");
    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(input).toHaveValue("");
  });

  it("空白のみの入力はタスクを追加しない", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);

    await user.type(screen.getByPlaceholderText("新しいタスクを入力..."), "   ");
    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(screen.getByText("タスクはありません")).toBeInTheDocument();
  });

  it("Enterキーでもタスクを追加できる", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);

    await user.type(screen.getByPlaceholderText("新しいタスクを入力..."), "運動する{Enter}");

    expect(screen.getByText("運動する")).toBeInTheDocument();
  });

  it("複数のタスクを追加できる", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);

    const input = screen.getByPlaceholderText("新しいタスクを入力...");
    await user.type(input, "タスク1{Enter}");
    await user.type(input, "タスク2{Enter}");
    await user.type(input, "タスク3{Enter}");

    expect(screen.getByText("タスク1")).toBeInTheDocument();
    expect(screen.getByText("タスク2")).toBeInTheDocument();
    expect(screen.getByText("タスク3")).toBeInTheDocument();
  });
});

// -------------------------
// 完了トグル
// -------------------------
describe("タスクの完了トグル", () => {
  it("チェックボックスをオンにするとタスクが完了状態になる", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);

    await user.type(screen.getByPlaceholderText("新しいタスクを入力..."), "読書{Enter}");

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(screen.getByText("読書")).toHaveClass("line-through");
  });

  it("完了状態のチェックボックスをオフにすると未完了に戻る", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);

    await user.type(screen.getByPlaceholderText("新しいタスクを入力..."), "読書{Enter}");

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);
    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(screen.getByText("読書")).not.toHaveClass("line-through");
  });
});

// -------------------------
// タスクの削除
// -------------------------
describe("タスクの削除", () => {
  it("削除ボタンを押すとタスクがリストから消える", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);

    await user.type(screen.getByPlaceholderText("新しいタスクを入力..."), "削除するタスク{Enter}");

    await user.click(screen.getByRole("button", { name: "削除" }));

    expect(screen.queryByText("削除するタスク")).not.toBeInTheDocument();
  });

  it("複数タスクのうち指定したタスクだけ削除される", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);

    const input = screen.getByPlaceholderText("新しいタスクを入力...");
    await user.type(input, "残すタスク{Enter}");
    await user.type(input, "消すタスク{Enter}");

    // 最新追加（上に表示）が「消すタスク」
    const deleteButtons = screen.getAllByRole("button", { name: "削除" });
    await user.click(deleteButtons[0]);

    expect(screen.queryByText("消すタスク")).not.toBeInTheDocument();
    expect(screen.getByText("残すタスク")).toBeInTheDocument();
  });
});

// -------------------------
// フィルタリング
// -------------------------
describe("フィルタリング", () => {
  async function setupTodos(user: ReturnType<typeof userEvent.setup>) {
    const input = screen.getByPlaceholderText("新しいタスクを入力...");
    await user.type(input, "未完了タスク{Enter}");
    await user.type(input, "完了タスク{Enter}");
    // 「完了タスク」にチェック（上に表示されている方）
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);
  }

  it("「未完了」フィルターで未完了タスクのみ表示される", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);
    await setupTodos(user);

    await user.click(screen.getByRole("button", { name: "未完了" }));

    expect(screen.getByText("未完了タスク")).toBeInTheDocument();
    expect(screen.queryByText("完了タスク")).not.toBeInTheDocument();
  });

  it("「完了済み」フィルターで完了タスクのみ表示される", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);
    await setupTodos(user);

    await user.click(screen.getByRole("button", { name: "完了済み" }));

    expect(screen.getByText("完了タスク")).toBeInTheDocument();
    expect(screen.queryByText("未完了タスク")).not.toBeInTheDocument();
  });

  it("「すべて」フィルターですべてのタスクが表示される", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);
    await setupTodos(user);

    await user.click(screen.getByRole("button", { name: "未完了" }));
    await user.click(screen.getByRole("button", { name: "すべて" }));

    expect(screen.getByText("未完了タスク")).toBeInTheDocument();
    expect(screen.getByText("完了タスク")).toBeInTheDocument();
  });
});

// -------------------------
// 完了済み一括削除
// -------------------------
describe("完了済みの一括削除", () => {
  it("「完了済みを削除」ボタンで完了タスクだけ削除される", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);

    const input = screen.getByPlaceholderText("新しいタスクを入力...");
    await user.type(input, "残すタスク{Enter}");
    await user.type(input, "完了タスク{Enter}");

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]); // 「完了タスク」を完了にする

    await user.click(screen.getByRole("button", { name: "完了済みを削除" }));

    expect(screen.queryByText("完了タスク")).not.toBeInTheDocument();
    expect(screen.getByText("残すタスク")).toBeInTheDocument();
  });

  it("完了タスクがないときは「完了済みを削除」ボタンが表示されない", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);

    await user.type(screen.getByPlaceholderText("新しいタスクを入力..."), "未完了のみ{Enter}");

    expect(screen.queryByRole("button", { name: "完了済みを削除" })).not.toBeInTheDocument();
  });
});

// -------------------------
// フッター（残り件数）
// -------------------------
describe("残り件数の表示", () => {
  it("タスクがないときはフッターが表示されない", () => {
    render(<TodoApp />);
    expect(screen.queryByText(/残り/)).not.toBeInTheDocument();
  });

  it("未完了タスクの件数が正しく表示される", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);

    const input = screen.getByPlaceholderText("新しいタスクを入力...");
    await user.type(input, "タスク1{Enter}");
    await user.type(input, "タスク2{Enter}");
    await user.type(input, "タスク3{Enter}");

    expect(screen.getByText("残り 3 件")).toBeInTheDocument();
  });

  it("タスクを完了すると残り件数が減る", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);

    const input = screen.getByPlaceholderText("新しいタスクを入力...");
    await user.type(input, "タスク1{Enter}");
    await user.type(input, "タスク2{Enter}");

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);

    expect(screen.getByText("残り 1 件")).toBeInTheDocument();
  });
});

// -------------------------
// localStorage 永続化
// -------------------------
describe("localStorageへの永続化", () => {
  it("追加したタスクがlocalStorageに保存される", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);

    await user.type(screen.getByPlaceholderText("新しいタスクを入力..."), "保存されるタスク{Enter}");

    const stored = JSON.parse(localStorage.getItem("nextjs-todo-items") ?? "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].text).toBe("保存されるタスク");
    expect(stored[0].completed).toBe(false);
  });

  it("localStorageに保存済みのタスクが初期表示される", () => {
    localStorage.setItem(
      "nextjs-todo-items",
      JSON.stringify([{ id: "abc", text: "復元タスク", completed: false }])
    );

    render(<TodoApp />);

    expect(screen.getByText("復元タスク")).toBeInTheDocument();
  });
});
