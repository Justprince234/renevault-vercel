Joomla = window.Joomla || {};
Joomla.editors = Joomla.editors || {};
Joomla.editors.instances = Joomla.editors.instances || {};
(function(Joomla, document) {
    "use strict";
    Joomla.submitform = function(task, form, validate) {
        if (!form) {
            form = document.getElementById("adminForm")
        }
        if (task) {
            form.task.value = task
        }
        form.noValidate = !validate;
        if (!validate) {
            form.setAttribute("novalidate", "")
        } else if (form.hasAttribute("novalidate")) {
            form.removeAttribute("novalidate")
        }
        var button = document.createElement("input");
        button.style.display = "none";
        button.type = "submit";
        form.appendChild(button).click();
        form.removeChild(button)
    };
    Joomla.submitbutton = function(pressbutton) {
        Joomla.submitform(pressbutton)
    };
    Joomla.Text = {
        strings: {},
        _: function(key, def) {
            var newStrings = Joomla.getOptions("joomla.jtext");
            if (newStrings) {
                this.load(newStrings);
                Joomla.loadOptions({
                    "joomla.jtext": null
                })
            }
            def = def === undefined ? "" : def;
            key = key.toUpperCase();
            return this.strings[key] !== undefined ? this.strings[key] : def
        },
        load: function(object) {
            for (var key in object) {
                if (!object.hasOwnProperty(key)) continue;
                this.strings[key.toUpperCase()] = object[key]
            }
            return this
        }
    };
    Joomla.JText = Joomla.Text;
    Joomla.optionsStorage = Joomla.optionsStorage || null;
    Joomla.getOptions = function(key, def) {
        if (!Joomla.optionsStorage) {
            Joomla.loadOptions()
        }
        return Joomla.optionsStorage[key] !== undefined ? Joomla.optionsStorage[key] : def
    };
    Joomla.loadOptions = function(options) {
        if (!options) {
            var elements = document.querySelectorAll(".joomla-script-options.new"),
                str, element, option, counter = 0;
            for (var i = 0, l = elements.length; i < l; i++) {
                element = elements[i];
                str = element.text || element.textContent;
                option = JSON.parse(str);
                if (option) {
                    Joomla.loadOptions(option);
                    counter++
                }
                element.className = element.className.replace(" new", " loaded")
            }
            if (counter) {
                return
            }
        }
        if (!Joomla.optionsStorage) {
            Joomla.optionsStorage = options || {}
        } else if (options) {
            for (var p in options) {
                if (options.hasOwnProperty(p)) {
                    Joomla.optionsStorage[p] = options[p]
                }
            }
        }
    };
    Joomla.replaceTokens = function(newToken) {
        if (!/^[0-9A-F]{32}$/i.test(newToken)) {
            return
        }
        var els = document.getElementsByTagName("input"),
            i, el, n;
        for (i = 0, n = els.length; i < n; i++) {
            el = els[i];
            if (el.type == "hidden" && el.value == "1" && el.name.length == 32) {
                el.name = newToken
            }
        }
    };
    Joomla.isEmail = function(text) {
        console.warn("Joomla.isEmail() is deprecated, use the formvalidator instead");
        var regex = /^[\w.!#$%&‚Äô*+\/=?^`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]{2,})+$/i;
        return regex.test(text)
    };
    Joomla.checkAll = function(checkbox, stub) {
        if (!checkbox.form) return false;
        stub = stub ? stub : "cb";
        var c = 0,
            i, e, n;
        for (i = 0, n = checkbox.form.elements.length; i < n; i++) {
            e = checkbox.form.elements[i];
            if (e.type == checkbox.type && e.id.indexOf(stub) === 0) {
                e.checked = checkbox.checked;
                c += e.checked ? 1 : 0
            }
        }
        if (checkbox.form.boxchecked) {
            checkbox.form.boxchecked.value = c
        }
        return true
    };
    Joomla.renderMessages = function(messages) {
        Joomla.removeMessages();
        var messageContainer = document.getElementById("system-message-container"),
            type, typeMessages, messagesBox, title, titleWrapper, i, messageWrapper, alertClass;
        for (type in messages) {
            if (!messages.hasOwnProperty(type)) {
                continue
            }
            typeMessages = messages[type];
            messagesBox = document.createElement("div");
            alertClass = type === "notice" ? "alert-info" : "alert-" + type;
            alertClass = type === "message" ? "alert-success" : alertClass;
            alertClass = type === "error" ? "alert-error alert-danger" : alertClass;
            messagesBox.className = "alert " + alertClass;
            var buttonWrapper = document.createElement("button");
            buttonWrapper.setAttribute("type", "button");
            buttonWrapper.setAttribute("data-dismiss", "alert");
            buttonWrapper.className = "close";
            buttonWrapper.innerHTML = "×";
            messagesBox.appendChild(buttonWrapper);
            title = Joomla.JText._(type);
            if (typeof title != "undefined") {
                titleWrapper = document.createElement("h4");
                titleWrapper.className = "alert-heading";
                titleWrapper.innerHTML = Joomla.JText._(type);
                messagesBox.appendChild(titleWrapper)
            }
            for (i = typeMessages.length - 1; i >= 0; i--) {
                messageWrapper = document.createElement("div");
                messageWrapper.innerHTML = typeMessages[i];
                messagesBox.appendChild(messageWrapper)
            }
            messageContainer.appendChild(messagesBox)
        }
    };
    Joomla.removeMessages = function() {
        var messageContainer = document.getElementById("system-message-container");
        while (messageContainer.firstChild) messageContainer.removeChild(messageContainer.firstChild);
        messageContainer.style.display = "none";
        messageContainer.offsetHeight;
        messageContainer.style.display = ""
    };
    Joomla.ajaxErrorsMessages = function(xhr, textStatus, error) {
        var msg = {};
        if (textStatus === "parsererror") {
            var encodedJson = xhr.responseText.trim();
            var buf = [];
            for (var i = encodedJson.length - 1; i >= 0; i--) {
                buf.unshift(["&#", encodedJson[i].charCodeAt(), ";"].join(""))
            }
            encodedJson = buf.join("");
            msg.error = [Joomla.JText._("JLIB_JS_AJAX_ERROR_PARSE").replace("%s", encodedJson)]
        } else if (textStatus === "nocontent") {
            msg.error = [Joomla.JText._("JLIB_JS_AJAX_ERROR_NO_CONTENT")]
        } else if (textStatus === "timeout") {
            msg.error = [Joomla.JText._("JLIB_JS_AJAX_ERROR_TIMEOUT")]
        } else if (textStatus === "abort") {
            msg.error = [Joomla.JText._("JLIB_JS_AJAX_ERROR_CONNECTION_ABORT")]
        } else if (xhr.responseJSON && xhr.responseJSON.message) {
            msg.error = [Joomla.JText._("JLIB_JS_AJAX_ERROR_OTHER").replace("%s", xhr.status) + " <em>" + xhr.responseJSON.message + "</em>"]
        } else if (xhr.statusText) {
            msg.error = [Joomla.JText._("JLIB_JS_AJAX_ERROR_OTHER").replace("%s", xhr.status) + " <em>" + xhr.statusText + "</em>"]
        } else {
            msg.error = [Joomla.JText._("JLIB_JS_AJAX_ERROR_OTHER").replace("%s", xhr.status)]
        }
        return msg
    };
    Joomla.isChecked = function(isitchecked, form) {
        if (typeof form === "undefined") {
            form = document.getElementById("adminForm")
        }
        form.boxchecked.value = isitchecked ? parseInt(form.boxchecked.value) + 1 : parseInt(form.boxchecked.value) - 1;
        if (!form.elements["checkall-toggle"]) return;
        var c = true,
            i, e, n;
        for (i = 0, n = form.elements.length; i < n; i++) {
            e = form.elements[i];
            if (e.type == "checkbox" && e.name != "checkall-toggle" && !e.checked) {
                c = false;
                break
            }
        }
        form.elements["checkall-toggle"].checked = c
    };
    Joomla.popupWindow = function(mypage, myname, w, h, scroll) {
        console.warn("Joomla.popupWindow() is deprecated without a replacement!");
        var winl = (screen.width - w) / 2,
            wint = (screen.height - h) / 2,
            winprops = "height=" + h + ",width=" + w + ",top=" + wint + ",left=" + winl + ",scrollbars=" + scroll + ",resizable";
        window.open(mypage, myname, winprops).window.focus()
    };
    Joomla.tableOrdering = function(order, dir, task, form) {
        if (typeof form === "undefined") {
            form = document.getElementById("adminForm")
        }
        form.filter_order.value = order;
        form.filter_order_Dir.value = dir;
        Joomla.submitform(task, form)
    };
    window.writeDynaList = function(selectParams, source, key, orig_key, orig_val, element) {
        console.warn("window.writeDynaList() is deprecated without a replacement!");
        var select = document.createElement("select");
        var params = selectParams.split(" ");
        for (var l = 0; l < params.length; l++) {
            var par = params[l].split("=");
            if (par[0].trim().substr(0, 2).toLowerCase() === "on" || par[0].trim().toLowerCase() === "href") {
                continue
            }
            select.setAttribute(par[0], par[1].replace(/\"/g, ""))
        }
        var hasSelection = key == orig_key,
            i, selected, item;
        for (i = 0; i < source.length; i++) {
            item = source[i];
            if (item[0] != key) {
                continue
            }
            selected = hasSelection ? orig_val == item[1] : i === 0;
            var el = document.createElement("option");
            el.setAttribute("value", item[1]);
            el.innerText = item[2];
            if (selected) {
                el.setAttribute("selected", "selected")
            }
            select.appendChild(el)
        }
        if (element) {
            element.appendChild(select)
        } else {
            document.body.appendChild(select)
        }
    };
    window.changeDynaList = function(listname, source, key, orig_key, orig_val) {
        console.warn("window.changeDynaList() is deprecated without a replacement!");
        var list = document.adminForm[listname],
            hasSelection = key == orig_key,
            i, x, item, opt;
        while (list.firstChild) list.removeChild(list.firstChild);
        i = 0;
        for (x in source) {
            if (!source.hasOwnProperty(x)) {
                continue
            }
            item = source[x];
            if (item[0] != key) {
                continue
            }
            opt = new Option;
            opt.value = item[1];
            opt.text = item[2];
            if (hasSelection && orig_val == opt.value || !hasSelection && i === 0) {
                opt.selected = true
            }
            list.options[i++] = opt
        }
        list.length = i
    };
    window.radioGetCheckedValue = function(radioObj) {
        console.warn("window.radioGetCheckedValue() is deprecated without a replacement!");
        if (!radioObj) {
            return ""
        }
        var n = radioObj.length,
            i;
        if (n === undefined) {
            return radioObj.checked ? radioObj.value : ""
        }
        for (i = 0; i < n; i++) {
            if (radioObj[i].checked) {
                return radioObj[i].value
            }
        }
        return ""
    };
    window.getSelectedValue = function(frmName, srcListName) {
        console.warn("window.getSelectedValue() is deprecated without a replacement!");
        var srcList = document[frmName][srcListName],
            i = srcList.selectedIndex;
        if (i !== null && i > -1) {
            return srcList.options[i].value
        } else {
            return null
        }
    };
    window.listItemTask = function(id, task) {
        console.warn("window.listItemTask() is deprecated use Joomla.listItemTask() instead");
        return Joomla.listItemTask(id, task)
    };
    Joomla.listItemTask = function(id, task) {
        var f = document.adminForm,
            i = 0,
            cbx, cb = f[id];
        if (!cb) return false;
        while (true) {
            cbx = f["cb" + i];
            if (!cbx) break;
            cbx.checked = false;
            i++
        }
        cb.checked = true;
        f.boxchecked.value = 1;
        window.submitform(task);
        return false
    };
    window.submitbutton = function(pressbutton) {
        console.warn("window.submitbutton() is deprecated use Joomla.submitbutton() instead");
        Joomla.submitbutton(pressbutton)
    };
    window.submitform = function(pressbutton) {
        console.warn("window.submitform() is deprecated use Joomla.submitform() instead");
        Joomla.submitform(pressbutton)
    };
    window.saveorder = function(n, task) {
        console.warn("window.saveorder() is deprecated without a replacement!");
        window.checkAll_button(n, task)
    };
    window.checkAll_button = function(n, task) {
        console.warn("window.checkAll_button() is deprecated without a replacement!");
        task = task ? task : "saveorder";
        var j, box;
        for (j = 0; j <= n; j++) {
            box = document.adminForm["cb" + j];
            if (box) {
                box.checked = true
            } else {
                alert("You cannot change the order of items, as an item in the list is `Checked Out`");
                return
            }
        }
        Joomla.submitform(task)
    };
    Joomla.loadingLayer = function(task, parentElement) {
        task = task || "show";
        parentElement = parentElement || document.body;
        if (task === "load") {
            var systemPaths = Joomla.getOptions("system.paths") || {},
                basePath = systemPaths.root || "";
            var loadingDiv = document.createElement("div");
            loadingDiv.id = "loading-logo";
            loadingDiv.style["position"] = "fixed";
            loadingDiv.style["top"] = "0";
            loadingDiv.style["left"] = "0";
            loadingDiv.style["width"] = "100%";
            loadingDiv.style["height"] = "100%";
            loadingDiv.style["opacity"] = "0.8";
            loadingDiv.style["filter"] = "alpha(opacity=80)";
            loadingDiv.style["overflow"] = "hidden";
            loadingDiv.style["z-index"] = "10000";
            loadingDiv.style["display"] = "none";
            loadingDiv.style["background-color"] = "#fff";
            loadingDiv.style["background-image"] = 'url("' + basePath + '/media/jui/images/ajax-loader.gif")';
            loadingDiv.style["background-position"] = "center";
            loadingDiv.style["background-repeat"] = "no-repeat";
            loadingDiv.style["background-attachment"] = "fixed";
            parentElement.appendChild(loadingDiv)
        } else {
            if (!document.getElementById("loading-logo")) {
                Joomla.loadingLayer("load", parentElement)
            }
            document.getElementById("loading-logo").style["display"] = task == "show" ? "block" : "none"
        }
        return document.getElementById("loading-logo")
    };
    Joomla.extend = function(destination, source) {
        for (var p in source) {
            if (source.hasOwnProperty(p)) {
                destination[p] = source[p]
            }
        }
        return destination
    };
    Joomla.request = function(options) {
        options = Joomla.extend({
            url: "",
            method: "GET",
            data: null,
            perform: true
        }, options);
        options.method = options.data ? "POST" : options.method.toUpperCase();
        try {
            var xhr = window.XMLHttpRequest ? new XMLHttpRequest : new ActiveXObject("MSXML2.XMLHTTP.3.0");
            xhr.open(options.method, options.url, true);
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.setRequestHeader("X-Ajax-Engine", "Joomla!");
            if (options.method === "POST") {
                var token = Joomla.getOptions("csrf.token", "");
                if (token) {
                    xhr.setRequestHeader("X-CSRF-Token", token)
                }
                if (typeof options.data === "string" && (!options.headers || !options.headers["Content-Type"])) {
                    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
                }
            }
            if (options.headers) {
                for (var p in options.headers) {
                    if (options.headers.hasOwnProperty(p)) {
                        xhr.setRequestHeader(p, options.headers[p])
                    }
                }
            }
            xhr.onreadystatechange = function() {
                if (xhr.readyState !== 4) return;
                if (xhr.status === 200) {
                    if (options.onSuccess) {
                        options.onSuccess.call(window, xhr.responseText, xhr)
                    }
                } else if (options.onError) {
                    options.onError.call(window, xhr)
                }
            };
            if (options.perform) {
                if (options.onBefore && options.onBefore.call(window, xhr) === false) {
                    return xhr
                }
                xhr.send(options.data)
            }
        } catch (error) {
            window.console ? console.log(error) : null;
            return false
        }
        return xhr
    }
})(Joomla, document);