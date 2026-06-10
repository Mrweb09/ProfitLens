"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionItem {
  id: string;
  title: string;
  detail: string;
  priority: string;
  category: string;
  done: boolean;
  order: number;
}

export function ActionPlan({ items }: { items: ActionItem[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(
    new Set(items.filter((i) => i.done).map((i) => i.id))
  );

  async function toggleDone(id: string) {
    const next = new Set(done);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setDone(next);

    await fetch(`/api/action-item/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: next.has(id) }),
    });
  }

  const completed = done.size;
  const total = items.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  const sorted = [...items].sort((a, b) => (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2) - (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2));

  return (
    <div>
      {/* Progress bar */}
      <div className="glass rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-semibold">Progress</span>
          <span className="text-violet-400 font-bold">{completed}/{total} tasks done</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="text-right text-sm text-gray-400 mt-1">{percent}% complete</div>
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        {sorted.map((item) => {
          const isDone = done.has(item.id);
          const isOpen = expanded === item.id;

          return (
            <div
              key={item.id}
              className={cn(
                "glass rounded-2xl overflow-hidden transition-all border",
                isDone ? "opacity-60 border-white/5" : "border-white/10 hover:border-violet-500/30"
              )}
            >
              <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpanded(isOpen ? null : item.id)}>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleDone(item.id); }}
                  className="shrink-0"
                >
                  {isDone
                    ? <CheckCircle2 className="w-6 h-6 text-green-400" />
                    : <Circle className="w-6 h-6 text-gray-600 hover:text-violet-400 transition-colors" />
                  }
                </button>

                <div className="flex-1 min-w-0">
                  <div className={cn("font-medium text-sm", isDone ? "line-through text-gray-500" : "text-white")}>
                    {item.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.category}</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={item.priority === "HIGH" ? "danger" : item.priority === "MEDIUM" ? "warning" : "secondary"}>
                    {item.priority}
                  </Badge>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {isOpen && (
                <div className="px-4 pb-4 pt-0 ml-10 text-sm text-gray-300 leading-relaxed border-t border-white/5 pt-3">
                  {item.detail}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
