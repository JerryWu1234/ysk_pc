/**
 * Created by lhm on 2017/11/25.
 */

//一个简单的前端模板引擎 瞎鸡儿写写
//不支持嵌套循环
// ex :
// Renderer.delimiters =  ["{{", "}}"]
// var result = new Renderer("<div> {{ aaa }} </div>").compile([{aaa:123},{aaa:234}])
// result ==  <div> 123 </div> <div> 234 </div>

!function (win, $) {
    var delimiters = ["{{", "}}"],
        reg = null;

    var Renderer = function (template) { //可以是一个 dom对象 也可以是一个 html对象 也可以是字符串

        this.delimiters =
            Array.isArray(Renderer.delimiters) && Renderer.delimiters.length >= 2 ?
                Renderer.delimiters : delimiters;

        if (template instanceof $) {
            template = template.html()
        } else if (template instanceof HTMLElement) {
            template = template.innerHTML
        }

        this.template = $.type(template) === "string" ? template : ""; //保证一定是字符串

        this.delimiters = transferredMeaning(this.delimiters);
        reg = new RegExp(this.delimiters[0] + "(\\s*[\\w\\.]+\\s*)" + this.delimiters[1], "g")
    };

    Renderer.delimiters = delimiters;  //分隔符 默认 是["{{", "}}"] 如果和后台模板引擎冲突 可以自定义成任意形式的字符串 例如 {% %} ${ } <= => 等等

    //分隔符转义
    function transferredMeaning(delimiters) {
        return delimiters.map(function (delimiter) {
            return delimiter.replace(/([*/$^{}[\]|+?])/g, function (_, $1) {
                return "\\" + $1
            }).trim();
        })
    }

    Renderer.prototype.compile = function (data) {
        if (!data)return this.template;

        if (Array.isArray(data)) {

            return data.map(function (part) {

                return this.formatStr(this.template, part)

            }, this).join("")

        } else {

            return this.formatStr(this.template, data)

        }
    };

    Renderer.prototype.formatStr = function (template, data) {
        return template.replace(reg, function (match, $1) {
            var val = resolvePath($1, data);
            return undefined === val ? "" : val
        })
    };

    function resolvePath(path, data) {
        if (!~path.indexOf(".")) {
            return data[path.trim()]
        }

        var keys = path.trim().split("."), result = data;

        for (var i = 0; i < keys.length; i++) {
            if (result === undefined) break;

            result = result [keys[i]]
        }

        return result
    }

    win.Renderer = Renderer

}(window, jQuery);
