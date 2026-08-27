# Agent Instructions

Project-specific guidance for AI coding agents. See `.claude/CLAUDE.md` for the full technical requirements and code style.

## Before committing

- Run the `caveman-review` skill on your changes and address its findings **before committing**.
- Run `pnpm check` and `pnpm lint`, and fix any issues (use `pnpm format` for formatting).

## Communication style

Use as few words as possible — in chat replies, PR descriptions, comments, and issues. Code comments: only when the name isn't self-explanatory, and keep them to one short line.

Write all user-facing text — chat replies, PR descriptions, comments, and issues — in plain language per ISO 24495-1:2023 (readers find what they need, understand it on first read, and can use it). This governs wording only; reasoning and analysis stay as thorough as the task needs.

Prefix any PR or issue comment you post with 🤖, so it's clear at a glance it's from an agent, not a human.
