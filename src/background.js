chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "explainThat",
        title: "ExplainThat!",
        contexts: ["selection"]
    });
    
})

chrome.runtime.onStartup.addListener(() => {
  chrome.contextMenus.create({
    id: "explainThat",
    title: "Explain That",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(contextChecker)

function contextChecker(inf, tab) {
    console.log(inf);
    if (inf["menuItemId"] === "explainThat") {
        var data;
        fetch("https://ai.hackclub.com/chat/completions", {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "messages": [{"role": "user", "content": "[In Language: English (United Kingdom)] Please explain this thoroughly in 1-2 sentences only: " + inf["selectionText"]}]
            })
        })
        .then(response => response.json())
        .then(data => {
            /* console.log(data); */
            console.log(data["choices"][0]["message"]["content"]);
        });
    }
}