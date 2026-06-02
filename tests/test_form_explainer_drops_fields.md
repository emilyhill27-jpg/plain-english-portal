# Test: Form explainer must not drop fields

## What this tests
The form explainer was dropping or merging fields from multi-page forms.
This test checks that every field from the original appears in the output.

## Original form text (simplified for testing)
```
SECTION A: YOUR DETAILS
1. Full name
2. Date of birth
3. IRD number
4. Phone number
5. Email address

SECTION B: YOUR INCOME
6. Are you currently employed? [ ] Yes [ ] No
7. If yes, employer name: ____________
8. Weekly gross income before tax: $____________
9. Do you receive any other income? [ ] Yes [ ] No
10. If yes, describe: ____________

SECTION C: DECLARATION
11. I declare that the information above is true and correct.
12. Signature: ____________
13. Date: ____________
```

## Expected output must contain
- All 13 fields explained, in order (1 through 13)
- Field 7 must explain the dependency on field 6 ("If you answered Yes above")
- Field 10 must explain the dependency on field 9
- "IRD number" must be defined (what it is and where to find it)
- "Weekly gross income before tax" must be explained (what "gross" means)
- The declaration must be explained (what you are agreeing to by signing)

## Failure conditions
- Any field missing from the output = FAIL
- Fields out of order = FAIL
- Fields 7 or 10 explained without mentioning the dependency = FAIL
- "IRD number" not defined = FAIL
- Advice given about what to write in any field = FAIL
