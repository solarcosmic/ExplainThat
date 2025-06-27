var mouse_x;
var mouse_y;

var response_text;
function doStuff() {
    const container = document.createElement("div");
    const shadow = container.attachShadow({ mode: "open" });

    response_text = document.createElement("p");
    const lower_bar = document.createElement("div");
    const lower_bar_text = document.createElement("p");

    response_text.setAttribute("id", "explainthat-response-text");
    lower_bar.setAttribute("id", "lower-bar");

    lower_bar_text.textContent = "May include mistakes.";
    response_text.textContent = "Thinking...";

    container.classList.add("container");

    lower_bar.appendChild(lower_bar_text);

    const wrapper = document.createElement("div");
    wrapper.classList.add("container");
    wrapper.appendChild(response_text);
    wrapper.appendChild(lower_bar);

    const style = document.createElement("style");
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
        .container {
            width: 400px;
            background-color: #111111;
            color: #ffffff;
            border-radius: 16px;
            position: absolute;
            z-index: 9999;
            font-family: "Inter", sans-serif;
        }
        #explainthat-response-text {
            font-size: 15px;
            margin-left: 10px;
            padding: 7.5px 15px;
            width: 87%;
        }
        #lower-bar {
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
    `;

    shadow.appendChild(style);
    shadow.appendChild(wrapper);

    container.style.position = "absolute";
    container.style.left = mouse_x + 10 + "px";
    container.style.top = mouse_y + 10 + "px";

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
function setText(resp_text) {
    console.log(response_text);
    if (!response_text) return;
    response_text.style.animation = "fadeOut 0.3s";
    setTimeout(() => {
        response_text.textContent = resp_text;
        response_text.style.animation = "fadeIn 0.3s";
    }, "300");
}
document.addEventListener("contextmenu", function(e) {
    mouse_x = e.pageX;
    mouse_y = e.pageY;
})
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.action == "ExplainThat_initWindowFrame") {
        doStuff();
    }
    if (req.action == "ExplainThat_sendResponseText") {
        setText(req["responseText"]);
    }
});
