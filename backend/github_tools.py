import subprocess, json, os, shlex

def _run(cmd, timeout=60):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, shell=True)
        if r.returncode == 0:
            return {"success": True, "output": r.stdout.strip()}
        return {"success": False, "error": r.stderr.strip() or r.stdout.strip()}
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Command timed out"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def list_repos(owner=None):
    arg = f"--owner {shlex.quote(owner)}" if owner else ""
    return _run(f"gh repo list {arg} --json name,description,url,isPrivate,updatedAt,stargazerCount --limit 50")

def create_repo(name, description="", private=False, auto_init=False):
    vis = "--private" if private else "--public"
    init = "--clone" if auto_init else ""
    return _run(f"gh repo create {shlex.quote(name)} {vis} --description {shlex.quote(description)} {init}")

def push_file(repo, path, content, message="Update via SODA"):
    import tempfile, base64
    with tempfile.TemporaryDirectory() as tmp:
        _run(f"gh repo clone {shlex.quote(repo)} {shlex.quote(tmp)}", timeout=30)
        file_path = os.path.join(tmp, path)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w") as f:
            f.write(content)
        _run(f"git -C {shlex.quote(tmp)} add {shlex.quote(path)}", timeout=10)
        _run(f"git -C {shlex.quote(tmp)} commit -m {shlex.quote(message)}", timeout=10)
        return _run(f"git -C {shlex.quote(tmp)} push", timeout=30)

def create_pr(repo, title, body="", head="", base="main"):
    h = f"--head {shlex.quote(head)}" if head else ""
    return _run(f"gh pr create --repo {shlex.quote(repo)} --title {shlex.quote(title)} --body {shlex.quote(body)} {h} --base {shlex.quote(base)}")

def list_prs(repo, state="open"):
    return _run(f"gh pr list --repo {shlex.quote(repo)} --state {state} --json number,title,headRefName,baseRefName,state,url,updatedAt")

def list_issues(repo, state="open"):
    return _run(f"gh issue list --repo {shlex.quote(repo)} --state {state} --json number,title,state,url,updatedAt")

def create_issue(repo, title, body=""):
    return _run(f"gh issue create --repo {shlex.quote(repo)} --title {shlex.quote(title)} --body {shlex.quote(body)}")

def get_repo(repo):
    return _run(f"gh repo view {shlex.quote(repo)} --json name,description,url,isPrivate,defaultBranch,updatedAt,stargazerCount")

def run_action(repo, workflow, ref="main"):
    return _run(f"gh workflow run {shlex.quote(workflow)} --repo {shlex.quote(repo)} --ref {shlex.quote(ref)}")
