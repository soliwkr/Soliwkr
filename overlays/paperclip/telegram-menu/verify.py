#!/usr/bin/env python3
"""Read-only pin/hash/applicability check. Does not install or contact a provider."""
import hashlib,json,pathlib,subprocess,sys
here=pathlib.Path(__file__).resolve().parent
root=pathlib.Path(sys.argv[1]).resolve()
base=json.loads((here/'base.json').read_text())
sha=subprocess.check_output(['git','-C',str(root),'rev-parse','HEAD'],text=True).strip()
if sha!=base['sha']: raise SystemExit('FAIL: unexpected upstream SHA '+sha)
for name, expected in base['sha256'].items():
 if hashlib.sha256((root/name).read_bytes()).hexdigest()!=expected: raise SystemExit('FAIL: modified base '+name)
subprocess.run(['git','-C',str(root),'apply','--check',str(here/'menu.patch')],check=True)
print('PASS: exact upstream pin, base hashes and git apply --check')
