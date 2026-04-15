#!/usr/bin/env python3
"""Python-first wrapper around Playwright CLI for low-token browser workflows."""

from __future__ import annotations

import argparse
import ast
import base64
import json
import os
import re
import shlex
import shutil
import subprocess
import sys
import time
from pathlib import Path

RESERVED_ALIASES = {
    "page": "page",
    "context": "page.context()",
    "browser": "page.context().browser()",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "mode",
        choices=["inspect", "repair", "state-save", "state-load", "cleanup", "flow-import", "flow-run"],
    )
    parser.add_argument("--url", help="Target URL.")
    parser.add_argument("--session", help="Named Playwright CLI session.")
    parser.add_argument("--browser", default="chrome", help="Browser channel for open.")
    parser.add_argument("--state-in", help="Path to a storage state file to load before navigation.")
    parser.add_argument("--state-out", help="Path to save storage state.")
    parser.add_argument("--output-dir", default="artifacts/browser", help="Artifact directory root.")
    parser.add_argument("--flow-dir", default="artifacts/browser/flows", help="Reusable flow directory root.")
    parser.add_argument("--recording", help="Path to a Playwright Python recording exported from CRX or codegen.")
    parser.add_argument("--flow", help="Path to an imported flow JSON file.")
    parser.add_argument("--flow-name", help="Logical name for an imported or executed flow.")
    parser.add_argument("--profile-dir", help="Persistent profile directory.")
    parser.add_argument("--console-min-level", default="warning", help="Minimum console level.")
    parser.add_argument("--repair-js", help="Optional Playwright code snippet for targeted repair.")
    parser.add_argument("--show-devtools", action="store_true", help="Open DevTools for live debugging.")
    parser.add_argument("--headed", action="store_true", help="Request headed mode on open.")
    parser.add_argument("--no-persistent", action="store_true", help="Disable persistent profile mode.")
    parser.add_argument("--retries", type=int, default=1, help="Retry count for repair mode.")
    parser.add_argument("--timeout", type=float, default=2.0, help="Seconds to wait after navigation or reload.")
    parser.add_argument("--dry-run", action="store_true", help="Print commands without executing them.")
    return parser.parse_args()


def slugify(value: str) -> str:
    clean = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()
    return clean or "default"


def resolve_cli() -> list[str]:
    override = os.getenv("PLAYWRIGHT_CLI_BIN")
    if override:
        return shlex.split(override)
    if shutil.which("playwright-cli"):
        return ["playwright-cli"]
    return ["npx", "-y", "@playwright/cli"]


def snake_to_camel(value: str) -> str:
    parts = value.split("_")
    if not parts:
        return value
    return parts[0] + "".join(part.capitalize() for part in parts[1:])


def map_playwright_name(value: str) -> str:
    explicit = {
        "get_by_role": "getByRole",
        "get_by_label": "getByLabel",
        "get_by_text": "getByText",
        "get_by_test_id": "getByTestId",
        "get_by_placeholder": "getByPlaceholder",
        "get_by_alt_text": "getByAltText",
        "get_by_title": "getByTitle",
        "frame_locator": "frameLocator",
        "wait_for_timeout": "waitForTimeout",
        "wait_for_load_state": "waitForLoadState",
        "wait_for_url": "waitForURL",
        "select_option": "selectOption",
        "set_input_files": "setInputFiles",
        "drag_to": "dragTo",
        "dblclick": "dblclick",
    }
    return explicit.get(value, snake_to_camel(value))


def render_js_key(value: str) -> str:
    mapped = map_playwright_name(value)
    if re.match(r"^[A-Za-z_$][A-Za-z0-9_$]*$", mapped):
        return mapped
    return json.dumps(mapped)


def js_object(pairs: list[tuple[str, str]]) -> str:
    rendered = [f"{key}: {value}" for key, value in pairs]
    return "{ " + ", ".join(rendered) + " }"


