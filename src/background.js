function createContextMenu() {
    chrome.contextMenus.create({
        id: "explainThat",
        title: "ExplainThat!",
        contexts: ["selection"]
    });
}

chrome.contextMenus.onClicked.addListener(contextChecker);
chrome.runtime.onStartup.addListener(createContextMenu);
chrome.runtime.onInstalled.addListener(createContextMenu);

function contextChecker(inf, tab) {
    console.log(inf);
    if (inf["menuItemId"] === "explainThat") {
        chrome.tabs.sendMessage(tab.id, {
            action: "ExplainThat_initWindowFrame"
        });
        fetch("https://ai.hackclub.com/chat/completions", {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "messages": [{"role": "user", "content": "[ONLY In Language: English (United Kingdom)] Please explain this thoroughly in 1-2 sentences, only the explanation: " + inf["selectionText"]}]
            })
        })
        .then(response => response.json())
        .then(data => {
            chrome.tabs.sendMessage(tab.id, {
                action: "ExplainThat_sendResponseText",
                responseText: data["choices"][0]["message"]["content"]
            });
        });
    }
}