/**
 * Utilities for handling markdown text
 */

import removeMd from 'remove-markdown';

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
