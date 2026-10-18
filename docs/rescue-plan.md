# Cash Rescue Planner and Decision Receipt

Approved scope: Topic E cash-flow decision support. Extend the existing forecast engine, not real payments or loan applications.

- Evaluate a bounded grid: one selected receivable at 0/25/50/75/100 percent (bounded by user consent assumption), one selected supplier bill delayed by 0/7/14/30 days (bounded by user input), and hypothetical loan principals on a visible CNY grid up to a cap. Show evaluated plan count and no global-optimum claim.
- Payroll/recurring obligations remain unchanged. Reserve constraint applies to every day including opening balance. Evaluate 90 days so repayment pressure is visible. Loan cost includes fees and scheduled interest; collection cost and supplier fee are user-entered assumptions. Plan states explicitly whether collection/supplier permission is assumed.
- Rank feasible plans lexicographically by borrowing principal, total known financing/action cost, then supplier delay. If no plan satisfies every day, label infeasible and show best residual gap; never invent an approval.
- Run collection-delay stress against the selected plan. Save a record/assumption/result snapshot in the business data only after confirmation. Receipt exports human-readable text and machine-readable JSON, including alternatives, limits and source records. Replay with current data is explicit and never mutates a saved decision.
- Add missing-information sensitivity: identify a receivable whose seven-day delay most worsens the baseline minimum balance, based on deterministic scenarios, without probability claims.
- Test constraints, no double collections, repayment effect, infeasibility, validation, exact saved receipts, stale data notices, replay and read-only UI. Then run all existing suites and publish preserving public access.
