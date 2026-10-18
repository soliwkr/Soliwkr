# Rebase this delivery patch

Do not apply to a different SHA with fuzz or silently skip hunks. Record the new observed upstream SHA, compare changes in native ingress, action transport, safe publication and provider effects, rebuild the patch against that exact SHA and regenerate base.json hashes. Rerun unit, native DB fixtures, typecheck, unauthorized/replay tests and mock transport tests; keep independent QA/runtime/Android NOT RUN until actually observed. Never change secrets or webhook ownership to make a test pass.

Verify the pristine base with verify.py before applying. `git apply --reverse --check menu.patch` can verify an already applied patch; it does not certify runtime behavior. Keep this overlay distinct from deployed build evidence.
