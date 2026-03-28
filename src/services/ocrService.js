/**
 * ocrService.js
 *
 * WHAT THIS DOES:
 * 1. Takes the photo file path from the camera
 * 2. Sharpens the image (makes text clearer for recognition)
 * 3. Passes it to ML Kit which reads the text completely on-device
 * 4. Returns the extracted text string
 *
 * WHY IMAGE SHARPENING:
 * Phone cameras in poor lighting produce blurry photos.
 * Resizing to a standard size + keeping quality=90 makes
 * text edges sharper which dramatically improves OCR accuracy.
 * Think of it like adjusting focus before reading.
 *
 * WHY ML KIT:
 * Google trained ML Kit on millions of Hindi documents.
 * It understands Devanagari script natively.
 * After first app install, zero internet ever needed.
 */

import TextRecognition from '@react-native-ml-kit/text-recognition';
import ImageResizer from 'react-native-image-resizer';

function detectHindi(text) {
  if (!text) return false;
  return /[\u0900-\u097F]/.test(text);
}

function isWeakText(text) {
  return !text || text.length < 8;
}

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getScore(text) {
  if (!text) return 0;
  const hindiChars = (text.match(/[\u0900-\u097F]/g) || []).length;
  return hindiChars;
}

function processBlocks(result) {
  let finalText = '';
  if (result.blocks && result.blocks.length > 0) {
    // Sort blocks: Primary sort by Top (Y), secondary sort by Left (X)
    const sortedBlocks = result.blocks.sort((a, b) => {
      const yDiff = a.frame.top - b.frame.top;
      if (Math.abs(yDiff) > 25) return yDiff;
      return a.frame.left - b.frame.left;
    });

    sortedBlocks.forEach((block, index) => {
      const blockText = block.text;
      if (!blockText || blockText.length < 2) return;

      console.log(`[BLOCK ${index}]`, blockText);

      // 🟡 FILTER ONLY HINDI BLOCKS
      if (detectHindi(blockText)) {
        finalText += blockText + '\n';
      }
    });
  }
  return cleanText(finalText);
}

/**
 * Main function — call this with a photo path, get text back
 * @param {string} imagePath - local file path from camera
 * @returns {string} - extracted Hindi/Punjabi text
 */
export async function extractTextFromImage(imagePath) {
  try {
    const uri = `file://${imagePath}`;
    console.log('[OCR] Processing image:', uri);

    // 🔵 PASS 1: Original image
    const result1 = await TextRecognition.recognize(uri);
    console.log('[OCR] PASS 1 Blocks count:', result1.blocks?.length || 0);

    // 🔵 PASS 2: Resized high-quality image
    const processedImage = await ImageResizer.createResizedImage(
      uri,
      1200,
      1600,
      'JPEG',
      100, // Highest quality
      0
    );
    const result2 = await TextRecognition.recognize(processedImage.uri);
    console.log('[OCR] PASS 2 Blocks count:', result2.blocks?.length || 0);

    // Extract Hindi-only blocks
    let text1 = processBlocks(result1);
    let text2 = processBlocks(result2);

    // 🔴 FALLBACK: if no Hindi detected, use full raw text
    if (!text1 || text1.length < 5) {
      console.log('[OCR] Pass 1: No strong Hindi detected in blocks, using raw text fallback');
      text1 = cleanText(result1.text);
    }
    if (!text2 || text2.length < 5) {
      console.log('[OCR] Pass 2: No strong Hindi detected in blocks, using raw text fallback');
      text2 = cleanText(result2.text);
    }

    // 🟡 SELECT BEST RESULT
    let bestText = getScore(text2) > getScore(text1) ? text2 : text1;
    console.log('[ML KIT BEST]', bestText);

    if (!bestText || bestText.length < 3) {
      console.warn('[OCR] No significant text found in image');
      return null;
    }

    // STEP 4: Final clean
    bestText = cleanText(bestText);

    console.log('[OCR] Final length:', bestText.length);
    console.log('[OCR FINAL]', bestText);

    return bestText;

  } catch (error) {
    console.error('[OCR ERROR]', error);
    throw new Error('Could not read text properly');
  }
}
