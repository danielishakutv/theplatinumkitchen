import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { listAddonGroups } from "@/modules/menu";
import { formatNaira } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { GroupFormDialog } from "./group-form-dialog";
import { OptionFormDialog } from "./option-form-dialog";
import { GroupRowActions, OptionRowActions } from "./addon-row-actions";

export const metadata = {
  title: "Variations & add-ons",
};

export default async function AdminAddonsPage() {
  const session = await auth();
  const user = session!.user;
  const groups = await listAddonGroups();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link
            href="/admin/menu"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Back to menu
          </Link>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight">
            Variations &amp; add-ons
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reusable groups (protein, spice, size, etc.) you can attach to any dish.
          </p>
        </div>
        <GroupFormDialog />
      </header>

      {groups.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-platinum-300 bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No addon groups yet. Tap &quot;New group&quot; to create one.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section
              key={group.id}
              className="overflow-hidden rounded-3xl border border-platinum-200 bg-card"
            >
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-platinum-200 bg-platinum-50/40 px-6 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-medium">{group.label}</h2>
                    <span className="rounded-full bg-card px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {group.kind === "single" ? "Single" : "Multiple"}
                    </span>
                    {group.required ? (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        Required
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    <code className="rounded bg-background px-1.5 py-0.5">{group.id}</code>
                    {group.kind === "multiple" && (group.min || group.max) ? (
                      <>
                        <ChevronRight className="mx-1 inline h-3 w-3" />
                        {group.min ?? 0}&ndash;{group.max ?? "∞"} picks
                      </>
                    ) : null}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <OptionFormDialog
                    groupId={group.id}
                    trigger={
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 rounded-full"
                      >
                        + Option
                      </Button>
                    }
                  />
                  <GroupRowActions group={group} actor={user} />
                </div>
              </header>

              {group.options.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No options yet. Tap &quot;+ Option&quot; above.
                </div>
              ) : (
                <ul className="divide-y divide-platinum-200">
                  {group.options.map((option) => (
                    <li
                      key={option.id}
                      className="flex items-center justify-between gap-4 px-6 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{option.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          <code className="rounded bg-platinum-50 px-1.5 py-0.5">
                            {option.id}
                          </code>
                          {option.priceDelta !== 0 ? (
                            <span className="ml-2 font-medium tabular-nums text-foreground/80">
                              {option.priceDelta > 0 ? "+" : ""}
                              {formatNaira(option.priceDelta)}
                            </span>
                          ) : null}
                        </p>
                      </div>
                      <OptionRowActions
                        option={option}
                        groupId={group.id}
                        actor={user}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
