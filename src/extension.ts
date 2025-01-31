import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension activated');

    const disposable = vscode.commands.registerCommand('deepseek-ext.debug-code', () => {
        const panel = vscode.window.createWebviewPanel(
            'deepseek-ext',
            'Deepseek Ext',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = getWebviewContent();

        panel.webview.onDidReceiveMessage(async (message: any) => {
            if (message.command === 'chat') {
                const userPrompt = message.text;
                let responseText = '';
                
                try {
                    // ✅ CHANGED: Replaced local Ollama API with AWS-hosted Ollama URL
					const response = await fetch('http://65.0.71.97:11434/api/generate', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							model: 'deepseek-r1:1.1b',
							prompt: userPrompt,
							stream: true
						})
					});
					
                    const responseData = await response.json();
                    responseText = responseData.response;

                    panel.webview.postMessage({ command: "chatResponse", text: responseText });

                } catch (err) {
                    panel.webview.postMessage({ command: "chatResponse", text: `Error: ${String(err)}` });
                }
            }
        });
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(): string {
    return /*html*/`<!DOCTYPE html>
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

export function deactivate() {}
