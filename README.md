<div align="center">

<img src="https://raw.githubusercontent.com/weft-sdk/.github/main/profile/avatar.png" alt="Weft" width="72" height="72">

# Weft for VS Code

**Syntax highlighting, snippets and formatting for Weft contracts.**

[![CI](https://img.shields.io/github/actions/workflow/status/weft-sdk/vscode-weft/ci.yml?branch=main&label=CI&labelColor=111111&color=7d92ff)](https://github.com/weft-sdk/vscode-weft/actions)
[![License](https://img.shields.io/github/license/weft-sdk/vscode-weft?labelColor=111111&color=7d92ff)](LICENSE)

[**Weft**](https://github.com/weft-sdk/weft) &nbsp;·&nbsp;
[**Contract language**](https://github.com/weft-sdk/weft/blob/main/docs/02-contract-language.md) &nbsp;·&nbsp;
[**tree-sitter grammar**](https://github.com/weft-sdk/tree-sitter-weft)

</div>

<br>

This extension makes `.weft` files a first-class language in VS Code.

## Features

| | |
| --- | --- |
| **Syntax highlighting** | Declarations, types, built-in scalars, fields, routes with their HTTP methods and `{path}` parameters, events, annotations, doc comments and strings |
| **Formatting** | Format Document runs `weft fmt`, so the file is written in the one canonical style, and comments are kept |
| **Snippets** | `package`, `type`, `enum`, `error`, `event`, `http`, `route`, `rpc`, `graphql` and `socket` |
| **Editing** | Comment toggling, bracket matching, auto-closing pairs, indentation and folding of blocks |
| **Commands** | **Weft: Generate code**, **Weft: Check for breaking changes** and **Weft: Format contracts in the workspace**, run in a terminal at your workspace folder |

```weft
package orders @version("1.0.0")

/// An order placed by a customer.
type Order {
  id: uuid
  items: OrderItem[]
  total: Money
  note?: string
}

event order.placed: Order { key: id }

http /v1 {
  POST "/orders"      createOrder(body: CreateOrder) -> Order | OutOfStock
  GET  "/orders/{id}" getOrder(id: uuid) -> Order?
}
```

## Requirements

Formatting and the commands use the `weft` command line tool. Install it with:

```sh
cargo install --git https://github.com/weft-sdk/weft weft-cli --locked
```

If `weft` is not on your `PATH`, set **Weft: Path** in the settings to its full location.

## Settings

| Setting | Default | What it does |
| --- | --- | --- |
| `weft.path` | `weft` | The `weft` command line tool: a name on your `PATH`, or a full path |

## Develop

```sh
npm install
npm test            # builds, then runs the tests (set WEFT_BIN to a weft binary for the formatter tests)
npm run package     # writes vscode-weft-<version>.vsix
```

Press `F5` in VS Code to open a window with the extension loaded.

## License

[Apache License 2.0](LICENSE).