def python_node_to_js(node: ast.AST, source: str, aliases: dict[str, str]) -> str:
    if isinstance(node, ast.Await):
        return python_node_to_js(node.value, source, aliases)
    if isinstance(node, ast.Name):
        return aliases.get(node.id, RESERVED_ALIASES.get(node.id, node.id))
    if isinstance(node, ast.Constant):
        return json.dumps(node.value)
    if isinstance(node, ast.List):
        return "[" + ", ".join(python_node_to_js(item, source, aliases) for item in node.elts) + "]"
    if isinstance(node, ast.Tuple):
        return "[" + ", ".join(python_node_to_js(item, source, aliases) for item in node.elts) + "]"
    if isinstance(node, ast.Dict):
        pairs: list[tuple[str, str]] = []
        for key, value in zip(node.keys, node.values):
            if key is None:
                raise ValueError("Spread dict unpacking is not supported in recorder import")
            rendered_key = python_node_to_js(key, source, aliases)
            if rendered_key.startswith('"') and rendered_key.endswith('"'):
                rendered_key = render_js_key(rendered_key[1:-1])
            pairs.append((rendered_key, python_node_to_js(value, source, aliases)))
        return js_object(pairs)
    if isinstance(node, ast.Attribute):
        return f"{python_node_to_js(node.value, source, aliases)}.{map_playwright_name(node.attr)}"
    if isinstance(node, ast.Call):
        func_js = python_node_to_js(node.func, source, aliases)
        args_js = [python_node_to_js(arg, source, aliases) for arg in node.args]
        kw_pairs = [
            (render_js_key(keyword.arg), python_node_to_js(keyword.value, source, aliases))
            for keyword in node.keywords
            if keyword.arg
        ]
        method_name = None
        if isinstance(node.func, ast.Attribute):
            method_name = map_playwright_name(node.func.attr)

        rendered_args = list(args_js)
        if kw_pairs:
            if method_name == "getByRole" and len(rendered_args) <= 1:
                rendered_args.append(js_object(kw_pairs))
            else:
                rendered_args.append(js_object(kw_pairs))
        return f"{func_js}({', '.join(rendered_args)})"
    if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.USub):
        return "-" + python_node_to_js(node.operand, source, aliases)
    raise ValueError(f"Unsupported recorder node: {ast.dump(node, include_attributes=False)}")


def load_recorder_async_function(tree: ast.Module) -> ast.AsyncFunctionDef:
    for node in tree.body:
        if isinstance(node, ast.AsyncFunctionDef):
            return node
    raise ValueError("No async Playwright function found in recording")


def flow_paths(args: argparse.Namespace) -> tuple[Path, Path]:
    flow_dir = Path(args.flow_dir)
    if not args.dry_run:
        flow_dir.mkdir(parents=True, exist_ok=True)
    flow_name = args.flow_name or slugify(Path(args.recording or args.flow or "flow").stem)
    return flow_dir, flow_dir / f"{flow_name}.json"


def is_bootstrap_assignment(target: str) -> bool:
    return target in RESERVED_ALIASES or target == "playwright"


def is_teardown_step(source: str) -> bool:
    compact = re.sub(r"\s+", "", source)
    return compact in {
        "awaitpage.close()",
        "awaitcontext.close()",
        "awaitbrowser.close()",
    }


def extract_goto_url(step: dict[str, object]) -> str | None:
    source = str(step.get("source", ""))
    match = re.search(r'page\.goto\((?P<quote>"|\')(?P<url>.+?)(?P=quote)', source)
    if match:
        return match.group("url")
    js_expr = str(step.get("js", ""))
    match = re.search(r'page\.goto\((?P<quote>"|\')(?P<url>.+?)(?P=quote)', js_expr)
    if match:
        return match.group("url")
    return None


