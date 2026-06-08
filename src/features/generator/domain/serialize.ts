/**
 * The canonical robots.txt serializer: a {@link RobotsFile} → text.
 *
 * Renders the file's lossless `directives` backbone (which the parser and the
 * generator both maintain), so it round-trips exactly. No other feature should
 * construct robots.txt text directly — call this.
 */
import type { RobotsFile } from "@/types";

export function serialize(file: RobotsFile): string {
  return file.directives.map((directive) => directive.raw).join("\n");
}
