document.addEventListener('selectionchange', function () {
    chrome.runtime.sendMessage({
        request: 'onContextChange',
        selection: grabSelection()
    });
});

function grabSelection() {
    return window.getSelection().toString().trim();
}

chrome.runtime.onMessage.addListener(function (msg, sender, callback) {
    if (msg.request === 'onTabActivated')
        callback({ selection: grabSelection() });
    else if (msg.request === 'copyToClipboard')
        copy(msg.text);
})

function copy(text) {
    navigator.clipboard.writeText(text);
}