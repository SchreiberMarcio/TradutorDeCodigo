const vscode = require('vscode');
const path = require('path');

//<------------------------------------ Define um glossário com as traduções das tags e símbolos ---------------------------->
const glossary = {
    'const': 'constante',
    'let': 'variável',
    'function': 'função',
    'async': 'assíncrona',
    'await': 'esperar',
    'return': 'retornar',
    'if': 'se',
    'else': 'senão',
    '<=': 'menor ou igual a',
    '||': 'ou',
    '+': 'mais',
    '-': 'menos',
    '*': 'vezes',
    '/': 'dividido por',
    '%': 'módulo de',
    '&&': 'e',
    '==': 'igual a',
    '===': 'igual a (estritamente)',
    '<': 'menor que',
    '>': 'maior que',
    '>=': 'maior ou igual a',
    '=': 'atribuição',
    '+=': 'adicionar e atribuir',
    '-=': 'subtrair e atribuir',
    '*=': 'multiplicar e atribuir',
    '/=': 'dividir e atribuir',
    '%=': 'atribuir o módulo de',
    '++': 'incrementar',
    '--': 'decrementar',
    'new': 'criar nova instância de',
    'class': 'classe',
    'extends': 'estender',
    'super()': 'chamada de super',
    'this': 'referência ao objeto atual',
    'static': 'estático',
    'get': 'obter',
    'set': 'definir',
    'constructor()': 'construtor',
    'prototype': 'protótipo',
    'import': 'importar',
    'export': 'exportar',
    'default': 'padrão',
    'from': 'de',
    'module.exports': 'exportar módulo',
    'require': 'requer',
    'Promise': 'Promessa',
    'resolve': 'resolver',
    'reject': 'rejeitar',
    'then': 'então',
    'catch': 'capturar',
    'finally': 'finalmente',
    'async function': 'função assíncrona',
    'await expression': 'aguardar expressão',
    'for': 'para',
    'while': 'enquanto',
    'do': 'faça',
    'switch': 'escolha',
    'case': 'caso',
    'break': 'pausa',
    'continue': 'continuar',
    'try': 'tentar',
    'throw': 'lançar',
    'typeof': 'tipo de',
    'instanceof': 'instância de',
    'delete': 'apagar',
    'in': 'em',
    'NaN': 'Não é um número',
    'undefined': 'indefinido',
    'null': 'nulo',
    'true': 'verdadeiro',
    'false': 'falso',
    'Infinity': 'Infinito',
    'Date': 'Data',
    'RegExp': 'Expressão Regular',
    'Error': 'Erro',
    'TypeError': 'Tipo de Erro',
    'SyntaxError': 'Erro de Sintaxe',
    'ReferenceError': 'Erro de Referência',
    'RangeError': 'Erro de Intervalo',
    'EvalError': 'Erro de Avaliação',
    'URIError': 'Erro de URI',
    'alert': 'alerta',
    'confirm': 'confirmar',
    'prompt': 'prompt',
    'document': 'documento',
    'window': 'janela',
    'localStorage': 'armazenamento local',
    'sessionStorage': 'armazenamento de sessão',
    'navigator': 'navegador',
    'setTimeout': 'definir tempo limite',
    'setInterval': 'definir intervalo',
    'clearTimeout': 'limpar tempo limite',
    'clearInterval': 'limpar intervalo',
    'addEventListener': 'adicionar evento',
    'removeEventListener': 'remover evento',
    'preventDefault': 'prevenir padrão',
    'stopPropagation': 'interromper propagação',
    'fetch': 'buscar',
    'XMLHttpRequest': 'Requisição XML',
    'FormData': 'Dados de Formulário',
    'FileReader': 'Leitor de Arquivo',
    'WebSocket': 'WebSocket',
    'useState': 'usarEstado',
    'useEffect': 'usarEfeito',
    'useContext': 'usarContexto',
    'useRef': 'usarRef',
    'useReducer': 'usarRedutor',
    'useCallback': 'usarRetornoDeChamada',
    'useMemo': 'usarMemorizar',
    'createContext': 'criarContexto',
    'Component': 'Componente',
    'PureComponent': 'Componente Puro',
    'Fragment': 'Fragmento',
    'forwardRef': 'encaminharRef',
    'memo': 'memorizar',
    'app': 'aplicativo',
    'res': 'resposta',
    'message': "mensagem",
    'req': 'requisição',
    'res': 'resposta',
    'parseInt': 'número inteiro',
    'error': 'Erro'
};

