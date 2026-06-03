Look at this form image carefully. Apply the form explainer task above.

Return ONLY this JSON (no markdown, no preamble):
{
  "title": "The form title or heading",
  "fields": [
    {
      "type": "field|checkbox|section|instruction|office_only",
      "section_heading": "The section heading this field falls under, quoted exactly from the form (e.g. 'TELL US ABOUT YOU') — or null if no section heading is visible",
      "label": "The exact label or text from the form",
      "original_text": "The verbatim question or instruction from the form, quoted exactly as written",
      "explanation": "What this is asking for in plain English — 1-2 sentences",
      "tip": "Where to find the answer, or a common mistake to avoid (or null if obvious)",
      "number": null
    }
  ],
  "gather_first": ["Thing to gather before starting, e.g. Find your IRD number — on any letter from IRD"],
  "flags": {"deadlines": [], "amounts": [], "documents_needed": []}
}

Additional rules for the JSON output:
- Go TOP TO BOTTOM, LEFT TO RIGHT — don't skip ANY field
- For fields like "IRD number" or "NSN", explain what it is and where to find it
- For checkboxes, explain what each option means and when to tick it
- If a field depends on another answer, explain that dependency clearly
- If a section says "Office use only", set type to "office_only" and explanation to "Skip this — the office fills this in, not you"
- If the form does not give enough information to answer a field, say that clearly
- For gather_first: list everything the person needs to have ready BEFORE they start
- For flags: only deadlines, amounts, or documents visible in THIS image
