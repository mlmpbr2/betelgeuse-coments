import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary, type Lang } from "@/lib/i18n";

export async function MetricCards({
  userId,
  lang = "pt",
}: {
  userId: string;
  lang?: Lang;
}) {
  const [credit, totalAnalyses, negativeHidden] = await Promise.all([
    prisma.credit.findUnique({ where: { userId } }),
    prisma.commentAnalysis.count({
      where: { instagramAccount: { userId } },
    }),
    prisma.commentAnalysis.count({
      where: { instagramAccount: { userId }, sentiment: "negativo", hidden: true },
    }),
  ]);

  const t = getDictionary(lang);

  const cards = [
    { title: t.creditsAvailable, value: credit?.balance ?? 0 },
    { title: t.analyzedCommentsMetric, value: totalAnalyses },
    { title: t.hiddenNegatives, value: negativeHidden },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
