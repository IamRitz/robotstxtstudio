import { CodePanel } from "@/components/code-panel";
import { Callout } from "@/components/callout";
import { cn } from "@/lib/utils";
import type { ContentBlock } from "./types";

/** Render one content block with consistent prose styling. */
export function Block({ block }: { block: ContentBlock }) {
  switch (block.kind) {
    case "p":
      return <p className="text-sm leading-7 text-muted-foreground">{block.content}</p>;

    case "list":
      return block.ordered ? (
        <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-7 text-muted-foreground marker:text-muted-foreground">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      ) : (
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-7 text-muted-foreground marker:text-muted-foreground">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );

    case "snippet":
      return (
        <figure className="space-y-1.5">
          <CodePanel code={block.code} title={block.caption ?? "robots.txt"} />
        </figure>
      );

    case "callout":
      return (
        <Callout status={block.status} title={block.title}>
          {block.body}
        </Callout>
      );

    case "mistakes":
      return (
        <ul className="space-y-2">
          {block.items.map((m, i) => (
            <li key={i} className="rounded-xl border border-status-blocked-bg bg-status-blocked-bg/40 p-3">
              <p className="text-sm font-semibold text-foreground">{m.title}</p>
              <p className="mt-0.5 text-xs leading-6 text-muted-foreground">{m.body}</p>
            </li>
          ))}
        </ul>
      );

    case "table":
      return (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-muted">
                {block.head.map((h, i) => (
                  <th key={i} className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className={cn(ri % 2 === 1 && "bg-muted/40")}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border-t border-border px-3 py-2 align-top text-muted-foreground">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

/** Render a sequence of blocks with vertical rhythm. */
export function Blocks({ blocks }: { blocks: readonly ContentBlock[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}
