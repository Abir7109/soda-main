import subprocess, json, os, shlex

def _run(cmd, timeout=120):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, shell=True)
        if r.returncode == 0:
            out = r.stdout.strip()
            if out:
                try:
                    return {"success": True, "data": json.loads(out.split("\n")[-1])}
                except json.JSONDecodeError:
                    return {"success": True, "output": out}
            return {"success": True, "output": ""}
        return {"success": False, "error": r.stderr.strip() or r.stdout.strip()}
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Command timed out"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def _run_raw(cmd, timeout=120):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, shell=True)
        if r.returncode == 0:
            return r.stdout.strip()
        return None
    except:
        return None

def list_projects():
    return _run(f"vercel project ls --json")

def deploy(path=".", name=None, prod=False):
    c = f"vercel --yes"
    if name:
        c += f" --name {shlex.quote(name)}"
    if prod:
        c += " --prod"
    return _run(c, timeout=300)

def list_deployments(project=None, limit=20):
    c = f"vercel list --json"
    if project:
        c += f" {shlex.quote(project)}"
    return _run(c, timeout=60)

def get_deployment(url_or_id):
    return _run(f"vercel inspect {shlex.quote(url_or_id)} --json")

def get_project(project):
    return _run(f"vercel project ls --json", timeout=30)

def set_env(project, key, value, env="production"):
    return _run(f"vercel env add {shlex.quote(key)} {shlex.quote(env)} <<< {shlex.quote(value)}")

def list_aliases(project=None):
    c = "vercel alias ls"
    if project:
        c += f" {shlex.quote(project)}"
    return _run(c)

def get_logs(deployment_url, limit=50):
    return _run(f"vercel logs {shlex.quote(deployment_url)} --json --limit {limit}")
