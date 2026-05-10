"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ScoreCardProps {
  overallBand: number;
  taBand: number;
  ccBand: number;
  lrBand: number;
  graBand: number;
  taComment: string;
  ccComment: string;
  lrComment: string;
  graComment: string;
  overallComment: string;
}

function BandBadge({ band, label }: { band: number; label: string }) {
  const color =
    band >= 7.5
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : band >= 6.5
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : band >= 5.5
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-rose-100 text-rose-800 border-rose-200";

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className={cn("text-2xl font-bold rounded-lg px-3 py-1 border", color)}>
        {band.toFixed(1)}
      </span>
    </div>
  );
}

const CRITERION_LABELS: Record<string, string> = {
  ta: "Task Achievement",
  cc: "Coherence & Cohesion",
  lr: "Lexical Resource",
  gra: "Grammatical Range",
};

export function ScoreCard({
  overallBand,
  taBand,
  ccBand,
  lrBand,
  graBand,
  taComment,
  ccComment,
  lrComment,
  graComment,
  overallComment,
}: ScoreCardProps) {
  const criteria = [
    { key: "ta", band: taBand, comment: taComment },
    { key: "cc", band: ccBand, comment: ccComment },
    { key: "lr", band: lrBand, comment: lrComment },
    { key: "gra", band: graBand, comment: graComment },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-center">Overall Band Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <span className="text-6xl font-bold text-primary">{overallBand.toFixed(1)}</span>
            <div className="flex gap-6 justify-center flex-wrap">
              <BandBadge band={taBand} label="TA" />
              <BandBadge band={ccBand} label="CC" />
              <BandBadge band={lrBand} label="LR" />
              <BandBadge band={graBand} label="GRA" />
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-lg">{overallComment}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {criteria.map(({ key, band, comment }) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm">{CRITERION_LABELS[key]}</CardTitle>
                <Badge variant="outline" className="text-base font-bold px-3">
                  {band.toFixed(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
