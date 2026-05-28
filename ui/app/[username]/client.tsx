import { Api } from "@/lib/types";
import { ApiCard } from "@/components/api-browser";

interface Props {
  apis: Api[];
  username: string;
}

export default function UserProfileClient({ apis, username }: Props) {
  if (apis.length === 0) {
    return (
      <div className="border border-border border-dashed px-6 py-20 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          @{username} has no public apis yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground uppercase tracking-widest">
        apis
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px">
        {apis.map((api) => (
          <ApiCard key={api.id} api={api} href={`/${username}/${api.name}`} />
        ))}
      </div>
    </div>
  );
}
