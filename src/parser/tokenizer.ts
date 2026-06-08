/**
 * Tokenizer (lexer): one source line → one {@link Token}.
 *
 * Handles line splitting (LF/CRLF/CR), a leading UTF-8 BOM, full-line and inline
 * comments, and field-name recognition. It does not apply grouping semantics — that
 * is the parser's job. Tokens are 1:1 with source lines, preserving order and line
 * numbers; nothing is discarded.
 */
import type { DirectiveField } from "@/types";
import { normalizeFieldName } from "./fields";

/** A single classified source line. `raw` is always the original line text. */
export type Token =
  | { readonly kind: "blank"; readonly line: number; readonly raw: string }
  | {
      readonly kind: "comment";
      readonly line: number;
      readonly raw: string;
      /** Comment text with the leading `#` removed, trimmed. */
      readonly comment: string;
    }
  | {
      readonly kind: "field";
      readonly line: number;
      readonly raw: string;
      readonly field: DirectiveField;
      /** The original (untrimmed-lowercased) name as written. */
      readonly name: string;
      /** Value after the first colon, inline comment stripped, trimmed. */
      readonly value: string;
      /** Inline comment text, if the line had a trailing `# ...`. */
      readonly inlineComment?: string;
    }
  | {
      readonly kind: "unknown";
      readonly line: number;
      readonly raw: string;
      /** Present when the line had a colon (unsupported/vendor directive). */
      readonly name?: string;
      readonly value?: string;
      readonly hasColon: boolean;
    };

const LINE_SPLIT = /\r\n|\r|\n/;
const BOM = 0xfeff;

/** Split a directive value from a trailing inline comment (`#` starts a comment). */
function splitInlineComment(rest: string): { value: string; comment?: string } {
  const hash = rest.indexOf("#");
  if (hash === -1) return { value: rest };
  return { value: rest.slice(0, hash), comment: rest.slice(hash + 1).trim() };
}

/** Tokenize raw robots.txt text. Never throws; an empty input yields no tokens. */
export function tokenize(input: string): Token[] {
  const text = input.charCodeAt(0) === BOM ? input.slice(1) : input;
  if (text.length === 0) return [];

  const lines = text.split(LINE_SPLIT);
  const tokens: Token[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i] ?? "";
    const line = i + 1;
    const trimmed = raw.trim();

    if (trimmed === "") {
      tokens.push({ kind: "blank", line, raw });
      continue;
    }
    if (trimmed.startsWith("#")) {
      tokens.push({ kind: "comment", line, raw, comment: trimmed.slice(1).trim() });
      continue;
    }

    const colon = raw.indexOf(":");
    if (colon === -1) {
      tokens.push({ kind: "unknown", line, raw, hasColon: false });
      continue;
    }

    const name = raw.slice(0, colon).trim();
    const { value, comment } = splitInlineComment(raw.slice(colon + 1));
    const field = normalizeFieldName(name);

    if (field) {
      tokens.push(
        comment === undefined
          ? { kind: "field", line, raw, field, name, value: value.trim() }
          : { kind: "field", line, raw, field, name, value: value.trim(), inlineComment: comment },
      );
    } else {
      tokens.push({ kind: "unknown", line, raw, name, value: value.trim(), hasColon: true });
    }
  }

  return tokens;
}
