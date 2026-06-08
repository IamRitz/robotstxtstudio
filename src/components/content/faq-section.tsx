import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/lib/seo";
import { SectionHeader } from "@/components/section-header";

/** Accessible FAQ accordion (native <details>). Schema is emitted separately. */
export function FaqSection({ faqs }: { faqs: readonly FaqItem[] }) {
  if (faqs.length === 0) return null;
  return (
    <section aria-labelledby="faq">
      <SectionHeader className="mb-3">
        <span id="faq">Frequently asked questions</span>
      </SectionHeader>
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {faqs.map((f, i) => (
          <details key={i} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-semibold text-foreground">
              {f.question}
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <p className="px-4 pb-4 text-sm leading-7 text-muted-foreground">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
