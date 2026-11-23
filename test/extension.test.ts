import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { test } from "node:test"
import * as oniguruma from "vscode-oniguruma"
import * as vsctm from "vscode-textmate"
import { formatWeft } from "../src/format"

const root = join(__dirname, "..", "..")
const weft = process.env.WEFT_BIN || "weft"

test("formatWeft formats with the real weft binary", async () => {
  const out = await formatWeft("package p\ntype A{x:int}\n", weft)
  assert.equal(out, "package p\n\ntype A {\n  x: int\n}\n")
})

test("formatWeft rejects source that does not parse, with the compiler's words", async () => {
  await assert.rejects(formatWeft("package p\ntype A {\n", weft), /./)
})

async function tokenizer() {
  const wasm = readFileSync(join(root, "node_modules", "vscode-oniguruma", "release", "onig.wasm")).buffer
  await oniguruma.loadWASM(wasm as ArrayBuffer)
  const registry = new vsctm.Registry({
    onigLib: Promise.resolve({
      createOnigScanner: (patterns: string[]) => new oniguruma.OnigScanner(patterns),
      createOnigString: (s: string) => new oniguruma.OnigString(s),
    }),
    loadGrammar: async (scope) =>
      scope === "source.weft"
        ? vsctm.parseRawGrammar(readFileSync(join(root, "syntaxes", "weft.tmLanguage.json"), "utf8"), "weft.json")
        : null,
  })
  const loaded = await registry.loadGrammar("source.weft")
  assert.ok(loaded)
  const grammar = loaded
  return (line: string) => {
    const { tokens } = grammar.tokenizeLine(line, vsctm.INITIAL)
    return tokens.map((t) => ({ text: line.slice(t.startIndex, t.endIndex), scopes: t.scopes.slice(1) }))
  }
}

const scopeOf = (tokens: { text: string; scopes: string[] }[], text: string) =>
  tokens.find((t) => t.text === text)?.scopes.join(" ")

test("the grammar scopes declarations, types, routes and annotations", async () => {
  const tokenize = await tokenizer()
  assert.match(scopeOf(tokenize("package orders @version(\"1.0.0\")"), "orders") ?? "", /entity.name.namespace/)
  assert.match(scopeOf(tokenize("package orders @version(\"1.0.0\")"), "version") ?? "", /attribute-name/)
  assert.match(scopeOf(tokenize("type Order {"), "Order") ?? "", /entity.name.type/)
  assert.match(scopeOf(tokenize("  id: uuid"), "uuid") ?? "", /support.type.builtin/)
  assert.match(scopeOf(tokenize("  note?: string // optional"), "note") ?? "", /variable.other.property/)
  assert.match(scopeOf(tokenize("  note?: string // optional"), "// optional") ?? "", /comment.line/)
  assert.match(scopeOf(tokenize("/// An order."), "/// An order.") ?? "", /comment.block.documentation/)
  assert.match(scopeOf(tokenize("event order.placed: Order {"), "order.placed") ?? "", /entity.name.tag/)
  const route = tokenize("  POST \"/orders/{id}\" createOrder(body: CreateOrder) -> Order | OutOfStock")
  assert.match(scopeOf(route, "POST") ?? "", /http-method/)
  assert.match(scopeOf(route, "{id}") ?? "", /variable.parameter.path/)
  assert.match(scopeOf(route, "->") ?? "", /operator.arrow/)
  assert.match(scopeOf(route, "OutOfStock") ?? "", /entity.name.type/)
})
