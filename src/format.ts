import { execFile } from "node:child_process"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

/**
 * Formats Weft source with `weft fmt`. The command rewrites files in place and has no standard-input mode, so the
 * text goes through a temporary file. Rejects with the compiler's message when the source does not parse.
 */
export async function formatWeft(source: string, weftPath = "weft"): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "weft-fmt-"))
  const file = join(dir, "document.weft")
  try {
    await writeFile(file, source)
    await new Promise<void>((resolve, reject) => {
      execFile(weftPath, ["fmt", file], (error, _stdout, stderr) => {
        if (error) reject(new Error(stderr.trim() || error.message))
        else resolve()
      })
    })
    return await readFile(file, "utf8")
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}
