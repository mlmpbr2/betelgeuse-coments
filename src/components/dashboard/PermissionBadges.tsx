import { Badge } from "@/components/ui/badge";
import { getDictionary, type Lang } from "@/lib/i18n";

export function PermissionBadges({ lang = "pt" }: { lang?: Lang }) {
  const t = getDictionary(lang);

  const PERMISSIONS = [
    {
      name: "instagram_business_basic",
      hint: t.permissionHintBasic,
    },
    {
      name: "instagram_business_manage_comments",
      hint: t.permissionHintComments,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">{t.appPermissions}</span>
      {PERMISSIONS.map((permission) => (
        <Badge
          key={permission.name}
          variant="outline"
          title={permission.hint}
          className="font-normal text-muted-foreground"
        >
          {permission.name}
        </Badge>
      ))}
    </div>
  );
}
