#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TOOL_NAME_MAP = new Map([
  ['functions.shell_command', 'Bash'],
  ['shell_command', 'Bash'],
  ['apply_patch', 'MultiEdit'],
  ['replace_content', 'Edit'],
  ['replace_symbol_body', 'Edit'],
  ['insert_before_symbol', 'Edit'],
  ['insert_after_symbol', 'Edit'],
  ['rename_symbol', 'Edit'],
  ['safe_delete_symbol', 'Edit'],
  ['create_text_file', 'Write'],
  ['read_file', 'Read'],
  ['list_dir', 'Glob'],
  ['find_file', 'Glob'],
  ['search_for_pattern', 'Grep']
]);

function normalizeToolName(toolName) {
  if (typeof toolName !== 'string' || toolName.length === 0) {
    return toolName;
  }

  const shortName = toolName.includes('.') ? toolName.split('.').pop() : toolName;
  return TOOL_NAME_MAP.get(toolName) || TOOL_NAME_MAP.get(shortName) || toolName;
}

function normalizePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  const normalized = { ...payload };
  normalized.tool_name = normalizeToolName(payload.tool_name || payload.tool);

  if (!normalized.tool_input && payload.args && typeof payload.args === 'object') {
    normalized.tool_input = payload.args;
  }

  if (normalized.tool_input && typeof normalized.tool_input === 'object') {
    normalized.tool_input = normalizeToolInput(normalized.tool_input);
  }

  if (!normalized.cwd) {
    normalized.cwd = process.cwd();
  }

  return normalized;
}

function normalizeToolInput(toolInput) {
  const normalized = { ...toolInput };

  if (!normalized.file_path && typeof normalized.relative_path === 'string') {
    normalized.file_path = normalized.relative_path;
  }

  if (!normalized.path && typeof normalized.relative_path === 'string') {
    normalized.path = normalized.relative_path;
  }

  if (!normalized.path && typeof normalized.relativePath === 'string') {
    normalized.path = normalized.relativePath;
  }

  if (typeof normalized.command === 'string') {
    normalized.command = normalizeShellCommand(normalized.command);
  }

  return normalized;
}

function normalizeShellCommand(command) {
  const replacements = [
    [/^\s*Get-ChildItem\b/i, 'ls'],
    [/^\s*gci\b/i, 'ls'],
    [/^\s*dir\b/i, 'ls'],
    [/^\s*Get-Content\b/i, 'cat'],
    [/^\s*gc\b/i, 'cat'],
    [/^\s*Set-Location\b/i, 'cd'],
    [/^\s*cd\b/i, 'cd'],
    [/^\s*Remove-Item\b/i, 'rm'],
    [/^\s*rm\b/i, 'rm'],
    [/^\s*Copy-Item\b/i, 'cp'],
    [/^\s*cp\b/i, 'cp'],
    [/^\s*Move-Item\b/i, 'mv'],
    [/^\s*mv\b/i, 'mv'],
    [/^\s*New-Item\b/i, 'touch']
  ];

  for (const [pattern, replacement] of replacements) {
    if (pattern.test(command)) {
      return command.replace(pattern, replacement);
    }
  }

  return command;
}

function main() {
  const hookPathArg = process.argv[2];
  if (!hookPathArg) {
    console.error('Usage: run-claude-hook.cjs <hook-script>');
    process.exit(2);
  }

  const hookPath = path.resolve(process.cwd(), hookPathArg);
  const stdin = fs.readFileSync(0, 'utf8');
  let payload = {};

  try {
    payload = stdin.trim() ? JSON.parse(stdin) : {};
  } catch {
    payload = {};
  }

  const result = spawnSync(process.execPath, [hookPath], {
    input: JSON.stringify(normalizePayload(payload)),
    cwd: payload.cwd || process.cwd(),
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  process.exit(result.status ?? 0);
}

main();
