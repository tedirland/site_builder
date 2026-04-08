export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

const MAX_HTML_LENGTH = 500_000;
const MAX_CSS_LENGTH = 100_000;

export function validateOutput(html: string, css: string): ValidationResult {
  const errors: string[] = [];

  if (html.length > MAX_HTML_LENGTH) {
    errors.push(`HTML exceeds max length of ${MAX_HTML_LENGTH} characters`);
  }
  if (css.length > MAX_CSS_LENGTH) {
    errors.push(`CSS exceeds max length of ${MAX_CSS_LENGTH} characters`);
  }

  if (!html.includes("<!DOCTYPE html>") && !html.includes("<!doctype html>")) {
    errors.push("HTML missing DOCTYPE declaration");
  }
  if (!html.includes("<html")) {
    errors.push("HTML missing <html> tag");
  }
  if (!html.includes("<head")) {
    errors.push("HTML missing <head> tag");
  }
  if (!html.includes("<body")) {
    errors.push("HTML missing <body> tag");
  }

  // XSS prevention: no script tags
  if (/<script[\s>]/i.test(html)) {
    errors.push("HTML contains <script> tags which are not allowed");
  }

  // Basic CSS bracket matching
  const openBrackets = (css.match(/{/g) || []).length;
  const closeBrackets = (css.match(/}/g) || []).length;
  if (openBrackets !== closeBrackets) {
    errors.push(
      `CSS has mismatched brackets: ${openBrackets} opening vs ${closeBrackets} closing`,
    );
  }

  return { valid: errors.length === 0, errors };
}
