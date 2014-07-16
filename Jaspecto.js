var Jaspecto = function () {
    "use strict";
    var wrap = function (subject) {
        subject.__JASPECTO__ = new Introducer(subject);
        return subject;
    };

    var jas = function (subject) {

        if (!subject.hasOwnProperty('__JASPECTO__')){
            wrap(subject);
        }

        return subject.__JASPECTO__;
    }

    var Introducer = function (subject) {
        this._subject = subject;
        this._pointcut = {};
        this._originalMethods = {};
    };

    Introducer.prototype.addToStack = function(methodName, stack, aspectName, aspectCallback) {

        if (typeof this._subject[methodName] !== "function") {
            throw new Error('Object has no method "' + methodName + '"');
        }

        if (!this.wasWrapped(methodName)){
            this.wrapMethod (methodName);
        }

        if (typeof this._pointcut[methodName][stack] === 'undefined') {
            this._pointcut[methodName][stack] = [];
        }
        this._pointcut[methodName][stack].push({'name':aspectName,'callback':aspectCallback});
    }

    Introducer.prototype.callStack = function(methodName, stackName, args) {
        var aspect;

        var stack = this._pointcut[methodName][stackName];
        for(aspect in stack) {
            stack[aspect]['callback'].apply(this._subject, args);
        }
    }

    Introducer.prototype.wasWrapped = function(methodName) {
        if (typeof this._subject[methodName] !== "function") {
            throw new Error('Object has no method "' + methodName + '"');
        }

        if (typeof this._pointcut[methodName] === 'undefined') {
            return false;
        } else {
            return true;
        }
    }

    Introducer.prototype.before = function (methodName) {
        if (!this.wasWrapped(methodName)) {
            this.wrapMethod(methodName);
        }

        var that = this;
        return {
            'advice':function (aspectName, aspectCallback) {
                that.addToStack(methodName,'before',aspectName,aspectCallback);
                return that;
            }
        };
    };

    Introducer.prototype.after = function (methodName) {

        if (!this.wasWrapped(methodName)) {
            this.wrapMethod(methodName);
        }

        var that = this;
        return {
            'advice':function (aspectName, aspectCallback) {
                that.addToStack(methodName,'after', aspectName, aspectCallback)
                return that;
            }
        };
    };



    Introducer.prototype.wrapMethod = function (methodName) {
        if (typeof this._pointcut[methodName] === 'undefined') {
            this._pointcut[methodName] = {};
        }
        this._originalMethods[methodName] = this._subject[methodName];
        var that = this;
        this._subject[methodName] = function () {
            that.callStack(methodName, 'before', arguments);
            that._originalMethods[methodName].apply(that._subject, arguments);
            that.callStack(methodName, 'after', arguments);
        }
    }

    jas.wrap = wrap;
    return jas;



}();