import vscode from 'vscode'
import { ApiList } from './views/api-list'
import { ApiLocal } from './views/api-local'

import { WORKSPACE_PATH, localize } from './tools'
import { registerCommonCommands, registerListCommands, registerLocalCommands } from './commands'

export function activate(ctx: vscode.ExtensionContext) {
  global.ctx = ctx
  if (!WORKSPACE_PATH) {
    vscode.window.showWarningMessage(localize.getLocalize('text.noWorkspace'))
  }
  const apiList = new ApiList()
  const apiLocal = new ApiLocal()
  registerCommonCommands()
  registerListCommands(apiList)
  registerLocalCommands(apiLocal)
  vscode.window.registerTreeDataProvider('view.list', apiList)
  // vscode.window.registerTreeDataProvider('view.local', apiGroup)
}

export function deactivate() {
  // this method is called when your extension is deactivated
}
