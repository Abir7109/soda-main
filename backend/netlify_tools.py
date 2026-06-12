import subprocess, json, os, shlex

def _run(cmd, timeout=120):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, shell=True)
        if r.returncode == 0:
            out = r.stdout.strip()
            if out:
                try:
                    data = json.loads(out)
                    return {"success": True, "data": data}
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
        return r.stdout.strip() if r.returncode == 0 else None
    except:
        return None

def list_sites():
    return _run("netlify sites:list --json")

def get_site(site_id_or_name):
    return _run(f"netlify api getSite --data '{json.dumps({'site_id': site_id_or_name})}'")

def deploy(path=".", prod=False, message=""):
    cmd = f"netlify deploy --json --dir {shlex.quote(path)}"
    if prod:
        cmd += " --prod"
    if message:
        cmd += f" --message {shlex.quote(message)}"
    return _run(cmd, timeout=300)

def create_site(name=None):
    cmd = "netlify sites:create --json"
    if name:
        cmd += f" --name {shlex.quote(name)}"
    return _run(cmd)

def delete_site(site_id):
    return _run(f"netlify sites:delete {shlex.quote(site_id)}")

def list_deploys(site_id):
    return _run(f"netlify api listSiteDeploys --data '{json.dumps({'site_id': site_id, 'per_page': 20})}'")

def get_deploy(deploy_id):
    return _run(f"netlify api getDeploy --data '{json.dumps({'deploy_id': deploy_id})}'")

def set_env(site_id, key, value):
    return _run(f"netlify api createEnvVar --data '{json.dumps({'site_id': site_id, 'key': key, 'values': [{'value': value, 'context': 'all'}]})}'")

def get_logs(site_id, deploy_id):
    return _run(f"netlify api getDeploy --data '{json.dumps({'deploy_id': deploy_id})}'")
