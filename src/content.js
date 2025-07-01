var mouse_x;
var mouse_y;

var response_text;
function doStuff(preset_text, disclaimer_text) {
    const container = document.createElement("div");
    const shadow = container.attachShadow({ mode: "open" });
    const globalStyle = document.createElement('style');
    globalStyle.textContent = `
    @font-face {
        font-family: "Inter_ExplainThat";
        src: url("${chrome.runtime.getURL("src/assets/fonts/Inter.ttf")}") format("truetype");
        font-display: swap;
    }
    `;
    document.head.appendChild(globalStyle);

    const style = document.createElement("style");
    chrome.storage.sync.get("currentTheme", function(data) {
        const savedTheme = data["currentTheme"];
        style.textContent = applyTheme(savedTheme || "Default");
        if (savedTheme) {
            select_themes.value = savedTheme;
        } else {
            select_themes.value = "Default";
        }
    });

    shadow.appendChild(style);

    const wrapdiv = document.createElement("div");
    wrapdiv.style = "display: flex; margin-left: auto; align-items: center;";

    response_text = document.createElement("p");
    const lower_bar = document.createElement("div");
    const lower_bar_text = document.createElement("p");
    const select_themes = document.createElement("select");

    response_text.setAttribute("id", "explainthat-response-text");
    lower_bar.setAttribute("id", "lower-bar");

    lower_bar_text.textContent = disclaimer_text || "May include mistakes.";
    response_text.textContent = preset_text || "Thinking...";

    // copy button
    const copy_button = document.createElement("input");
    copy_button.setAttribute("type", "image");
    copy_button.setAttribute("id", "copy-button");
    copy_button.setAttribute("src", chrome.runtime.getURL("src/assets/icons/copy-solid.svg"));

    copy_button.addEventListener("click", (e) => {
        navigator.clipboard.writeText(response_text.textContent);
        copy_button.setAttribute("src", chrome.runtime.getURL("src/assets/icons/check-solid.svg"));
        setTimeout(() => {
            copy_button.setAttribute("src", chrome.runtime.getURL("src/assets/icons/copy-solid.svg"));
        }, "1000");
    });

    // theme options
    select_themes.setAttribute("id", "themes");
    const select_default = document.createElement("option");
    const select_liquid_glass = document.createElement("option");
    select_default.value = "Default";
    select_liquid_glass.value = "Liquid Glass";
    select_default.textContent = "Default";
    select_liquid_glass.textContent = "Liquid Glass";
    select_themes.appendChild(select_default);
    select_themes.appendChild(select_liquid_glass);

    // append copy button and theme selector to wrapdiv
    wrapdiv.appendChild(copy_button);
    wrapdiv.appendChild(select_themes);

    container.classList.add("container");

    // lower bar: disclaimer text, then wrapdiv (copy + themes)
    lower_bar.appendChild(lower_bar_text);
    lower_bar.appendChild(wrapdiv);

    const wrapper = document.createElement("div");
    wrapper.classList.add("container");
    wrapper.appendChild(response_text);
    wrapper.appendChild(lower_bar);

    shadow.appendChild(wrapper);

    container.style.position = "absolute";
    container.style.left = mouse_x + 10 + "px";
    container.style.top = mouse_y + 10 + "px";

    select_themes.addEventListener("change", function() {
        style.textContent = applyTheme(select_themes.value);
    });

    document.body.appendChild(container);

    function handle_outside_click(e) {
        if (!container.contains(e.target)) {
            wrapper.style.animation = "fadeOut 0.3s";
            wrapper.addEventListener("animationend", function onAnimEnd() {
                wrapper.removeEventListener("animationend", onAnimEnd);
                container.remove();
            });
            document.removeEventListener("mousedown", handle_outside_click);
        }
    }
    setTimeout(() => {
        document.addEventListener("mousedown", handle_outside_click);
    }, 0);
}
function setText(resp_text, transition = true) {
    if (marked && DOMPurify) resp_text = DOMPurify.sanitize(marked.parse(resp_text));
    console.log(resp_text);
    if (!response_text) return;
    if (transition) {
        response_text.style.animation = "fadeOut 0.3s";
        setTimeout(() => {
            response_text.innerHTML = resp_text;
            response_text.style.animation = "fadeIn 0.3s";
        }, "300");
    } else {
        response_text.innerHTML = resp_text;
    }
}
document.addEventListener("contextmenu", function(e) {
    mouse_x = e.pageX;
    mouse_y = e.pageY;
})
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.action == "ExplainThat_initWindowFrame") {
        doStuff(req["preset_text"], req["disclaimer_text"]);
    }
    if (req.action == "ExplainThat_sendResponseText") {
        setText(req["responseText"]);
    }
    if (req.action == "ExplainThat_readPageContent") {
        chrome.runtime.sendMessage({
            action: "readPageComplete",
            innerText: document.body.innerText
        });
    }
    if (req.action == "ExplainThat_changeText") {
        setText(req["text"]);
    }
});