//<------------------------------------ Função de ativação ------------------------------------------------------------------> 
function activate(context) {
    console.log('Parabéns, sua extensão "TradutorDeCodigo" está agora ativa!');

    let disposable = vscode.commands.registerCommand('Traduza', async function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('Nenhum editor aberto');
            return;
        }

        const document = editor.document;
        if (document.languageId !== 'javascript' && document.languageId !== 'typescript') {
            vscode.window.showInformationMessage('Esta extensão suporta apenas JavaScript e TypeScript.');
            return;
        }

        const text = document.getText();
        const translatedText = translateText(text);

        updateWebViewWithTranslation(translatedText);
    });

    context.subscriptions.push(disposable);
}

//<------------------------------------ Função de tradução ------------------------------------------------------------------>
function translateText(text) {
    let translatedText = text;

//<-- Preserva o texto dentro de strings delimitadas por crases/graves (`` ` ``), aspas simples ('), ou aspas duplas (") ---->
    const regexStrings = /`(?:[^`\\]|\\.)*`|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g;
    const stringsToPreserve = text.match(regexStrings);

    if (stringsToPreserve) {
        // Substituir strings por marcadores temporários
        stringsToPreserve.forEach((str, index) => {
            const tempMarker = `__STRING_${index}__`;
            translatedText = translatedText.replace(str, tempMarker);
        });
    }

//<----------------------------------- Realiza a tradução para o restante do texto ----------------------------------------->
    
Object.keys(glossary).forEach(tag => {
        const regex = new RegExp(`\\b${escapeRegExp(tag)}\\b`, 'g');
        translatedText = translatedText.replace(regex, glossary[tag]);
    });

//<----------------------------------- Substitui marcadores temporários de strings de volta -------------------------------->
    if (stringsToPreserve) {
        stringsToPreserve.forEach((str, index) => {
            const tempMarker = `__STRING_${index}__`;
            translatedText = translatedText.replace(tempMarker, str);
        });
    }

//<----------------------------------- Substituições adicionais usando expressões regulares -------------------------------->
    translatedText = translatedText.replace(/\!==/g, ' não é igual a ');
    translatedText = translatedText.replace(/===/g, ' estritamente igual a ');
    translatedText = translatedText.replace(/!==/g, ' estritamente diferente de ');
    translatedText = translatedText.replace(/&&/g, ' e ');
    translatedText = translatedText.replace(/\|\|/g, ' ou ');
    translatedText = translatedText.replace(/!/g, ' não houver ');
    translatedText = translatedText.replace(/==/g, ' igual a ');
    translatedText = translatedText.replace(/!=/g, ' diferente de ');
    translatedText = translatedText.replace(/\+\+/g, ' adiciona +1 ');

    console.log('Texto traduzido:', translatedText);

    return translatedText;
}

//<------------------------------------ Configurações do painel lateral (WebView) ------------------------------------------->
function updateWebViewWithTranslation(translatedText) {
    console.log('Texto traduzido a ser exibido:', translatedText);

    const panel = vscode.window.createWebviewPanel(
        'es6Webview', // Identificador exclusivo da WebView
        'Tradução', // Título da WebView
        vscode.ViewColumn.Beside, // Localização da WebView (lateral)
        {
            enableScripts: true // Permite a execução de scripts na WebView
        }
    );

    panel.webview.html = getWebviewContent(translatedText);
}

//<------------------------------------ Configuração Regex do painel lateral (WebView) -------------------------------------->
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function getWebviewContent(translatedText) {
    const htmlPath = vscode.Uri.file(path.join(__dirname, 'webview', 'index.html'));
    const htmlContent = htmlPath.with({ scheme: 'vscode-resource' });
    
//<-------------------------------- Função para escapar caracteres especiais HTML ------------------------------------------->
    function escapeHtml(unsafe) {
        return unsafe.replace(/&/g, "&amp;")
                     .replace(/</g, "&lt;")
                     .replace(/>/g, "&gt;")
                     .replace(/"/g, "&quot;")
                     .replace(/'/g, "&#039;");
                    }

    const escapedTranslatedText = escapeHtml(translatedText);

    const themeName = vscode.workspace.getConfiguration().get('workbench.colorTheme');
    const cssFile = themeName ? `themes/${themeName.toLowerCase()}.css` : 'themes/default.css';

//<------------------------------- Corpo do WebView ------------------------------------------------------------------------>
    
    return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Tradutor ES6</title>
            <link rel="stylesheet" href="${htmlContent}/../${cssFile}">
        </head>
        <body>
            <h1>Aqui está o código traduzido</h1>
            <pre><code>${escapedTranslatedText}</code></pre>

            <script>
                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.command === 'translate') {
                        translateAndShowResult(message.text);
                    }
                });

                async function translateAndShowResult(inputText) {
                    const translation = translateText(inputText);
                    vscode.postMessage({ command: 'translatedText', text: translation });
                }
                const vscode = acquireVsCodeApi();
            </script>
        </body>
        </html>
    `;
}

//<------------------------------------ Função para desativar --------------------------------------------------------------->
function deactivate() {}

module.exports = {
    activate,
    deactivate
};

