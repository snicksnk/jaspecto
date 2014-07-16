(function(){
    "use strict";
    var A = function () {
        this.a = 1;
        this.b = 2;
    };

    A.prototype.setA = function (val) {
        this.a = val;
    }

    A.prototype.setB = function (val) {
        this.b = val;
    }


    test( "Test wrap object",
        function() {
            var a =new A;
            a.setA(32);

            var beforeWasCalled = false;
            var afterWasCalled = false;
            
            Jaspecto(a).before('setA').add( 
                function beforeAdvice(val){
                    equal(3,val,'before advice called with properly value');
                    beforeWasCalled = true;
                }
            );

            Jaspecto(a).after('setA').add(function afterAdvice (val){
                equal(3,val,'after advice called with properly value')
                afterWasCalled = true;
            });


            a.setA(3);

            ok(beforeWasCalled, 'Before was called');
            ok(afterWasCalled, 'After was called');


        }
    );

    test ("many aspects", function(){
        var a = new A;

        var advice1compl = false;
        var advice2compl = false;
        var advice3compl = false;
        var advice4compl = false;

        Jaspecto(a).before('setB').add( 
            function beforeBFirst (){
                advice1compl = true;
            }
        ).before('setB').add( 
            function beforeBSecond (){
                advice2compl = true;
            }
        ).after('setA').add( 
            function afterAFirst (){
                advice3compl = true;
            }
        ).after('setA').add( 
            function afterASecond(){
                advice4compl = true;
            }
        );

        a.setA(2);
        a.setB(3);

        ok(advice1compl, 'Advice 1 is ok');
        ok(advice2compl, 'Advice 2 is ok');
        ok(advice3compl, 'Advice 3 is ok');
        ok(advice4compl, 'Advice 4 is ok');

    });

    test("remove advice", function(){
        var a = new A();

        var advice1compl = false;
        Jaspecto(a).before('setA').add(function testAdvice(){
            advice1compl = true;
        });

        a.setA(3);
        ok(advice1compl, 'Advice is ok');

        advice1compl = false;
        Jaspecto(a).before('setA').remove('testAdvice');
        a.setA(4);

        ok(!advice1compl, 'Advice is ok');



    });
})();