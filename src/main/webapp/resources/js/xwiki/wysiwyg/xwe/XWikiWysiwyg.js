## The module name must match the value of the rename-to attribute from Wysiwyg.gwt.xml
#set($moduleName = "xwe")
/**
 * XWiki's custom WYSIWYG controller.
 * Usage: \$xwiki.jsfx.use("path/to/XWikiWysiwyg.js", {'forceSkinAction': true, 'lazy': true})
 *
 * @type object
 * @param lazy {@code true} if you want to load the WYSIWYG code on demand, {@code false} if you want to load the
 *            WYSIWYG code when the page is loaded
 */
var Wysiwyg =
{
    /**
     * This is the entry pointy for XWiki GWT services.
     *
     * @see web.xml
     */
    xwikiservice: '${request.contextPath}/XWikiService',

    /**
     * This is the entry pointy for the new WYSIWYG's GWT services.
     *
     * @see web.xml
     */
    wysiwygServiceURL: '${request.contextPath}/WysiwygService',

    /**
     * Indicates the state of the WYSIWYG GWT module. Possible values are: 0 (uninitialized), 1 (loading), 2 (loaded).
     */
    readyState: 0,

    /**
     * The queue of functions to execute after the WYSIWYG module is loaded.
     */
    onModuleLoadQueue: [],

    /**
     * Loads the WYSIWYG code on demand.
     */
    load : function()
    {
        // Test if the code has been already loaded.
        // GWT loads the WYSIWYG code in an in-line frame with the 'com.xpn.xwiki.wysiwyg.Wysiwyg' id.
        if (document.getElementById('${moduleName}') || this.readyState != 0) {
            return;
        }

        // Start loading the WYSIWYG GWT module.
        this.readyState = 1;

        // Create the script tag to be used for importing the GWT script loader.
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '$xwiki.getSkinFile("js/xwiki/wysiwyg/${moduleName}/${moduleName}.nocache.js", true)';

        // The default GWT script loader calls document.write() twice which prevents us from loading the WYSIWYG code
        // on demand, after the document has been loaded. To overcome this we have to overwrite the document.write()
        // method before the GWT script loader is executed and restore it after.
        // NOTE: The GWT script loader uses document.write() to compute the URL from where it is loaded.
        var counter = 0;
        var limit = 2;
        var oldWrite = document.write;
        var newWrite = function(html) {
            if (counter < limit) {
                counter++;
                // Try to wrap onScriptLoad in order to be notified when the WYSIWYG script is loaded.
                Wysiwyg.maybeHookOnScriptLoad();
                // Fail silently if the script element hasn't been attached to the document.
                if (!script.parentNode) {
                    return;
                }
                // Create a DIV and put the HTML inside.
                var div = document.createElement('div');
                // We have to replace all the script tags because otherwise IE drops them.
                div.innerHTML = html.replace(/<script\b([\s\S]*?)<\/script>/gi, "<pre script=\"script\"$1</pre>");
                // Move DIV contents after the GWT script loader.
                var nextSibling = script.nextSibling;
                while(div.firstChild) {
                    var child = div.firstChild;
                    // Recover the script tags.
                    if (child.nodeName.toLowerCase() == 'pre' && child.getAttribute('script') == 'script') {
                        var pre = child;
                        pre.removeAttribute('script');
                        // Create the script tag.
                        child = document.createElement('script');
                        // Copy all the attributes.
                        for (var i = 0; i < pre.attributes.length; i++) {
                            var attrNode = pre.attributes[i];
                            // In case of IE we have to copy only the specified attributes.
                            if (typeof attrNode.specified == 'undefined'
                                || (typeof attrNode.specified == 'boolean' && attrNode.specified)) {
                                child.setAttribute(attrNode.nodeName, attrNode.nodeValue);
                            }
                        }
                        // Copy the script text.
                        child.text = typeof pre.innerText == 'undefined' ? pre.textContent : pre.innerText;
                        // Don't forget to remove the placeholder.
                        div.removeChild(pre);
                    }
                    if (nextSibling) {
                        script.parentNode.insertBefore(child, nextSibling);
                    } else {
                        script.parentNode.appendChild(child);
                    }
                }
            }
            if (counter >= limit) {
                document.write = oldWrite;
                oldWrite = undefined;
                script = undefined;
                counter = undefined;
            }
        }

        // Append the script tag to the head.
        var heads = document.getElementsByTagName('head');
        if (heads.length > 0) {
            document.write = newWrite;
            heads[0].appendChild(script);
        }
    },

    /**
     * Schedules a function to be executed after the WYSIWYG module is loaded. A call to this method forces the WYSIWYG
     * module to be loaded, unless the second parameter, {@code lazy}, is set to {@code true}.
     *
     * @param fCode a function
     * @param lazy {@code true} to prevent loading the WYSIWYG module at this point, {@code false} otherwise
     */
    onModuleLoad: function(fCode, lazy) {
        if (typeof fCode != 'function') {
            return;
        }
        switch (this.readyState) {
            // uninitialized
            case 0:
                if (!lazy) {
                    this.load();
                }
                // fall-through

            // loading
            case 1:
                this.onModuleLoadQueue.push(fCode);
                break;

            // loaded
            case 2:
                fCode();
                break; 
        }
    },

    /**
     * Executes all the functions scheduled from on module load.
     */
    fireOnModuleLoad: function() {
        // The WYSIWYG module has been loaded successfully.
        this.readyState = 2;

        // Execute all the scheduled functions.
        for (var i = 0; i < this.onModuleLoadQueue.length; i++) {
            this.onModuleLoadQueue[i]();
        }

        // There's no need to schedule functions anymore. They will be execute immediately. 
        this.onModuleLoadQueue = undefined;
    },

    /**
     * Try to wrap onScriptLoad in order to be notified when the WYSIWYG script is loaded.
     */
    maybeHookOnScriptLoad: function() {
        if (${moduleName} && ${moduleName}.onScriptLoad) {
            var onScriptLoad = ${moduleName}.onScriptLoad;
            ${moduleName}.onScriptLoad = function() {
                Wysiwyg.hookGwtOnLoad();
                onScriptLoad();

                // Restore the default onScriptLoad function.
                if (${moduleName} && ${moduleName}.onScriptLoad) {
                    ${moduleName}.onScriptLoad = onScriptLoad;
                }
                onScriptLoad = undefined;
            }

            // Prevent further calls to this method.
            this.maybeHookOnScriptLoad = function(){};
        }
    },

    /**
     * Wrap gwtOnLoad in order to be notified when the WYSIWYG module is loaded.
     */
    hookGwtOnLoad: function() {
        var iframe = document.getElementById('${moduleName}');
        var gwtOnLoad = iframe.contentWindow.gwtOnLoad;
        iframe.contentWindow.gwtOnLoad = function(errFn, modName, modBase) {
            gwtOnLoad(function() {
                Wysiwyg.fireOnModuleLoad = function(){};
                if (typeof errFn == 'function') {
                    errFn();
                }
            }, modName, modBase);
            Wysiwyg.fireOnModuleLoad();

            // Restore the default gwtOnLoad function.
            iframe.contentWindow.gwtOnLoad = gwtOnLoad;
            iframe = undefined;
            gwtOnLoad = undefined;
        }

        // Prevent further calls to this method.
        this.hookGwtOnLoad = function(){};
    }
};

// Enhance the WysiwygEditor class with custom events.
Wysiwyg.onModuleLoad(function() {
    var WysiwygEditorAspect = function() {
        WysiwygEditorAspect.base.constructor.apply(this, arguments);
        if (this.getRichTextArea()) {
            // If the editor was successfully created then fire a custom event.
            document.fire('xwiki:wysiwyg:created', {'instance': this});
        }
    }
    WysiwygEditorAspect.prototype = new WysiwygEditor;
    WysiwygEditorAspect.base = WysiwygEditor.prototype;
    WysiwygEditor = WysiwygEditorAspect;
}, true);

#if("$!request.lazy" != "true")
Wysiwyg.load();
#end