def import_recording(args: argparse.Namespace) -> dict[str, object]:
    if not args.recording:
        raise ValueError("--recording is required for flow-import")

    source_path = Path(args.recording)
    if not source_path.exists():
        raise FileNotFoundError(source_path)

    source = source_path.read_text(encoding="utf-8")
    tree = ast.parse(source)
    run_fn = load_recorder_async_function(tree)

    aliases: dict[str, str] = {}
    steps: list[dict[str, object]] = []
    unsupported: list[str] = []

    for stmt in run_fn.body:
        if isinstance(stmt, ast.Assign) and len(stmt.targets) == 1 and isinstance(stmt.targets[0], ast.Name):
            target = stmt.targets[0].id
            if is_bootstrap_assignment(target):
                continue
            try:
                aliases[target] = python_node_to_js(stmt.value, source, aliases)
            except ValueError:
                unsupported.append(ast.get_source_segment(source, stmt) or ast.dump(stmt))
            continue

        if isinstance(stmt, ast.Expr) and isinstance(stmt.value, ast.Await):
            original = (ast.get_source_segment(source, stmt) or "").strip()
            if original and is_teardown_step(original):
                continue
            try:
                js_expr = python_node_to_js(stmt.value.value, source, aliases)
            except ValueError:
                unsupported.append(ast.get_source_segment(source, stmt) or ast.dump(stmt))
                continue
            original = original or js_expr
            steps.append({"source": original.strip(), "js": js_expr})
            continue

        if isinstance(stmt, ast.Pass):
            continue

        unsupported.append(ast.get_source_segment(source, stmt) or ast.dump(stmt))

    flow_dir, flow_path = flow_paths(args)
    flow_name = flow_path.stem
    entry_url = None
    for step in steps:
        extracted = extract_goto_url(step)
        if extracted:
            entry_url = extracted
            break

    payload = {
        "name": flow_name,
        "recording": str(source_path),
        "entry_url": entry_url,
        "steps": steps,
        "unsupported": unsupported,
        "stats": {
            "supported_steps": len(steps),
            "unsupported_steps": len(unsupported),
        },
    }
    flow_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return {"flow": str(flow_path), "summary": payload, "flow_dir": str(flow_dir)}


def load_flow(args: argparse.Namespace) -> tuple[Path, dict[str, object]]:
    if args.flow:
        flow_path = Path(args.flow)
    elif args.recording:
        imported = import_recording(args)
        flow_path = Path(imported["flow"])
    else:
        raise ValueError("Provide --flow or --recording for flow-run")

    if not flow_path.exists():
        raise FileNotFoundError(flow_path)

    payload = json.loads(flow_path.read_text(encoding="utf-8"))
    return flow_path, payload


def build_flow_script(flow_steps: list[dict[str, object]]) -> str:
    lines = [
        "async page => {",
        "  const results = [];",
        "  try {",
    ]
    for index, step in enumerate(flow_steps):
        action = json.dumps(step["source"], ensure_ascii=False)
        js_expr = step["js"]
        lines.extend(
            [
                "    try {",
                f"      await ({js_expr});",
                f"      results.push({{ index: {index}, status: 'ok', action: {action} }});",
                "    } catch (error) {",
                f"      results.push({{ index: {index}, status: 'error', action: {action}, error: String(error) }});",
                "      throw error;",
                "    }",
            ]
        )
    lines.extend(
        [
            "    return JSON.stringify({ ok: true, results });",
            "  } catch (error) {",
            "    return JSON.stringify({ ok: false, results, error: String(error) });",
            "  }",
            "}",
        ]
    )
    return "\n".join(lines)


def run_cli(
    session: str | None,
    args: list[str],
    *,
    raw: bool = False,
    dry_run: bool = False,
    check: bool = True,
) -> str:
    cmd = resolve_cli()
    if session:
        cmd.append(f"-s={session}")
    cmd.extend(args)
    if raw:
        cmd.append("--raw")
    if dry_run:
        print("DRY-RUN:", " ".join(shlex.quote(part) for part in cmd))
        return ""
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if check and proc.returncode != 0:
        raise RuntimeError(proc.stderr.strip() or proc.stdout.strip() or "playwright-cli failed")
    return (proc.stdout or proc.stderr).strip()


def default_profile_dir(session: str) -> Path:
    return Path.home() / ".codex" / "tmp" / "architecture-browser-master" / session


def ensure_session(args: argparse.Namespace, output_dir: Path) -> tuple[str, Path]:
    session = slugify(args.session or args.url or "default")
    profile_dir = Path(args.profile_dir) if args.profile_dir else default_profile_dir(session)
    if not args.dry_run:
        output_dir.mkdir(parents=True, exist_ok=True)
        profile_dir.mkdir(parents=True, exist_ok=True)
    return session, profile_dir


