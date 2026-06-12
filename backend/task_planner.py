"""
Task planner — tracks multi-step task execution with TODO items.
Each plan has a list of tasks. Tasks can be pending/running/done/failed.
"""
import json, uuid, time
from datetime import datetime

class TaskPlanner:
    def __init__(self):
        self.active_plan = None
        self.history = []

    def create_plan(self, title, tasks):
        plan = {
            "id": str(uuid.uuid4())[:8],
            "title": title,
            "created_at": datetime.now().isoformat(),
            "tasks": [],
            "status": "running",
        }
        for i, t in enumerate(tasks):
            if isinstance(t, str):
                t = {"title": t}
            plan["tasks"].append({
                "id": str(uuid.uuid4())[:8],
                "index": i,
                "title": t.get("title", f"Step {i+1}"),
                "description": t.get("description", ""),
                "status": "pending",
                "result": None,
            })
        self.active_plan = plan
        self.history.append(plan)
        return self._dump()

    def update_task(self, task_id, status, result=None):
        if not self.active_plan:
            return {"error": "No active plan"}
        for task in self.active_plan["tasks"]:
            if task["id"] == task_id:
                task["status"] = status
                if result:
                    task["result"] = result
                # Check if all tasks done/failed
                all_terminal = all(
                    t["status"] in ("done", "failed") for t in self.active_plan["tasks"]
                )
                if all_terminal:
                    self.active_plan["status"] = "completed"
                return self._dump()
        return {"error": f"Task {task_id} not found"}

    def cancel_plan(self):
        if not self.active_plan:
            return {"error": "No active plan"}
        self.active_plan = None
        return {"status": "cancelled"}

    def get_plan(self):
        if not self.active_plan:
            return {"error": "No active plan"}
        return self._dump()

    def _dump(self):
        return {
            "id": self.active_plan["id"],
            "title": self.active_plan["title"],
            "status": self.active_plan["status"],
            "tasks": [
                {
                    "id": t["id"],
                    "index": t["index"],
                    "title": t["title"],
                    "description": t["description"],
                    "status": t["status"],
                    "result": t["result"],
                }
                for t in self.active_plan["tasks"]
            ],
        }

_planner = TaskPlanner()

def plan_tasks(title, tasks):
    return _planner.create_plan(title, tasks)

def update_task(task_id, status, result=None):
    return _planner.update_task(task_id, status, result)

def get_active_plan():
    return _planner.get_plan()

def cancel_plan():
    return _planner.cancel_plan()
