# Assessment Audit

A lightweight, reproducible toolkit for reviewing the quality of a coding-assessment dataset.

It discovers tasks automatically, executes delivered tests for the reference and model implementations, compares results with `EvalTasks.xlsx`, validates rubric structure and supported scoring arithmetic, and screens for test-quality concerns.

## Requirements

- Windows PowerShell 5.1+ or PowerShell 7
- Python 3.10+ with `pip` and `venv`
- The original assessment folder containing:
  - `EvalTasks.xlsx`
  - `ExpertGuidelines.pdf`
  - `README_TakeHomeAssessment.pdf`
  - `Data\`

The original assessment dataset is not included in this package.

**Execution safety:** supplied implementations and tests run with your account’s permissions. Native execution is not a security sandbox. Use a standard-user shell in a disposable VM without credentials or sensitive files.

## First run

Extract the ZIP and open PowerShell in the folder containing `run-audit.ps1`.

```powershell
.\run-audit.ps1 -Setup -AssessmentRoot 'C:\path\to\assessment'
```

Replace the path with the original assessment root.

`-Setup` creates a local `.venv` and installs the pinned dependencies from `requirements.txt`. When prompted, type `RUN` to authorize execution.

## Subsequent runs

```powershell
.\run-audit.ps1 -AssessmentRoot 'C:\path\to\assessment'
```

No task IDs, predefined findings or review notes are required. Newly added tasks are discovered using the documented workbook and directory structure.

To inspect sources without executing assessment implementations or tests:

```powershell
.\run-audit.ps1 -Setup -StaticOnly -AssessmentRoot 'C:\path\to\assessment'
```

After setup, omit `-Setup`.

## Outputs

Read the reports in this order:

| File | Purpose |
|---|---|
| `outputs\latest\summary.md` | Run completeness, review queue and per-task coverage. |
| `outputs\latest\findings.csv` | Specific task-linked concerns, engineering impact, evidence and review steps. |
| `outputs\latest\results.json` | Detailed measurements, observations and provenance. |
| `outputs\latest\logs\` | Stage records, execution logs and generated experiment evidence. |

Previous runs are preserved under `outputs\runs`. Original assessment files are not intentionally modified; source hashes are checked for changes.

## What is checked

- Task/file inventory, source hashes and missing dependencies.
- Delivered test execution for reference/A/B/C, with separate processes, timeouts and implementation identity checks.
- Observed versus recorded test counts.
- Rubric JSON/schema and supported scoring arithmetic.
- Generic source patterns involving example-only tests, example-specific lookup tables, ordering assumptions, parser validation and contract/rubric concerns.
- Supported literal prompt examples, replayed separately from the delivered baseline.

Generated experiments never replace baseline results.

## Interpreting results

Findings are candidates for review, not automatically confirmed defects.

- Ordinary model test failures are measurements, not dataset issues by themselves.
- Collection errors and other execution blockers mean unavailable results, not correctness zero.
- Source-only concerns are distinguished from reproduced prompt-example failures.
- Unsupported analysis and incomplete coverage are reported explicitly.
- Passing tests do not establish complete semantic correctness.

The toolkit does not invent subjective rubric awards or guarantee discovery of every dataset defect.

## Exit codes

| Code | Meaning |
|---:|---|
| 0 | Enabled checks completed without actionable candidates. |
| 1 | Completed with candidate findings. |
| 2 | Partial or blocked checks, including static-only runs. |
| 3 | Configuration, dependency, execution-tool or publication error. |
| 130 | Interrupted; inspect preserved partial evidence. |

For the supplied dataset, task `40291` may fail collection because `test_utils` is unavailable. An exit code of 2 does not necessarily mean the toolkit malfunctioned; inspect the summary and logs.

## Regenerate an existing report

After a run has produced `outputs\latest`:

```powershell
.\run-audit.ps1 -ReportOnly -AssessmentRoot 'C:\path\to\assessment'
```

This reuses recorded evidence without executing assessment code. It does not perform new checks or repair unavailable evaluations.

## Toolkit tests

After dependency setup:

```powershell
.\.venv\Scripts\python.exe -m pytest -q .\tests -p no:cacheprovider
```

The tests use trusted synthetic fixtures, including separate-process execution. They do not execute the original assessment dataset.

## Package layout

- `audit\` — audit implementation and reporting.
- `tests\` — synthetic regression tests.
- `prompts\` — retained prompts; the reconstruction prompt summarizes the intended design, not the complete development history.
- `validation\` — historical validation receipts, not proof of a new dataset run.
- `run-audit.ps1` — single entry point.
- `audit-config.json` — portable configuration.
- `requirements.txt` — pinned direct dependencies.