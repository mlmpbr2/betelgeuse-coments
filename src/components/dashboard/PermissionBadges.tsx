import { Badge } from "@/components/ui/badge";

const PERMISSIONS = [
  {
    name: "instagram_business_basic",
    hint: "Acesso ao perfil e midia da conta Instagram",
  },
  {
    name: "instagram_business_manage_comments",
    hint: "Moderacao de comentarios: ler, ocultar e responder",
  },
];

export function PermissionBadges() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">Permissoes do app:</span>
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
