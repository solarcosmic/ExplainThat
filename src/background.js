function createContextMenu() {
    chrome.contextMenus.create({
        id: "explainThat",
        title: "ExplainThat!",
        contexts: ["selection"]
    });
    chrome.contextMenus.create({
        id: "explainThatPage",
        title: "ExplainThat! Page",
        contexts: ["page"]
    });
}

chrome.contextMenus.onClicked.addListener(contextChecker);
chrome.runtime.onStartup.addListener(createContextMenu);
chrome.runtime.onInstalled.addListener(createContextMenu);

function getResponse(content, callback) {
    fetch("https://ai.hackclub.com/chat/completions", {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
                "messages": [{"role": "user", "content": "[ONLY In Language: English (United Kingdom)] Please explain this thoroughly in 1-2 sentences, only the explanation: " + content}]
        })
    })
    .then(response => response.json())
    .then(data => {
        callback(data["choices"][0]["message"]["content"]);
    });
}

function contextChecker(inf, tab) {
    if (inf["menuItemId"] == "explainThat") {
        chrome.tabs.sendMessage(tab.id, {
            action: "ExplainThat_initWindowFrame"
        });
        getResponse(inf["selectionText"], (responseText) => {
            chrome.tabs.sendMessage(tab.id, {
                action: "ExplainThat_sendResponseText",
                responseText: responseText
            });
        });
    } else if (inf["menuItemId"] == "explainThatPage") {
        chrome.tabs.sendMessage(tab.id, {
            action: "ExplainThat_initWindowFrame",
            preset_text: "Reading page...",
            disclaimer_text: "Page generation is experimental."
        });
        chrome.tabs.sendMessage(tab.id, {
            action: "ExplainThat_readPageContent"
        });
    }
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.action == "readPageComplete" && sender.tab) {
        chrome.tabs.sendMessage(sender.tab.id, {
            action: "ExplainThat_changeText",
            text: "Thinking..."
        });
        getResponse(req["innerText"], (responseText) => {
            chrome.tabs.sendMessage(sender.tab.id, {
                action: "ExplainThat_sendResponseText",
                responseText: responseText
            });
        });
    }
});