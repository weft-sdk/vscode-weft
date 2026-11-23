import * as vscode from "vscode"
import { formatWeft } from "./format"

function weftPath(): string {
  return vscode.workspace.getConfiguration("weft").get<string>("path") || "weft"
}

/** Runs a `weft` command in a terminal at the workspace folder, where its output and exit code are visible. */
function runInTerminal(args: string): void {
  const folder = vscode.workspace.workspaceFolders?.[0]
  const terminal = vscode.window.createTerminal({ name: "Weft", cwd: folder?.uri })
  terminal.show()
  terminal.sendText(`${weftPath()} ${args}`)
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider("weft", {
      async provideDocumentFormattingEdits(document) {
        const text = document.getText()
        try {
          const formatted = await formatWeft(text, weftPath())
          if (formatted === text) return []
          const whole = new vscode.Range(document.positionAt(0), document.positionAt(text.length))
          return [vscode.TextEdit.replace(whole, formatted)]
        } catch (error) {
          void vscode.window.showErrorMessage(`weft fmt: ${(error as Error).message}`)
          return []
        }
      },
    }),
    vscode.commands.registerCommand("weft.gen", () => runInTerminal("gen")),
    vscode.commands.registerCommand("weft.check", () => runInTerminal("check")),
    vscode.commands.registerCommand("weft.fmt", () => runInTerminal("fmt")),
  )
}

export function deactivate(): void {}
