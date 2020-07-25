document.addEventListener('selectionchange', function() {
    var selection = window.getSelection().toString().trim();
    chrome.runtime.sendMessage({
        request: 'onSelectionChange',
        selection: selection
    });
});