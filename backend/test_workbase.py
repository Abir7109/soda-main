import sys
sys.path.insert(0, '.')
from workbase import Workbase
wb = Workbase()
projects = wb.list_projects()
print(f'Found {len(projects)} projects:')
for p in projects:
    print(f"  - {p['display_name']} ({p['status']})")
