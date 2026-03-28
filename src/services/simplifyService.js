/**
 * simplifyService.js
 * 
 * WHAT THIS DOES:
 * Replaces complex Hindi words with simpler ones for children.
 * Breaks text into smaller, more readable chunks.
 * COMPLETELY OFFLINE. No AI models, no downloads.
 */

export function simplifyText(text) {
  if (!text) return '';

  let simplified = text;

  // Normalize spacing
  simplified = simplified.replace(/\s+/g, ' ').trim();

  // Break into readable lines after each full stop
  simplified = simplified.replace(/।/g, '।\n');

  // Replace complex Hindi words with child-friendly synonyms
  const replacements = {
    'अतः': 'इसलिए',
    'किन्तु': 'लेकिन',
    'तथा': 'और',
    'प्रथम': 'पहला',
    'द्वितीय': 'दूसरा',
    'यद्यपि': 'हालांकि',
    'स्वयं': 'खुद',
    'शीघ्र': 'जल्दी',
    'अपेक्षित': 'चाहिए',
    'प्रयास': 'कोशिश'
  };

  Object.keys(replacements).forEach(key => {
    simplified = simplified.replace(new RegExp(key, 'g'), replacements[key]);
  });

  // Limit output size to keep it manageable for a child
  if (simplified.length > 300) {
    simplified = simplified.slice(0, 300) + '...';
  }

  return simplified;
}
