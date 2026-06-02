# Test: Rewrite must not drop conditions

## What this tests
The rewriter was compressing sentences that contain multiple conditions,
losing important rules in the process.

## Original text
```
You may be eligible for Jobseeker Support if you are aged 18 or over,
are a New Zealand citizen or permanent resident, are not in full-time
employment (working fewer than 30 hours per week), have been in New Zealand
for at least 2 years since becoming a citizen or permanent resident,
and are not receiving any other main benefit.
```

## Expected output must contain ALL of these conditions
1. Aged 18 or over
2. New Zealand citizen or permanent resident
3. Not in full-time employment
4. Working fewer than 30 hours per week
5. Been in New Zealand for at least 2 years since becoming a citizen or permanent resident
6. Not receiving any other main benefit

## Failure conditions
- Any condition missing = FAIL
- "30 hours" changed to a different number = FAIL
- "2 years" changed to a different timeframe = FAIL
- "18 or over" changed or dropped = FAIL
- Conditions combined into a vague summary (e.g. "meet certain criteria") = FAIL
- Advice added about whether the reader qualifies = FAIL
