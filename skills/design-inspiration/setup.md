# Connecting the browser

Pinterest, Behance, Dribbble and the curated galleries are read through the
user's own Chrome, using **Claude in Chrome**. That way Claude sees what the user
sees, including their Pinterest account, and never handles their passwords.

Walk the user through this one step at a time. After each step, re-check the
connection with Claude in Chrome's tab-context call.

Reference: https://code.claude.com/docs/en/chrome

## Requirements

- Claude Code signed in with `/login` on a Pro, Max, Team or Enterprise plan. An
  API key, Bedrock, Vertex AI or Foundry leaves browser tools off.
- Google Chrome (Edge and other Chromium browsers are listed in the Claude Code docs).
- It doesn't work under WSL.

## Steps

1. **Install the extension** from the Chrome Web Store
   (https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn)
   and sign in with the **same Claude account and organization** as Claude Code.
   Pin it from Chrome's puzzle-piece menu.
2. **Restart Chrome** after the first install, so it registers the connection to
   Claude Code.
3. **Turn it on in Claude Code:** run `/chrome` in the session (or start with
   `claude --chrome`). The panel should read *Enabled* and *Installed*. Choosing
   "Enabled by default" keeps it on for future sessions, at some extra context cost.
4. **Allow the site.** The first time Claude acts on pinterest.com (or another
   source), the extension asks for permission. Choose to always allow actions
   on that site. Approved sites can be reviewed and revoked later in the
   extension's settings.
5. **Sign in to Pinterest yourself** in the tab Claude opens. Claude never types
   passwords and waits until you're done.

## Troubleshooting

| Symptom | Fix |
|---|---|
| "Browser extension is not connected" | Usually the extension and Claude Code are on different accounts or organizations. Compare `/status` with the extension's sign-in, then restart Chrome and run `/chrome`. |
| Worked earlier, stopped mid-session | The extension went idle. Run `/chrome` → *Reconnect extension*. |
| "No browsers are connected" | Chrome is closed, the extension is signed out, or the network blocks `bridge.claudeusercontent.com`. |
| Several browsers or profiles | Use `/chrome` → *Select browser…* to pick one. |
| Commands hang | A page dialog (alert or confirm) is open. Dismiss it in Chrome, then continue. |

## Other runtimes

OpenCode, Gemini CLI and Codex CLI have no equivalent first-party way to drive
the user's own signed-in browser. There, the skill uses the sources that don't
need a browser (Awwwards, Fonts In Use) and says what the board is missing.
