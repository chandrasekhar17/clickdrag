(function () {
    var base_url = window.location.href.substr(0, window.location.href.lastIndexOf('/'));
    function addPlugin() {
        if (window.tinymce !== undefined) {
            tinymce.PluginManager.add('custCharMap', function (editor, url) {
                editor.addButton('custCharMap', {
                    text: false,
                    icon: 'charmap',
                    tooltip: 'Special Characters',
                    onclick: () => {
                        if (window.listeningShowCustomCharMapEvent) {
                            var cutEvent = new CustomEvent('showCustomCharMap', { detail: { editor: editor } });
                            document.dispatchEvent(cutEvent);
                        } else {
                            editor.execCommand('mceShowCharmap');
                        }
                    }
                });
                editor.paste_as_text = true
                editor.contentCSS.push(base_url + "/assets/tinymce_custom.css")
            }, ['charmap']);
        } else {
            setTimeout(function () { addPlugin(); }, 10);
        }
    }
    addPlugin();
})();