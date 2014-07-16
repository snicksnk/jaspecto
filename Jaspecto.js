var Jaspecto = function () {
    "use strict";
    var Wrap = function (subject) {
        subject.__JASPECTO__ = new Introducer(subject);
        return subject;
    };

    var Jas = function (subject) {
        if (!subject.hasOwnProperty('__JASPECTO__')){
            Wrap(subject);
        }
        return subject.__JASPECTO__;
    }

    var Introducer = function (subject) {
        this._subject = subject;
        this._pointcut = {};
        this._originalMethods = {};
    };

    Introducer.prototype.preprocessMethod = function(methodName, stack, aspectName){
		if (typeof this._subject[methodName] !== "function") {
            throw new Error('Object has no method "' + methodName + '"');
        }

        if (!this.wasWrapped(methodName)){
            this.wrapMethod (methodName);
        }

        if (typeof this._pointcut[methodName][stack] === 'undefined') {
            this._pointcut[methodName][stack] = [];
        }

    }

    Introducer.prototype.addToStack = function(methodName, stack, aspectName, aspectCallback) {
        this.preprocessMethod(methodName, stack, aspectName);
        this._pointcut[methodName][stack].push({'name':aspectName,'callback':aspectCallback});
    }	

    Introducer.prototype.removeFromStack = function(methodName, stack, aspectName) {
    	this.preprocessMethod(methodName, stack, aspectName);
        var stack = this._pointcut[methodName][stack];

        var aspectPosition = this.findInStack(stack, aspectName);
      
        if (aspectPosition !== undefined){
        	stack.splice(aspectPosition, 1);
    	}
    }

    Introducer.prototype.findInStack = function(stack, aspectName) {
    	//TODO create hash with positions
        for(var aspectNum in stack) {
            if (stack[aspectNum]['name'] === aspectName){
            	return aspectNum;
            }
        }
        return undefined;
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

    Introducer.prototype.getAspectName = function (aspectCallback) {
		return /function ([^(]*)/.exec(aspectCallback+"" )[1];
    }

    Introducer.prototype.before = function (methodName) {
        return this.getPointcutIntroducer(methodName, 'after')
    };

    Introducer.prototype.after = function (methodName) {
        return this.getPointcutIntroducer(methodName, 'after');
    };

    Introducer.prototype.getPointcutIntroducer = function(methodName, stackName){
        if (!this.wasWrapped(methodName)) {
            this.wrapMethod(methodName);
        }
    	var introducer = this;
    	return {
            'add':function (aspectCallback) {
            	var aspectName = introducer.getAspectName(aspectCallback);
                introducer.addToStack(methodName, stackName, aspectName, aspectCallback)
                return introducer;
            },
            'remove':function(aspectName){
            	introducer.removeFromStack(methodName, stackName, aspectName);
            }
        };
    }

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

    Jas.wrap = Wrap;
    return Jas;



}();