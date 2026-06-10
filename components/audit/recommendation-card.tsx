import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Info } from "lucide-react";
import type { AuditFinding } from "@/lib/audit-engine";

interface RecommendationCardProps {
  finding: AuditFinding;
  index: number;
}

export function RecommendationCard({ finding, index }: RecommendationCardProps) {
  const priorityConfig = {
    HIGH: { variant: "danger" as const, icon: AlertTriangle, label: "High Priority" },
    MEDIUM: { variant: "warning" as const, icon: Info, label: "Medium Priority" },
    LOW: { variant: "secondary" as const, icon: Info, label: "Low Priority" },
  };

  const config = priorityConfig[finding.priority];

  return (
    <div className="glass rounded-2xl p-5 hover:border-violet-500/20 transition-all duration-200">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">
            {index + 1}
          </div>
          <div>
            <span className="text-xs text-violet-400 font-medium">{finding.category}</span>
            <h3 className="font-semibold text-white text-sm mt-0.5">{finding.issue}</h3>
          </div>
        </div>
        <Badge variant={config.variant} className="shrink-0">
          {finding.priority}
        </Badge>
      </div>

      <p className="text-gray-400 text-sm leading-relaxed mb-3">{finding.impact}</p>

      <div className="bg-violet-600/10 border border-violet-500/20 rounded-xl p-3 mb-3">
        <div className="text-xs text-violet-400 font-medium mb-1">The Fix</div>
        <p className="text-sm text-gray-300">{finding.fix}</p>
      </div>

      <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
        <TrendingUp className="w-4 h-4" />
        {finding.revenueImpact}
      </div>
    </div>
  );
}
