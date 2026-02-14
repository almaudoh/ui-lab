/**
 * Utilities for handling markdown text
 */

import removeMd from 'remove-markdown';
import { marked } from 'marked';

/**
 * Strip markdown syntax from text for speech synthesis
 * This removes formatting while preserving the readable content
 */
export function stripMarkdown(text: string): string {
  if (!text) return '';
  
  // Use remove-markdown library to strip markdown syntax
  let plainText = removeMd(text, {
    stripListLeaders: true,
    gfm: true,
    useImgAltText: true,
  });

  // Additional cleanup for better speech
  plainText = plainText
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Remove excessive line breaks
    .replace(/\n{3,}/g, '\n\n')
    // Trim whitespace
    .trim();

  return plainText;
}

type MathPlaceholders = {
  text: string;
  map: Record<string, string>;
};

function replaceMathWithPlaceholders(text: string): MathPlaceholders {
  let output = text;
  const map: Record<string, string> = {};
  let index = 0;

  output = output.replace(/\$\$([\s\S]+?)\$\$/g, (_, formula) => {
    const key = `[[MATH_BLOCK_${index++}]]`;
    map[key] = String(formula).trim();
    return key;
  });

  output = output.replace(/\\\[([\s\S]+?)\\\]/g, (_, formula) => {
    const key = `[[MATH_BLOCK_${index++}]]`;
    map[key] = String(formula).trim();
    return key;
  });

  output = output.replace(/(^|[^\\])\$([^\n]+?)\$/g, (match, prefix, formula) => {
    const key = `[[MATH_INLINE_${index++}]]`;
    map[key] = String(formula).trim();
    return `${prefix}${key}`;
  });

  output = output.replace(/\\\(([\s\S]+?)\\\)/g, (_, formula) => {
    const key = `[[MATH_INLINE_${index++}]]`;
    map[key] = String(formula).trim();
    return key;
  });

  return { text: output, map };
}

function normalizeInlineText(text: unknown, mathMap: Record<string, string>): string {
  if (text == null) return '';

  let output = Array.isArray(text) ? text.join(' ') : String(text);

  for (const [key, formula] of Object.entries(mathMap)) {
    output = output.replaceAll(key, `Math: ${formula}`);
  }

  output = output
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, (_, alt) => (alt ? `Image: ${alt}` : 'Image'))
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

  output = removeMd(output, {
    stripListLeaders: true,
    gfm: true,
    useImgAltText: true,
  });

  return output
    .replace(/\s+/g, ' ')
    .replace(/\.\.+/g, '.')
    .replace(/\s+\./g, '.')
    .replace(/\s*[,;]\s*$/g, '')
    .trim();
}

function finalizeSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';

  if (/[.!?]$/.test(trimmed)) {
    return trimmed;
  }

  if (/:$/.test(trimmed)) {
    return trimmed;
  }

  return `${trimmed}.`;
}

function inlineTokensToText(tokens: Array<Record<string, any>>): string {
  return tokens
    .map((token) => {
      if (!token) return '';
      if (typeof token.text === 'string') return token.text;
      if (token.type === 'codespan' && typeof token.text === 'string') return token.text;
      if (token.type === 'image') return token.text || token.alt || '';
      if (token.type === 'link') return token.text || '';
      if (Array.isArray(token.tokens)) return inlineTokensToText(token.tokens);
      if (typeof token.raw === 'string') return token.raw;
      return '';
    })
    .filter(Boolean)
    .join(' ');
}

function getTableCellText(cell: unknown, mathMap: Record<string, string>): string {
  if (typeof cell === 'string') return normalizeInlineText(cell, mathMap);
  if (cell && typeof cell === 'object') {
    const cellToken = cell as Record<string, any>;
    if (typeof cellToken.text === 'string') {
      return normalizeInlineText(cellToken.text, mathMap);
    }
    if (Array.isArray(cellToken.tokens)) {
      return normalizeInlineText(inlineTokensToText(cellToken.tokens), mathMap);
    }
  }

  return normalizeInlineText(String(cell || ''), mathMap);
}

function getNumericOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

function getOrdinal(n: number): string {
  const ordinals = [
    'first', 'second', 'third', 'fourth', 'fifth',
    'sixth', 'seventh', 'eighth', 'ninth', 'tenth'
  ];
  return ordinals[n] || `${getNumericOrdinal(n + 1)}`;
}

function tokensToSpeech(tokens: Array<Record<string, any>>, mathMap: Record<string, string>): string[] {
  const lines: string[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case 'heading': {
        const text = normalizeInlineText(token.text, mathMap);
        if (text) {
          lines.push('');
          lines.push(finalizeSentence(text));
          lines.push('');
        }
        break;
      }
      case 'paragraph': {
        const text = normalizeInlineText(token.text, mathMap);
        if (text) {
          if (/^(given|mathematically)$/i.test(text)) {
            lines.push(`${text}:`);
          } else {
            lines.push(text);
          }
        }
        break;
      }
      case 'blockquote': {
        lines.push('Quote.');
        if (Array.isArray(token.tokens)) {
          lines.push(...tokensToSpeech(token.tokens, mathMap));
        } else if (token.text) {
          const text = normalizeInlineText(token.text, mathMap);
          if (text) {
            lines.push(text);
          }
        }
        break;
      }
      case 'list': {
        for (const item of token.items || []) {
          if (Array.isArray(item.tokens)) {
            const nested = tokensToSpeech(item.tokens, mathMap).join(' ');
            const text = normalizeInlineText(nested || item.text || '', mathMap);
            if (text) {
              lines.push(finalizeSentence(text));
            }
          } else {
            const text = normalizeInlineText(item.text || '', mathMap);
            if (text) {
              lines.push(finalizeSentence(text));
            }
          }
        }
        break;
      }
      case 'table': {
        lines.push('')
        lines.push('Table.');
        lines.push('');
        const headers = (token.header || [])
          .map((cell: unknown) => getTableCellText(cell, mathMap));

        if (headers.length) {
          (token.rows || []).forEach((row: unknown[], rowIndex: number) => {
            const cells = row.map((cell) => getTableCellText(cell, mathMap)).filter(Boolean);
            if (cells.length) {
              lines.push(`${getOrdinal(rowIndex)} entry:`);
              cells.forEach((cellText, cellIndex) => {
                const header = headers[cellIndex];
                const cellDescription = header ? `${header}: ${cellText}` : cellText;
                lines.push(finalizeSentence(cellDescription));
              });
              lines.push('');
            }
          });
        }
        break;
      }
      case 'code': {
        const language = token.lang ? ` in ${token.lang}` : '';
        lines.push(`Code block${language} omitted.`);
        break;
      }
      case 'html': {
        break;
      }
      case 'hr': {
        lines.push('');
        lines.push('');
        break;
      }
      default: {
        if (token.text) {
          const text = normalizeInlineText(token.text, mathMap);
          if (text) {
            lines.push(text);
          }
        }
        break;
      }
    }
  }

  return lines;
}

/**
 * Convert markdown into a speech-friendly string with semantic cues.
 */
export function markdownToSpeechText(text: string): string {
  if (!text) return '';

  const { text: withPlaceholders, map } = replaceMathWithPlaceholders(text);
  const tokens = marked.lexer(withPlaceholders, { gfm: true, breaks: false });
  const lines = tokensToSpeech(tokens as Array<Record<string, any>>, map);

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