def open_page(args: argparse.Namespace, session: str, profile_dir: Path) -> None:
    if not args.url:
        raise ValueError("--url is required for this mode")
    cli_args = ["open", args.url, f"--browser={args.browser}"]
    if args.headed:
        cli_args.append("--headed")
    if args.no_persistent:
        pass
    elif args.profile_dir:
        cli_args.append(f"--profile={profile_dir}")
    else:
        cli_args.append("--persistent")
    run_cli(session, cli_args, dry_run=args.dry_run)
    time.sleep(args.timeout)


def maybe_load_state(args: argparse.Namespace, session: str) -> None:
    if args.state_in:
        run_cli(session, ["state-load", args.state_in], dry_run=args.dry_run)


def maybe_save_state(args: argparse.Namespace, session: str, output_dir: Path) -> str | None:
    target = args.state_out or str(output_dir / "state.json")
    if args.mode in {"inspect", "repair", "state-save", "flow-run"}:
        run_cli(session, ["state-save", target], dry_run=args.dry_run)
        return target
    return None


def capture_page_meta(args: argparse.Namespace, session: str) -> dict[str, object]:
    script = """
async page => JSON.stringify({
  title: await page.title(),
  url: page.url(),
  readyState: await page.evaluate(() => document.readyState),
  timestamp: new Date().toISOString()
})
""".strip()
    raw = run_cli(session, ["run-code", script], raw=True, dry_run=args.dry_run)
    if args.dry_run or not raw:
        return {}
    return json.loads(raw)


def capture_screenshot(args: argparse.Namespace, session: str, output_dir: Path) -> str:
    target = output_dir / "page.png"
    script = """
async page => {
  const data = await page.screenshot({ fullPage: true, type: 'png' });
  return data.toString('base64');
}
""".strip()
    raw = run_cli(session, ["run-code", script], raw=True, dry_run=args.dry_run)
    if not args.dry_run and raw:
        target.write_bytes(base64.b64decode(raw))
    return str(target)


def capture_console(args: argparse.Namespace, session: str, output_dir: Path) -> str:
    target = output_dir / "console.log"
    output = run_cli(
        session,
        ["console", args.console_min_level],
        raw=True,
        dry_run=args.dry_run,
        check=False,
    )
    if not args.dry_run:
        target.write_text(output + ("\n" if output else ""), encoding="utf-8")
    return output


def capture_network(args: argparse.Namespace, session: str, output_dir: Path) -> str:
    target = output_dir / "network.log"
    output = run_cli(session, ["network"], raw=True, dry_run=args.dry_run, check=False)
    if not args.dry_run:
        target.write_text(output + ("\n" if output else ""), encoding="utf-8")
    return output


def start_debug_capture(args: argparse.Namespace, session: str, output_dir: Path) -> tuple[str, str]:
    trace_path = str(output_dir / "trace.zip")
    video_path = str(output_dir / "session.webm")
    run_cli(session, ["tracing-start"], dry_run=args.dry_run, check=False)
    run_cli(session, ["video-start", video_path], dry_run=args.dry_run, check=False)
    if args.show_devtools:
        run_cli(session, ["show"], dry_run=args.dry_run, check=False)
    return trace_path, video_path


def stop_debug_capture(args: argparse.Namespace, session: str, trace_path: str) -> None:
    run_cli(session, ["tracing-stop", trace_path], dry_run=args.dry_run, check=False)
    run_cli(session, ["video-stop"], dry_run=args.dry_run, check=False)


def detect_issues(console_output: str, network_output: str, page_meta: dict[str, object]) -> list[str]:
    issues: list[str] = []
    console_lower = console_output.lower()
    network_lower = network_output.lower()
    if "error" in console_lower or "exception" in console_lower:
        issues.append("console-errors")
    if re.search(r"\b(4\d\d|5\d\d)\b", network_lower):
        issues.append("network-errors")
    if page_meta.get("readyState") not in {None, "complete"}:
        issues.append("document-not-complete")
    return issues


