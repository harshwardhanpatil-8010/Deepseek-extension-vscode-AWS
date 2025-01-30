"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
function activate(context) {
    console.log('Extension activated');
    const disposable = vscode.commands.registerCommand('deepseek-ext.debug-code', () => {
        const panel = vscode.window.createWebviewPanel('deepseek-ext', 'Deepseek Ext', vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = getWebviewContent();
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'chat') {
                const userPrompt = message.text;
                let responseText = '';
                try {
                    // ✅ CHANGED: Replaced local Ollama API with AWS-hosted Ollama URL
                    const awsOllamaURL = "http://your-aws-ip:11434/api/generate";
                    const requestBody = {
                        model: "deepseek-r1:1.5b",
                        prompt: userPrompt,
                        stream: false // Not using streaming for simplicity
                    };
                    const response = await fetch(awsOllamaURL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(requestBody)
                    });
                    const responseData = await response.json();
                    responseText = responseData.response;
                    panel.webview.postMessage({ command: "chatResponse", text: responseText });
                }
                catch (err) {
                    panel.webview.postMessage({ command: "chatResponse", text: `Error: ${String(err)}` });
                }
            }
        });
    });
    context.subscriptions.push(disposable);
}
function getWebviewContent() {
    return /*html*/ `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' vscode-resource:;">
        <title>Deepseek AI Chat</title>
        <style>
            body {
                font-family: 'Segoe UI', sans-serif;
                margin: 0;
                padding: 24px;
                background-color: var(--vscode-editor-background);
                display: flex;
                flex-direction: column;
                align-items: center;
                min-height: 100vh;
                color: var(--vscode-foreground);
            }

            .container {
                background: var(--vscode-editor-background);
                border: 1px solid var(--vscode-widget-border);
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                padding: 24px;
                width: 90%;
                max-width: 800px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            h1 {
                font-size: 20px;
                font-weight: bold;
                text-align: center;
            }

            textarea {
                width: 100%;
                padding: 12px;
                border: 1px solid var(--vscode-input-border);
                border-radius: 6px;
                font-size: 14px;
                background: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                resize: none;
                min-height: 100px;
            }

            button {
                padding: 12px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                cursor: pointer;
                font-weight: bold;
                text-transform: uppercase;
                transition: background 0.2s;
            }

            button:hover {
                background-color: var(--vscode-button-hoverBackground);
            }

            #response {
                border: 1px solid var(--vscode-input-border);
                border-radius: 6px;
                padding: 16px;
                background: var(--vscode-editor-background);
                font-size: 14px;
                color: var(--vscode-editor-foreground);
                min-height: 150px;
                max-height: 400px;
                overflow-y: auto;
                white-space: pre-wrap;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Deepseek AI Assistant</h1>
            <textarea id="prompt" placeholder="Ask anything..."></textarea>
            <button id="askBtn">Send</button>
            <div id="response"></div>
        </div>
        <script>
            const vscode = window.acquireVsCodeApi();
            document.getElementById('askBtn').addEventListener('click', () => {
                const text = document.getElementById('prompt').value;
                vscode.postMessage({ command: 'chat', text });
            });

            window.addEventListener('message', (event) => {
                const { command, text } = event.data;
                if (command === 'chatResponse') {
                    document.getElementById('response').innerText = text;
                }
            });
        </script>
    </body>
    </html>`;
}
function deactivate() { }
//# sourceMappingURL=extension.js.map