function applyTheme(theme) {
    chrome.storage.sync.set({"currentTheme": theme});
    if (theme == "Liquid Glass") {
        return `
        .container {
            width: 400px;
            background: rgba(0, 0, 0, 0.7);
            border-radius: 16px;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            border: 1px solid rgba(0, 0, 0, 0.3);
            color: #ffffff;
            border-radius: 16px;
            position: absolute;
            z-index: 9999;
            font-family: "Inter_ExplainThat", sans-serif;
        }
        #explainthat-response-text {
            font-size: 15px;
            margin-left: 10px;
            padding: 7.5px 15px;
            width: 87%;
        }
        #lower-bar {
            display: flex;
            background-color: #1818188a;
            bottom: 0;
            padding-top: 1px;
            padding-bottom: 1px;
            padding-left: 25px;
            font-size: 12px;
            border-bottom-right-radius: 16px;
            border-bottom-left-radius: 16px;
            color: #ffffff;
        }
        @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }
        @keyframes fadeOut {
            0% { opacity: 1; }
            100% { opacity: 0; }
        }
        #themes {
            font-family: "Inter_ExplainThat", sans-serif;
            margin-left: auto;
            margin-right: 15px;
            height: 30px;
            align-self: center;
            background-color: #29292931;
            color: #ffffff;
            border-style: none;
            border-radius: 8px;
            cursor: pointer;
            outline: none;
        }
        #themes:hover {
            background-color: #29292965;
        }
        #themes * {
            background-color: #292929c5;
            cursor: pointer;
        }
        #explainthat-response-text p {
            margin: 0;
            padding: 0;
        }
        #copy-button {
            margin-left: 0;
            margin-right: 10px;
            width: 16px;
            height: 16px;
            align-self: center;
            opacity: 0.5;
            filter: invert(51%) sepia(0%) saturate(1062%) hue-rotate(168deg) brightness(99%) contrast(89%);
        }
        #copy-button:hover {
            filter: invert(100%) sepia(0%) saturate(7426%) hue-rotate(359deg) brightness(93%) contrast(73%);
        }
        `
    } else if (theme == "Default") {
        return `
        .container {
            width: 400px;
            background-color: #111111;
            color: #ffffff;
            border-radius: 16px;
            position: absolute;
            z-index: 9999;
            font-family: "Inter_ExplainThat", sans-serif;
        }
        #explainthat-response-text {
            font-size: 15px;
            margin-left: 10px;
            padding: 7.5px 15px;
            width: 87%;
        }
        #lower-bar {
            display: flex;
            background-color: #181818;
            bottom: 0;
            padding-top: 1px;
            padding-bottom: 1px;
            padding-left: 25px;
            font-size: 12px;
            border-bottom-right-radius: 16px;
            border-bottom-left-radius: 16px;
            color: grey;
        }
        @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }
        @keyframes fadeOut {
            0% { opacity: 1; }
            100% { opacity: 0; }
        }
        #themes {
            font-family: "Inter_ExplainThat", sans-serif;
            margin-left: auto;
            margin-right: 15px;
            height: 30px;
            align-self: center;
            background-color: #29292931;
            color: #ffffff;
            border-style: none;
            border-radius: 8px;
            cursor: pointer;
            outline: none;
        }
        #themes:hover {
            background-color: #29292965;
        }
        #themes * {
            background-color: #292929c5;
            cursor: pointer;
        }
        #explainthat-response-text p {
            margin: 0;
            padding: 0;
        }
        #copy-button {
            margin-left: 0;
            margin-right: 10px;
            width: 16px;
            height: 16px;
            align-self: center;
            opacity: 0.5;
            filter: invert(51%) sepia(0%) saturate(1062%) hue-rotate(168deg) brightness(99%) contrast(89%);
        }
        #copy-button:hover {
            filter: invert(100%) sepia(0%) saturate(7426%) hue-rotate(359deg) brightness(93%) contrast(73%);
        }
        `
    }
}