def default_repair(args: argparse.Namespace, session: str) -> None:
    run_cli(session, ["reload"], dry_run=args.dry_run, check=False)
    time.sleep(args.timeout)


def custom_repair(args: argparse.Namespace, session: str) -> None:
    if args.repair_js:
        run_cli(session, ["run-code", args.repair_js], dry_run=args.dry_run, check=False)
        time.sleep(args.timeout)
    else:
        default_repair(args, session)


def write_summary(output_dir: Path, payload: dict[str, object], dry_run: bool) -> str:
    target = output_dir / "summary.json"
    if dry_run:
        print(json.dumps(payload, indent=2))
    else:
        target.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    return str(target)


def inspect(args: argparse.Namespace) -> int:
    output_dir = Path(args.output_dir)
    session, profile_dir = ensure_session(args, output_dir / (args.session or slugify(args.url or "default")))
    maybe_load_state(args, session)
    open_page(args, session, profile_dir)
    trace_path, video_path = start_debug_capture(args, session, output_dir / session)
    page_meta = capture_page_meta(args, session)
    screenshot_path = capture_screenshot(args, session, output_dir / session)
    console_output = capture_console(args, session, output_dir / session)
    network_output = capture_network(args, session, output_dir / session)
    state_path = maybe_save_state(args, session, output_dir / session)
    stop_debug_capture(args, session, trace_path)
    issues = detect_issues(console_output, network_output, page_meta)
    summary = {
      "mode": args.mode,
      "session": session,
      "url": args.url,
      "profile_dir": str(profile_dir),
      "screenshot": screenshot_path,
      "state": state_path,
      "trace": trace_path,
      "video": video_path,
      "page": page_meta,
      "issues": issues,
    }
    write_summary(output_dir / session, summary, args.dry_run)
    return 0


def repair(args: argparse.Namespace) -> int:
    output_dir = Path(args.output_dir)
    session, profile_dir = ensure_session(args, output_dir / (args.session or slugify(args.url or "default")))
    maybe_load_state(args, session)
    open_page(args, session, profile_dir)
    attempts: list[dict[str, object]] = []
    for attempt in range(args.retries + 1):
        trace_path, video_path = start_debug_capture(args, session, output_dir / session)
        page_meta = capture_page_meta(args, session)
        screenshot_path = capture_screenshot(args, session, output_dir / session)
        console_output = capture_console(args, session, output_dir / session)
        network_output = capture_network(args, session, output_dir / session)
        issues = detect_issues(console_output, network_output, page_meta)
        attempts.append(
            {
                "attempt": attempt,
                "page": page_meta,
                "issues": issues,
                "screenshot": screenshot_path,
                "trace": trace_path,
                "video": video_path,
            }
        )
        stop_debug_capture(args, session, trace_path)
        if not issues or attempt == args.retries:
            break
        custom_repair(args, session)
    state_path = maybe_save_state(args, session, output_dir / session)
    summary = {
        "mode": args.mode,
        "session": session,
        "url": args.url,
        "profile_dir": str(profile_dir),
        "state": state_path,
        "attempts": attempts,
        "repaired": not attempts[-1]["issues"],
    }
    write_summary(output_dir / session, summary, args.dry_run)
    return 0 if not attempts[-1]["issues"] else 1


def state_save(args: argparse.Namespace) -> int:
    output_dir = Path(args.output_dir)
    session, profile_dir = ensure_session(args, output_dir / (args.session or slugify(args.url or "default")))
    if args.url:
        maybe_load_state(args, session)
        open_page(args, session, profile_dir)
    state_path = maybe_save_state(args, session, output_dir / session)
    summary = {"mode": args.mode, "session": session, "state": state_path}
    write_summary(output_dir / session, summary, args.dry_run)
    return 0


def state_load(args: argparse.Namespace) -> int:
    output_dir = Path(args.output_dir)
    session, profile_dir = ensure_session(args, output_dir / (args.session or slugify(args.url or "default")))
    maybe_load_state(args, session)
    if args.url:
        open_page(args, session, profile_dir)
    summary = {"mode": args.mode, "session": session, "state_in": args.state_in}
    write_summary(output_dir / session, summary, args.dry_run)
    return 0


def cleanup(args: argparse.Namespace) -> int:
    output_dir = Path(args.output_dir)
    session, _profile_dir = ensure_session(args, output_dir / (args.session or slugify(args.url or "default")))
    run_cli(session, ["close"], dry_run=args.dry_run, check=False)
    run_cli(session, ["delete-data"], dry_run=args.dry_run, check=False)
    summary = {"mode": args.mode, "session": session, "deleted": True}
    write_summary(output_dir / session, summary, args.dry_run)
    return 0


def flow_import(args: argparse.Namespace) -> int:
    imported = import_recording(args)
    flow_path = Path(imported["flow"])
    payload = {
        "mode": args.mode,
        "recording": args.recording,
        "flow": str(flow_path),
        "stats": imported["summary"]["stats"],
        "unsupported": imported["summary"]["unsupported"],
        "entry_url": imported["summary"]["entry_url"],
    }
    if args.dry_run:
        print(json.dumps(payload, indent=2, ensure_ascii=False))
    else:
        flow_path.with_suffix(".summary.json").write_text(
            json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
    return 0


def flow_run(args: argparse.Namespace) -> int:
    output_dir = Path(args.output_dir)
    flow_path, flow_payload = load_flow(args)
    session_seed = args.session or args.flow_name or flow_payload.get("name") or flow_path.stem
    args.session = session_seed
    session, profile_dir = ensure_session(args, output_dir / slugify(session_seed))
    maybe_load_state(args, session)

    resolved_url = str(args.url or flow_payload.get("entry_url") or "about:blank")
    original_url = args.url
    args.url = resolved_url
    open_page(args, session, profile_dir)
    args.url = original_url

    flow_steps = list(flow_payload.get("steps", []))
    skipped_steps: list[str] = []
    if flow_steps:
        first_step_url = extract_goto_url(flow_steps[0])
        if first_step_url and first_step_url == resolved_url:
            skipped_steps.append("initial-goto")
            flow_steps = flow_steps[1:]

    trace_path, video_path = start_debug_capture(args, session, output_dir / session)
    flow_result_raw = run_cli(
        session,
        ["run-code", build_flow_script(flow_steps)],
        raw=True,
        dry_run=args.dry_run,
        check=False,
    )
    flow_result = {} if args.dry_run or not flow_result_raw else json.loads(flow_result_raw)
    page_meta = capture_page_meta(args, session)
    screenshot_path = capture_screenshot(args, session, output_dir / session)
    console_output = capture_console(args, session, output_dir / session)
    network_output = capture_network(args, session, output_dir / session)
    state_path = maybe_save_state(args, session, output_dir / session)
    stop_debug_capture(args, session, trace_path)
    issues = detect_issues(console_output, network_output, page_meta)
    if flow_result.get("ok") is False:
        issues = list(dict.fromkeys(issues + ["flow-errors"]))

    summary = {
        "mode": args.mode,
        "session": session,
        "url": resolved_url,
        "flow": str(flow_path),
        "profile_dir": str(profile_dir),
        "state": state_path,
        "trace": trace_path,
        "video": video_path,
        "screenshot": screenshot_path,
        "page": page_meta,
        "flow_result": flow_result,
        "issues": issues,
        "skipped_steps": skipped_steps,
        "stats": flow_payload.get("stats", {}),
        "unsupported": flow_payload.get("unsupported", []),
    }
    write_summary(output_dir / session, summary, args.dry_run)
    return 0 if not issues else 1


def main() -> int:
    args = parse_args()
    handlers = {
        "inspect": inspect,
        "repair": repair,
        "state-save": state_save,
        "state-load": state_load,
        "cleanup": cleanup,
        "flow-import": flow_import,
        "flow-run": flow_run,
    }
    try:
        return handlers[args.mode](args)
    except Exception as exc:  # pragma: no cover - CLI surface
        print(f"[browser_automator] {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
