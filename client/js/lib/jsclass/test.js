/**
 * == test ==
 **/

JS.Test = new JS.Module('Test', {
  extend: {
    /** section: test
     * JS.Test.Unit
     * 
     * `JS.Test.Unit` is a (mostly) direct clone of Ruby's `Test::Unit`
     * framework. It provides support for writing unit tests that can
     * be run wherever you like, and ships with TestRunner UIs for command-line
     * use (V8, Rhino, SpiderMonkey) and for web browsers.
     * 
     * The original `Test::Unit` and all documentation contained here is
     * copyright (c) 2000-2003 Nathaniel Talbott. It is free software, and is
     * distributed under the Ruby license. See the `COPYING` file in the standard
     * Ruby distribution for details.
     * 
     * ### Usage
     *
     * The general idea behind unit testing is that you write a _test_
     * _method_ that makes certain _assertions_ about your code, working
     * against a _test_ _fixture_. A bunch of these _test_ _methods_ are
     * bundled up into a _test_ _suite_ and can be run any time the
     * developer wants. The results of a run are gathered in a _test_
     * _result_ and displayed to the user through some UI. So, lets break
     * this down and see how `JS.Test.Unit` provides each of these necessary
     * pieces.
     * 
     * ### Assertions
     * 
     * These are the heart of the framework. Think of an assertion as a
     * statement of expected outcome, i.e. "I assert that x should be equal
     * to y". If, when the assertion is executed, it turns out to be
     * correct, nothing happens, and life is good. If, on the other hand,
     * your assertion turns out to be false, an error is propagated with
     * pertinent information so that you can go back and make your
     * assertion succeed, and, once again, life is good. For an explanation
     * of the current assertions, see `JS.Test.Unit.Assertions`.
     * 
     * ### Test Method & Test Fixture
     * 
     * Obviously, these assertions have to be called within a context that
     * knows about them and can do something meaningful with their
     * pass/fail value. Also, it's handy to collect a bunch of related
     * tests, each test represented by a method, into a common test class
     * that knows how to run them. The tests will be in a separate class
     * from the code they're testing for a couple of reasons. First of all,
     * it allows your code to stay uncluttered with test code, making it
     * easier to maintain. Second, it allows the tests to be stripped out
     * for deployment, since they're really there for you, the developer,
     * and your users don't need them. Third, and most importantly, it
     * allows you to set up a common test fixture for your tests to run
     * against.
     * 
     * What's a test fixture? Well, tests do not live in a vacuum; rather,
     * they're run against the code they are testing. Often, a collection
     * of tests will run against a common set of data, also called a
     * fixture. If they're all bundled into the same test class, they can
     * all share the setting up and tearing down of that data, eliminating
     * unnecessary duplication and making it much easier to add related
     * tests.
     *
     * `JS.Test.Unit.TestCase` wraps up a collection of test methods together
     * and allows you to easily set up and tear down the same test fixture
     * for each test. This is done by overriding `JS.Test.Unit.TestCase#setup`
     * and/or `JS.Test.Unit.TestCase#teardown`,
     * which will be called before and after each test method that is
     * run. The `TestCase` also knows how to collect the results of your
     * assertions into a `JS.Test.Unit.TestResult`, which can then be reported
     * back to you... but I'm getting ahead of myself. To write a test,
     * follow these steps:
     *
     * * Create a class that subclasses `JS.Test.Unit.TestCase`.
     * * Add a method that begins with `test` to your class.
     * * Make assertions in your test method.
     * * Optionally define `setup` and/or `teardown` to set up and/or tear
     *   down your common test fixture.
     * * Call `JS.Test.Unit.AutoRunner.run()` to run your tests.
     * 
     * A really simple test might look like this (`setup` and `teardown` are
     * commented out to indicate that they are completely optional):
     * 
     *     MyTest = new JS.Class('MyTest', JS.Test.Unit.TestCase, {
     *         // setup: function() {
     *         // },
     *         
     *         // teardown: function() {
     *         // },
     *         
     *         testFail: function() {
     *             this.assert(false, 'Assertion was false.');
     *         }
     *     });
     * 
     * ### Test Runners
     * 
     * So, now you have this great test class, but you still need a way to
     * run it and view any failures that occur during the run. This is
     * where `JS.Test.Unit.UI.Console.TestRunner` (and others, such as
     * `JS.Test.Unit.UI.Browser.TestRunner`) comes into play. To manually
     * invoke a runner, simply call its `run` class method and pass in an
     * object that responds to the `suite` message with a
     * `JS.Test.Unit.TestSuite`. This can be as simple as passing in your
     * `TestCase` class (which has a class `suite` method). It might look
     * something like this:
     * 
     *     JS.Test.Unit.UI.Console.TestRunner.run(MyTest);
     * 
     * You can also use the `JS.Test.Unit.AutoRunner` class, which runs all
     * defined tests using an automatically selected `TestRunner`.
     * 
     *     JS.Test.Unit.AutoRunner.run();
     **/
    Unit: new JS.Module({
      extend: {
        AssertionFailedError: new JS.Class(Error, {
          initialize: function(message) {
            this.message = message.toString();
          }
        })
      }
    })
  }
});


JS.Test.Unit.extend({
  Util: new JS.Module({
    extend: {
      /** section: test
       * mixin JS.Test.Unit.Util.Observable
       * 
       * This is a utility class that allows anything mixing
       * it in to notify a set of listeners about interesting
       * events.
       **/
      Observable: new JS.Module({
        extend: {
          /**
           * JS.Test.Unit.Util.Observable.NOTHING = {}
           * We use this for defaults since `null` might mean something
           **/
          NOTHING: {}
        },
        
        /**
         * JS.Test.Unit.Util.Observable#addListener(channelName, block, context) -> Function
         * 
         * Adds the passed `block` as a listener on the
         * channel indicated by `channelName`.
         **/
        addListener: function(channelName, block, context) {
          if (block === undefined) throw new Error('No callback was passed as a listener');
          
          this.channels()[channelName] = this.channels()[channelName] || [];
          this.channels()[channelName].push([block, context]);
          return block;
        },
        
        /**
         * JS.Test.Unit.Util.Observable#removeListener(channelName, block, context) -> Function
         * 
         * Removes the listener indicated by `block`
         * from the channel indicated by
         * `channelName`. Returns the registered block, or
         * `null` if none was found.
         **/
        removeListener: function(channelName, block, context) {
          var channel = this.channels()[channelName];
          if (!channel) return;
          var i = channel.length;
          while (i--) {
            if (channel[i][0] === block) {
              channel.splice(i,1);
              return block;
            }
          }
          return null;
        },
        
        /**
         * JS.Test.Unit.Util.Observable#notifyListeners(channelName, args) -> Number
         * 
         * Calls all the blocks registered on the channel
         * indicated by `channelName`. If value is
         * specified, it is passed in to the blocks,
         * otherwise they are called with no arguments.
         **/
        notifyListeners: function(channelName, args) {
          var args        = JS.array(arguments),
              channelName = args.shift(),
              channel     = this.channels()[channelName];
          if (!channel) return 0;
          for (var i = 0, n = channel.length; i < n; i++)
            channel[i][0].apply(channel[i][1] || null, args);
          return channel.length;
        },
        
        channels: function() {
          return this.__channels__ = this.__channels__ || [];
        }
      })
    }
  })
});


JS.Test.Unit.extend({
  /** section: test
   * mixin JS.Test.Unit.Assertions
   *
   * `JS.Test.Unit.Assertions` contains the standard `JS.Test.Unit` assertions.
   * `Assertions` is included in `JS.Test.Unit.TestCase`.
   * 
   * To include it in your own code and use its functionality, you simply
   * need to `catch` `JS.Test.Unit.AssertionFailedError`. Additionally you may
   * override `JS.Test.Unit.Assertions#addAssertion` to get notified whenever
   * an assertion is made.
   * 
   * Notes:
   * * The message to each assertion, if given, will be propagated with the
   *   failure.
   * * It is easy to add your own assertions based on `JS.Test.Unit.Assertions#assertBlock`.
   * 
   * Example custom assertion:
   * 
   *     deny: function(bool, message) {
   *         message = this.buildMessage(message, "<?> is not false or null.", bool);
   *         this.assertBlock(message, function() { return !bool });
   *     }
   **/
  Assertions: new JS.Module({
    /**
     * JS.Test.Unit.Assertions#assertBlock(message, block, context) -> undefined
     * 
     * The assertion upon which all other assertions are based. Passes if the
     * block yields `true`.
     **/
    assertBlock: function(message, block, context) {
      if (JS.isFn(message)) {
        context = block;
        block   = message;
        message = null;
      }
      this.__wrapAssertion__(function() {
        if (!block.call(context || null)) {
          message = this.buildMessage(message || 'assertBlock failed.');
          throw new JS.Test.Unit.AssertionFailedError(message);
        }
      });
    },
    
    /**
     * JS.Test.Unit.Assertions#flunk(message) -> undefined
     * 
     * Flunk always fails.
     **/
    flunk: function(message) {
      this.assertBlock(this.buildMessage(message || 'Flunked'), function() { return false });
    },
    
    /**
     * JS.Test.Unit.Assertions#assert(bool, message) -> undefined
     * 
     * Asserts that `bool` is not falsey.
     **/
    assert: function(bool, message) {
      this.__wrapAssertion__(function() {
        this.assertBlock(this.buildMessage(message, "<?> is not true.", bool),
                         function() { return bool });
      });
    },
    
    /**
     * JS.Test.Unit.Assertions#assertEqual(expected, actual, message) -> undefined
     * 
     * Passes if `expected == actual` or if `expected.equals(actual) == true`.
     * 
     * Note that the ordering of arguments is important, since a helpful
     * error message is generated when this one fails that tells you the
     * values of expected and actual.
     **/
    assertEqual: function(expected, actual, message) {
      var fullMessage = this.buildMessage(message, "<?> expected but was\n<?>.", expected, actual);
      this.assertBlock(fullMessage, function() {
        return JS.Enumerable.areEqual(expected, actual);
      });
    },
    
    /**
     * JS.Test.Unit.Assertions#assertNotEqual(expected, actual, message) -> undefined
     * 
     * Passes if `actual` is not equal to `expected`.
     **/
    assertNotEqual: function(expected, actual, message) {
      var fullMessage = this.buildMessage(message, "<?> expected not to be equal to\n<?>.",
                                                   expected,
                                                   actual);
      this.assertBlock(fullMessage, function() {
        return !JS.Enumerable.areEqual(expected, actual);
      });
    },
    
    /**
     * JS.Test.Unit.Assertions#assertNull(object, message) -> undefined
     * 
     * Passes if `object` is `null`.
     **/
    assertNull: function(object, message) {
      this.assertEqual(null, object, message);
    },
    
    /**
     * JS.Test.Unit.Assertions#assertNotNull(object, message) -> undefined
     * 
     * Passes if `object` is not `null`.
     **/
    assertNotNull: function(object, message) {
      var fullMessage = this.buildMessage(message, "<?> expected not to be null.", object);
      this.assertBlock(fullMessage, function() { return object !== null });
    },
    
    /**
     * JS.Test.Unit.Assertions#assertKindOf(klass, object, message) -> undefined
     * 
     * Passes if `object` is a kind of `klass`.
     **/
    assertKindOf: function(klass, object, message) {
      this.__wrapAssertion__(function() {
        var type = (!object || typeof klass === 'string') ? typeof object : object.constructor;
        var fullMessage = this.buildMessage(message, "<?> expected to be an instance of\n" +
                                                     "<?> but was\n" +
                                                     "<?>.",
                                                     object, klass, type);
        this.assertBlock(fullMessage, function() { return JS.isType(object, klass) });
      });
    },
    
    /**
     * JS.Test.Unit.Assertions#assertRespondTo(object, method, message) -> undefined
     * 
     * Passes if `object` responds to `method`.
     **/
    assertRespondTo: function(object, method, message) {
      this.__wrapAssertion__(function() {
        var fullMessage = this.buildMessage('', "<?>\ngiven as the method name argument to #assertRespondTo must be a String.", method);
        
        this.assertBlock(fullMessage, function() { return typeof method === 'string' });
        
        var type = object ? object.constructor : typeof object;
        fullMessage = this.buildMessage(message, "<?>\n" +
                                                 "of type <?>\n" +
                                                 "expected to respond to <?>.",
                                                 object,
                                                 type,
                                                 method);
        this.assertBlock(fullMessage, function() { return object && object[method] !== undefined });
      });
    },
    
    /**
     * JS.Test.Unit.Assertions#assertMatch(pattern, string, message) -> undefined
     * 
     * Passes if `string` matches `pattern`.
     **/
    assertMatch: function(pattern, string, message) {
      this.__wrapAssertion__(function() {
        var fullMessage = this.buildMessage(message, "<?> expected to match\n<?>.", string, pattern);
        this.assertBlock(fullMessage, function() {
          return JS.isFn(pattern.test) ? pattern.test(string) : pattern.match(string);
        });
      });
    },
    
    /**
     * JS.Test.Unit.Assertions#assertNoMatch(pattern, string, message) -> undefined
     * 
     * Passes if `string` does not match `pattern`.
     **/
    assertNoMatch: function(pattern, string, message) {
      this.__wrapAssertion__(function() {
        var fullMessage = this.buildMessage(message, "<?> expected not to match\n<?>.", string, pattern);
        this.assertBlock(fullMessage, function() {
          return JS.isFn(pattern.test) ? !pattern.test(string) : !pattern.match(string);
        });
      });
    },
    
    /**
     * JS.Test.Unit.Assertions#assertSame(expected, actual, message) -> undefined
     * 
     * Passes if `actual` and `expected` are the same object.
     **/
    assertSame: function(expected, actual, message) {
      var fullMessage = this.buildMessage(message, "<?> expected to be the same as\n" +
                                                   "<?>.",
                                                   expected, actual);
      this.assertBlock(fullMessage, function() { return actual === expected });
    },
    
    /**
     * JS.Test.Unit.Assertions#assertNotSame(expected, actual, message) -> undefined
     * 
     * Passes if `actual` and `expected` are not the same object.
     **/
    assertNotSame: function(expected, actual, message) {
      var fullMessage = this.buildMessage(message, "<?> expected not to be the same as\n" +
                                                   "<?>.",
                                                   expected, actual);
      this.assertBlock(fullMessage, function() { return actual !== expected });
    },
    
    /**
     * JS.Test.Unit.Assertions#assertInDelta(expected, actual, delta, message) -> undefined
     * 
     * Passes if `expected` and `actual` are equal
     * within `delta` tolerance.
     **/
    assertInDelta: function(expected, actual, delta, message) {
      this.__wrapAssertion__(function() {
        this.assertKindOf('number', expected);
        this.assertKindOf('number', actual);
        this.assertKindOf('number', delta);
        this.assert(delta >= 0, "The delta should not be negative");
        
        var fullMessage = this.buildMessage(message, "<?> and\n" +
                                                     "<?> expected to be within\n" +
                                                     "<?> of each other.",
                                                     expected,
                                                     actual,
                                                     delta);
        this.assertBlock(fullMessage, function() {
          return Math.abs(expected - actual) <= delta;
        });
      });
    },
    
    /**
     * JS.Test.Unit.Assertions#assertSend(sendArray, message) -> undefined
     * 
     * Passes if the method send returns a truthy value.
     * 
     * `sendArray` is composed of:
     * * A receiver
     * * A method
     * * Arguments to the method
     **/
    assertSend: function(sendArray, message) {
      this.__wrapAssertion__(function() {
        this.assertKindOf(Array, sendArray, "assertSend requires an array of send information");
        this.assert(sendArray.length >= 2, "assertSend requires at least a receiver and a message name");
        var fullMessage = this.buildMessage(message, "<?> expected to respond to\n" +
                                                     "<?(?)> with a true value.",
                                                     sendArray[0],
                                                     JS.Test.Unit.Assertions.AssertionMessage.literal(sendArray[1]),
                                                     sendArray.slice(2));
        this.assertBlock(fullMessage, function() {
          return sendArray[0][sendArray[1]].apply(sendArray[0], sendArray.slice(2));
        });
      });
    },
    
    __processExceptionArgs__: function(args) {
      var args     = JS.array(args),
          context  = JS.isFn(args[args.length - 1]) ? null : args.pop(),
          block    = args.pop(),
          message  = JS.isType(args[args.length - 1], 'string') ? args.pop() : '',
          expected = new JS.Enumerable.Collection(args);
      
      return [args, expected, message, block, context];
    },
    
    /**
     * JS.Test.Unit.Assertions#assertThrow(args, message, block, context) -> undefined
     * 
     * Passes if the block throws one of the given exception types.
     **/
    assertThrow: function() {
      var A        = this.__processExceptionArgs__(arguments),
          args     = A[0],
          expected = A[1],
          message  = A[2],
          block    = A[3],
          context  = A[4];
      
      this.__wrapAssertion__(function() {
        var fullMessage = this.buildMessage(message, "<?> exception expected but none was thrown.", args),
            actualException;
        
        this.assertBlock(fullMessage, function() {
          try {
            block.call(context);
          } catch (e) {
            actualException = e;
            return true;
          }
          return false;
        });
        
        fullMessage = this.buildMessage(message, "<?> exception expected but was\n?", args, actualException);
        this.assertBlock(fullMessage, function() {
          return expected.any(function(type) {
            return JS.isType(actualException, type) || (actualException.name &&
                                                        actualException.name === type.name);
          });
        });
      });
    },
    
    /** alias of: JS.Test.Unit.Assertions#assertThrow
     * JS.Test.Unit.Assertions#assertThrows(args, message, block, context) -> undefined
     **/
    assertThrows: function() {
      return this.assertThrow.apply(this, arguments);
    },
    
    /**
     * JS.Test.Unit.Assertions#assertNothingThrown(args, message, block, context) -> undefined
     * 
     * Passes if the block does not throw an exception.
     **/
    assertNothingThrown: function() {
      var A        = this.__processExceptionArgs__(arguments),
          args     = A[0],
          expected = A[1],
          message  = A[2],
          block    = A[3],
          context  = A[4];
      
      this.__wrapAssertion__(function() {
        try {
          block.call(context);
        } catch (e) {
          if ((args.length === 0 && !JS.isType(e, JS.Test.Unit.AssertionFailedError)) ||
              expected.any(function(type) { return JS.isType(e, type) }))
            this.assertBlock(this.buildMessage(message, "Exception thrown:\n?", e), function() { return false });
          else
            throw e;
        }
      });
    },
    
    /**
     * JS.Test.Unit.Assertions#buildMessage(head, template, args) -> JS.Test.Unit.Assertions.AssertionMessage
     * 
     * Builds a failure message.  `head` is added before the `template` and
     * `args` replaces the `?`s positionally in the template.
     **/
    buildMessage: function() {
      var args     = JS.array(arguments),
          head     = args.shift(),
          template = args.shift();
      return new JS.Test.Unit.Assertions.AssertionMessage(head, template, args);
    },
    
    __wrapAssertion__: function(block) {
      if (this.__assertionWrapped__ === undefined) this.__assertionWrapped__ = false;
      if (!this.__assertionWrapped__) {
        this.__assertionWrapped__ = true;
        try {
          this.addAssertion();
          return block.call(this);
        } finally {
          this.__assertionWrapped__ = false;
        }
      } else {
        return block.call(this);
      }
    },
    
    /**
     * JS.Test.Unit.Assertions#addAssertion() -> undefined
     * 
     * Called whenever an assertion is made.  Define this in classes that
     * include `JS.Test.Unit.Assertions` to record assertion counts.
     **/
    addAssertion: function() {},
    
    extend: {
      AssertionMessage: new JS.Class({
        extend: {
          Literal: new JS.Class({
            initialize: function(value) {
              this._value = value;
              this.toString = this.inspect;
            },
            
            inspect: function() {
              return this._value.toString();
            }
          }),
          
          literal: function(value) {
            return new this.Literal(value);
          },
          
          Template: new JS.Class({
            extend: {
              create: function(string) {
                var parts = string ? string.match(/(?=[^\\])\?|(?:\\\?|[^\?])+/g) : [];
                return new this(parts);
              }
            },
            
            initialize: function(parts) {
              this._parts = new JS.Enumerable.Collection(parts);
              this.count = this._parts.findAll(function(e) { return e === '?' }).length;
            },
            
            result: function(parameters) {
              if (parameters.length !== this.count) throw "The number of parameters does not match the number of substitutions.";
              var params = JS.array(parameters);
              return this._parts.collect(function(e) {
                return e === '?' ? params.shift() : e.replace(/\\\?/g, '?');
              }).join('');
            }
          })
        },
        
        initialize: function(head, template, parameters) {
          this._head = head;
          this._templateString = template;
          this._parameters = new JS.Enumerable.Collection(parameters);
        },
        
        convert: function(object) {
          var E = JS.Enumerable;
          if (!object) return String(object);
          
          if (object instanceof Error)
            return object.name + (object.message ? ': ' + object.message : '');
          
          if (object instanceof Array)
            return '[' + new E.Collection(object).map(function(item) {
              return this.convert(item);
            }, this).join(',') + ']';
          
          if (object instanceof String || typeof object === 'string')
            return '"' + object + '"';
          
          if (object instanceof Function)
            return object.displayName ||
                   object.name ||
                  (object.toString().match(/^\s*function ([^\(]+)\(/) || [])[1] ||
                   '#function';
          
          if (object.toString && object.toString !== Object.prototype.toString)
            return object.toString();
          
          return '{' + new E.Collection(E.objectKeys(object).sort()).map(function(key) {
            return this.convert(key) + ':' + this.convert(object[key]);
          }, this).join(',') + '}';
        },
        
        template: function() {
          return this._template = this._template || this.klass.Template.create(this._templateString);
        },
        
        addPeriod: function(string) {
          return /\.$/.test(string) ? string : string + '.';
        },
        
        toString: function() {
          var messageParts = [], head, tail;
          if (this._head) messageParts.push(this.addPeriod(this._head));
          tail = this.template().result(this._parameters.collect(function(e) {
            return this.convert(e);
          }, this));
          if (tail !== '') messageParts.push(tail);
          return messageParts.join("\n");
        }
      })
    }
  })
});


/** section: test
 * class JS.Test.Unit.Failure
 * 
 * Encapsulates a test failure. Created by `JS.Test.Unit.TestCase`
 * when an assertion fails.
 **/
JS.Test.Unit.extend({
  Failure: new JS.Class({
    extend: {
      SINGLE_CHARACTER: 'F'
    },
    
    /**
     * new JS.Test.Unit.Failure(testName, message)
     * 
     * Creates a new `JS.Test.Unit.Failure` with the given location and
     * message.
     **/
    initialize: function(testName, message) {
      this._testName = testName;
      this._message  = message;
    },
    
    /**
     * JS.Test.Unit.Failure#singleCharacterDisplay() -> String
     * 
     * Returns a single character representation of a failure.
     **/
    singleCharacterDisplay: function() {
      return this.klass.SINGLE_CHARACTER;
    },
    
    /**
     * JS.Test.Unit.Failure#shortDisplay() -> String
     * 
     * Returns a brief version of the error description.
     **/
    shortDisplay: function() {
      return this._testName + ': ' + this._message.split("\n")[0];
    },
    
    /**
     * JS.Test.Unit.Failure#longDisplay() -> String
     * 
     * Returns a verbose version of the error description.
     **/
    longDisplay: function() {
      return "Failure:\n" + this._testName + ":\n" + this._message;
    },
    
    /**
     * JS.Test.Unit.Failure#toString() -> String
     * 
     * Overridden to return `longDisplay`.
     **/
    toString: function() {
      return this.longDisplay();
    }
  })
});


/** section: test
 * class JS.Test.Unit.Error
 * 
 * Encapsulates an error in a test. Created by
 * `JS.Test.Unit.TestCase` when it rescues an exception thrown
 * during the processing of a test.
 **/
JS.Test.Unit.extend({
  Error: new JS.Class({
    extend: {
      SINGLE_CHARACTER: 'E'
    },
    
    /**
     * new JS.Test.Unit.Error(testName, exception)
     * 
     * Creates a new `JS.Test.Unit.Error` with the given test name and
     * exception.
     **/
    initialize: function(testName, exception) {
      this._testName  = testName;
      this._exception = exception;
    },
    
    /**
     * JS.Test.Unit.Error#singleCharacterDisplay() -> String
     *
     * Returns a single character representation of an error.
     **/
    singleCharacterDisplay: function() {
      return this.klass.SINGLE_CHARACTER;
    },
    
    /**
     * JS.Test.Unit.Error#message() -> String
     * 
     * Returns the message associated with the error.
     **/
    message: function() {
      return this._exception.name + ': ' + this._exception.message;
    },
    
    /**
     * JS.Test.Unit.Error#shortDisplay() -> String
     * 
     * Returns a brief version of the error description.
     **/
    shortDisplay: function() {
      return this._testName + ': ' + this.message().split("\n")[0];
    },
    
    /**
     * JS.Test.Unit.Error#longDisplay() -> String
     * 
     * Returns a verbose version of the error description.
     **/
    longDisplay: function() {
      // var backtrace = this.klass.backtrace(this._exception).join("\n    ");
      return "Error:\n" + this._testName + ":\n" + this.message(); // + "\n    " + backtrace;
    },
    
    /**
     * JS.Test.Unit.Error#toString() -> String
     * 
     * Overridden to return `longDisplay`.
     **/
    toString: function() {
      return this.longDisplay();
    }
  })
});


/** section: test
 * class JS.Test.Unit.TestResult
 * includes JS.Test.Unit.Util.Observable
 * 
 * Collects `JS.Test.Unit.Failure` and `JS.Test.Unit.Error` so that
 * they can be displayed to the user. To this end, observers
 * can be added to it, allowing the dynamic updating of, say, a
 * UI.
 **/
JS.Test.Unit.extend({
  TestResult: new JS.Class({
    include: JS.Test.Unit.Util.Observable,
    
    extend: {
      CHANGED:  'CHANGED',
      FAULT:    'FAULT'
    },
    
    /**
     * new JS.Test.Unit.TestResult()
     * 
     * Constructs a new, empty `JS.Test.Unit.TestResult`.
     **/
    initialize: function() {
      this._runCount = this._assertionCount = 0;
      this._failures = [];
      this._errors   = [];
    },
    
    /**
     * JS.Test.Unit.TestResult#addRun() -> undefined
     * 
     * Records a test run.
     **/
    addRun: function() {
      this._runCount += 1;
      this.notifyListeners(this.klass.CHANGED, this);
    },
    
    /**
     * JS.Test.Unit.TestResult#addFailure(failure) -> undefined
     * 
     * Records a `JS.Test.Unit.Failure`.
     **/
    addFailure: function(failure) {
      this._failures.push(failure);
      this.notifyListeners(this.klass.FAULT, failure);
      this.notifyListeners(this.klass.CHANGED, this);
    },
    
    /**
     * JS.Test.Unit.TestResult#addError(error) -> undefined
     * 
     * Records a `JS.Test.Unit.Error`.
     **/
    addError: function(error) {
      this._errors.push(error);
      this.notifyListeners(this.klass.FAULT, error);
      this.notifyListeners(this.klass.CHANGED, this);
    },
    
    /**
     * JS.Test.Unit.TestResult#addAssertion() -> undefined
     * 
     * Records an individual assertion.
     **/
    addAssertion: function() {
      this._assertionCount += 1;
      this.notifyListeners(this.klass.CHANGED, this);
    },
    
    /**
     * JS.Test.Unit.TestResult#toString() -> String
     * 
     * Returns a string contain the recorded runs, assertions,
     * failures and errors in this `TestResult`.
     **/
    toString: function() {
      return this.runCount() + ' tests, ' + this.assertionCount() + ' assertions, ' +
             this.failureCount() + ' failures, ' + this.errorCount() + ' errors';
    },
    
    /**
     * JS.Test.Unit.TestResult#passed() -> Boolean
     * 
     * Returns whether or not this `TestResult` represents
     * successful completion.
     **/
    passed: function() {
      return this._failures.length === 0 && this._errors.length === 0;
    },
    
    /**
     * JS.Test.Unit.TestResult#runCount() -> Number
     * 
     * Returns the number of test runs this `TestResult` has
     * recorded.
     **/
    runCount: function() {
      return this._runCount;
    },
    
    /**
     * JS.Test.Unit.TestResult#assertionCount() -> Number
     * 
     * Returns the number of assertion this `TestResult` has
     * recorded.
     **/
    assertionCount: function() {
      return this._assertionCount;
    },
    
    /**
     * JS.Test.Unit.TestResult#failureCount() -> Number
     * 
     * Returns the number of failures this `TestResult` has
     * recorded.
     **/
    failureCount: function() {
      return this._failures.length;
    },
    
    /**
     * JS.Test.Unit.TestResult#errorCount() -> Number
     * 
     * Returns the number of errors this `TestResult` has
     * recorded.
     **/
    errorCount: function() {
      return this._errors.length;
    }
  })
});


/** section: test
 * class JS.Test.Unit.TestSuite
 * includes JS.Enumerable
 * 
 * A collection of tests which can be `JS.Test.Unit.TestSuite#run`.
 * 
 * Note: It is easy to confuse a `TestSuite` instance with
 * something that has a static `suite` method; I know because _I_
 * have trouble keeping them straight. Think of something that
 * has a suite method as simply providing a way to get a
 * meaningful `TestSuite` instance. [Nathaniel Talbott]
 **/
JS.Test.Unit.extend({
  TestSuite: new JS.Class({
    include: JS.Enumerable,
    
    extend: {
      STARTED:  'Test.Unit.TestSuite.STARTED',
      FINISHED: 'Test.Unit.TestSuite.FINISHED',
      
      forEach: function(tests, block, continuation, context) {
        var looping = false,
            n       = tests.length,
            i       = -1,
            calls   = 0;
        
        var ping = function() {
          calls += 1;
          if (typeof setTimeout === 'undefined') loop();
          else setTimeout(iterate, 1);
        };
        
        var loop = function() {
          if (looping) return;
          looping = true;
          while (calls > 0) iterate();
          looping = false;
        };
        
        var iterate = function() {
          i += 1; calls -= 1;
          if (i === n) return continuation && continuation.call(context || null);
          block.call(context || null, tests[i], ping);
        };
        
        ping();
      }
    },
    
    /**
     * new JS.Test.Unit.TestSuite(name)
     * 
     * Creates a new `JS.Test.Unit.TestSuite` with the given `name`.
     **/
    initialize: function(name) {
      this._name = name || 'Unnamed TestSuite';
      this._tests = [];
    },
    
    /**
     * JS.Test.Unit.TestSuite#forEach(block, continuation, context) -> undefined
     * 
     * Iterates over the tests and suites contained in
     * this `TestSuite`.
     **/
    forEach: function(block, continuation, context) {
      this.klass.forEach(this._tests, block, continuation, context);
    },
    
    /**
     * JS.Test.Unit.TestSuite#run(result, continuation, callback, context) -> undefined
     * 
     * Runs the tests and/or suites contained in this
     * `TestSuite`.
     **/
    run: function(result, continuation, callback, context) {
      callback.call(context || null, this.klass.STARTED, this._name);
      
      this.forEach(function(test, resume) {
        test.run(result, resume, callback, context)
        
      }, function() {
        callback.call(context || null, this.klass.FINISHED, this._name);
        continuation();
        
      }, this);
    },
    
    /**
     * JS.Test.Unit.TestSuite#push(test) -> this
     * 
     * Adds the `test` to the suite.
     **/
    push: function(test) {
      this._tests.push(test);
      return this;
    },
    
    /**
     * JS.Test.Unit.TestSuite#remove(test) -> undefined
     **/
    remove: function(test) {
      var i = this._tests.length;
      while (i--) {
        if (this._tests[i] === test) this._tests.splice(i,1);
      }
    },
    
    /**
     * JS.Test.Unit.TestSuite#size() -> Number
     * 
     * Retuns the rolled up number of tests in this suite;
     * i.e. if the suite contains other suites, it counts the
     * tests within those suites, not the suites themselves.
     **/
    size: function() {
      var totalSize = 0, i = this._tests.length;
      while (i--) {
        totalSize += this._tests[i].size();
      }
      return totalSize;
    },
    
    /**
     * JS.Test.Unit.TestSuite#empty() -> Boolean
     **/
    empty: function() {
      return this._tests.length === 0;
    },
    
    /**
     * JS.Test.Unit.TestSuite#toString() -> String
     * 
     * Overridden to return the name given the suite at
     * creation.
     **/
    toString: function() {
      return this._name;
    }
  })
});


JS.Test.Unit.extend({
  /** section: test
   * class JS.Test.Unit.TestCase
   * includes JS.Test.Unit.Assertions
   *
   * Ties everything together. If you subclass and add your own
   * test methods, it takes care of making them into tests and
   * wrapping those tests into a suite. It also does the
   * nitty-gritty of actually running an individual test and
   * collecting its results into a `JS.Test.Unit.TestResult` object.
   **/
  TestCase: new JS.Class({
    include: JS.Test.Unit.Assertions,
    
    extend: [JS.Enumerable, {
      testCases: [],
      
      clear: function() {
        this.testCases = [];
      },
      
      inherited: function(klass) {
        this.testCases.push(klass);
      },
      
      forEach: function(block, context) {
        for (var i = 0, n = this.testCases.length; i < n; i++)
          block.call(context || null, this.testCases[i]);
      },
      
      STARTED:  'Test.Unit.TestCase.STARTED',
      FINISHED: 'Test.Unit.TestCase.FINISHED',
      
      /**
       * JS.Test.Unit.TestCase.suite() -> JS.Test.Unit.TestSuite
       * 
       * Rolls up all of the `test*` methods in the fixture into
       * one suite, creating a new instance of the fixture for
       * each method.
       **/
      suite: function() {
        var methodNames = new JS.Enumerable.Collection(this.instanceMethods()),
            tests = methodNames.select(function(name) { return /^test./.test(name) }).sort(),
            suite = new JS.Test.Unit.TestSuite(this.displayName);
        
        for (var i = 0, n = tests.length; i < n; i++) {
          try { suite.push(new this(tests[i])) } catch (e) {}
        }
        if (suite.empty()) {
          try { suite.push(new this('defaultTest')) } catch (e) {}
        }
        return suite;
      }
    }],
    
    /**
     * new JS.Test.Unit.TestCase(testMethodName)
     * 
     * Creates a new instance of the fixture for running the
     * test represented by `testMethodName`.
     **/
    initialize: function(testMethodName) {
      if (!JS.isFn(this[testMethodName])) throw 'invalid_test';
      this._methodName = testMethodName;
      this._testPassed = true;
    },
    
    /**
     * JS.Test.Unit.TestCase#run(result, continuation, callback, context) -> undefined
     * 
     * Runs the individual test method represented by this
     * instance of the fixture, collecting statistics, failures
     * and errors in `result`.
     **/
    run: function(result, continuation, callback, context) {
      callback.call(context || null, this.klass.STARTED, this);
      this._result = result;
      
      var complete = function() {
        result.addRun();
        callback.call(context || null, this.klass.FINISHED, this);
        continuation();
      };
      
      var teardown = function() {
        this.exec('teardown', complete, this.processError(complete));
      };
      
      this.exec('setup', function() {
        this.exec(this._methodName, teardown, this.processError(teardown));
      }, this.processError(teardown));
    },
    
    exec: function(methodName, onSuccess, onError) {
      if (!methodName) return onSuccess.call(this);
      
      var method = JS.isFn(methodName) ? methodName : this[methodName],
          arity  = (method.arity === undefined) ? method.length : method.arity,
          self   = this;
      
      if (arity === 0)
        return this._runWithExceptionHandlers(function() {
          method.call(this);
          onSuccess.call(this);
        }, onError);
      
      this._runWithExceptionHandlers(function() {
        method.call(this, function(asyncBlock) {
          self.exec(asyncBlock, onSuccess, onError);
        })
      }, onError);
    },
    
    processError: function(doNext) {
      return function(e) {
        if (JS.isType(e, JS.Test.Unit.AssertionFailedError))
          this.addFailure(e.message);
        else
          this.addError(e);
        
        if (doNext) doNext.call(this);
      };
    },
    
    _runWithExceptionHandlers: function(_try, _catch, _finally) {
      try {
        _try.call(this);
      } catch (e) {
        if (_catch) _catch.call(this, e);
      } finally {
        if (_finally) _finally.call(this);
      }
    },
    
    /**
     * JS.Test.Unit.TestCase#setup(resume) -> undefined
     * 
     * Called before every test method runs. Can be used
     * to set up fixture information.
     **/
    setup: function(resume) { resume() },
    
    /**
     * JS.Test.Unit.TestCase#teardown(resume) -> undefined
     * 
     * Called after every test method runs. Can be used to tear
     * down fixture information.
     **/
    teardown: function(resume) { resume() },
    
    defaultTest: function() {
      return this.flunk('No tests were specified');
    },
    
    /**
     * JS.Test.Unit.TestCase#passed() -> Boolean
     * 
     * Returns whether this individual test passed or
     * not. Primarily for use in `JS.Test.Unit.TestCase#teardown`
     * so that artifacts can be left behind if the test fails.
     **/
    passed: function() {
      return this._testPassed;
    },
    
    size: function() {
      return 1;
    },
    
    addAssertion: function() {
      this._result.addAssertion();
    },
    
    addFailure: function(message) {
      this._testPassed = false;
      this._result.addFailure(new JS.Test.Unit.Failure(this.name(), message));
    },
    
    addError: function(exception) {
      this._testPassed = false;
      this._result.addError(new JS.Test.Unit.Error(this.name(), exception));
    },
    
    /**
     * JS.Test.Unit.TestCase#name() -> String
     * 
     * Returns a human-readable name for the specific test that
     * this instance of `JS.Test.Unit.TestCase` represents.
     **/
    name: function() {
      return this._methodName + '(' + this.klass.displayName + ')';
    },
    
    /**
     * JS.Test.Unit.TestCase#toString() -> String
     * 
     * Overridden to return `name`.
     **/
    toString: function() {
      return this.name();
    }
  })
});


JS.Test.Unit.extend({
  UI: new JS.Module({
    extend: {
      SILENT:         1,
      PROGRESS_ONLY:  2,
      NORMAL:         3,
      VERBOSE:        4,
      
      /** section: test
       * mixin JS.Test.Unit.UI.TestRunnerUtilities
       * 
       * Provides some utilities common to most, if not all,
       * TestRunners.
       **/
      TestRunnerUtilities: new JS.Module({
        /**
         * JS.Test.Unit.UI.TestRunnerUtilities#run(suite, outputLevel) -> JS.Test.Unit.TestResult
         * 
         * Creates a new TestRunner and runs the suite.
         **/
        run: function(suite, outputLevel) {
          return new this(suite, outputLevel ||JS.Test.Unit.UI.NORMAL).start();
        },
        
        /**
         * JS.Test.Unit.UI.TestRunnerUtilities#startCommandLineTest() -> undefined
         * 
         * Takes care of the ARGV parsing and suite
         * determination necessary for running one of the
         * TestRunners from the command line.
         **/
        startCommandLineTest: function() {
        /*
          if ARGV.empty?
            puts "You should supply the name of a test suite file to the runner"
            exit
          end
          require ARGV[0].gsub(/.+::/, '')
          new(eval(ARGV[0])).start
        */
        }
      })
    }
  })
});


JS.Test.Unit.UI.extend({
  /** section: test
   * class JS.Test.Unit.UI.TestRunnerMediator
   * includes JS.Test.Unit.Util.Observable
   * 
   * Provides an interface to write any given UI against,
   * hopefully making it easy to write new UIs.
   **/
  TestRunnerMediator: new JS.Class({
    extend: {
      RESET:    'Test.Unit.UI.TestRunnerMediator.RESET',
      STARTED:  'Test.Unit.UI.TestRunnerMediator.STARTED',
      FINISHED: 'Test.Unit.UI.TestRunnerMediator.FINISHED'
    },
    
    include: JS.Test.Unit.Util.Observable,
    
    /**
     * new JS.Test.Unit.UI.TestRunnerMediator(suite)
     * 
     * Creates a new `TestRunnerMediator` initialized to run
     * the passed suite.
     **/
    initialize: function(suite) {
      this._suite = suite;
    },
    
    /**
     * JS.Test.Unit.UI.TestRunnerMediator#runSuite(continuation, context) -> JS.Test.Unit.TestResult
     * 
     * Runs the suite the `TestRunnerMediator` was created with.
     **/
    runSuite: function(continuation, context) {
      var beginTime = new Date().getTime();
      this.notifyListeners(this.klass.RESET, this._suite.size());
      var result = this.createResult();
      this.notifyListeners(this.klass.STARTED, result);
      
      var reportResult = JS.bind(function() {
        result.removeListener(JS.Test.Unit.TestResult.FAULT, faultListener);
        result.removeListener(JS.Test.Unit.TestResult.CHANGED, resultListener);
        
        var endTime     = new Date().getTime(),
            elapsedTime = (endTime - beginTime) / 1000;
        
        this.notifyListeners(this.klass.FINISHED, elapsedTime);
        
        if (continuation) continuation.call(context || null, result);
      }, this);
      
      var resultListener = result.addListener(JS.Test.Unit.TestResult.CHANGED, function(updatedResult) {
        this.notifyListeners(JS.Test.Unit.TestResult.CHANGED, updatedResult);
      }, this);
      
      var faultListener = result.addListener(JS.Test.Unit.TestResult.FAULT, function(fault) {
        this.notifyListeners(JS.Test.Unit.TestResult.FAULT, fault);
      }, this);
      
      this._suite.run(result, reportResult, function(channel, value) {
        this.notifyListeners(channel, value);
      }, this);
    },
    
    /**
     * JS.Test.Unit.UI.TestRunnerMediator#createResult() -> JS.Test.Unit.TestResult
     * 
     * A factory method to create the result the mediator
     * should run with. Can be overridden by subclasses if
     * one wants to use a different result.
     **/
    createResult: function() {
      return new JS.Test.Unit.TestResult();
    }
  })
});


JS.Test.Unit.UI.extend({
  Console: new JS.Module({
    extend: {
      /** section: test
       * class JS.Test.Unit.UI.Console.TestRunner
       * 
       * Runs a `JS.Test.Unit.TestSuite` on the console.
       **/
      TestRunner: new JS.Class({
        extend: [JS.Test.Unit.UI.TestRunnerUtilities, {
          
          ANSI_CSI: String.fromCharCode(0x1B) + '[',
          MAX_BUFFER_LENGTH: 72
        }],
        
        /**
         * new JS.Test.Unit.UI.Console.TestRunner(suite, outputLevel)
         * 
         * Creates a new `JS.Test.Unit.UI.Console.TestRunner`
         * for running the passed `suite`.
         **/
        initialize: function(suite, outputLevel) {
          this._suite = JS.isFn(suite.suite) ? suite.suite() : suite;
          this._outputLevel = outputLevel || JS.Test.Unit.UI.NORMAL;
          this._alreadyOutputted = false;
          this._faults = [];
          this._lineBuffer = [];
        },
        
        /**
         * JS.Test.Unit.UI.Console.TestRunner#start() -> undefined
         * 
         * Begins the test run.
         **/
        start: function() {
          this._setupMediator();
          this._attachToMediator();
          return this._startMediator();
        },
        
        _setupMediator: function() {
          this._mediator = this._createMediator(this._suite);
          var suiteName = this._suite.toString();
          if (JS.isType(this._suite, JS.Module))
            suiteName = this._suite.displayName;
          this._output('Loaded suite ' + suiteName);
        },
        
        _createMediator: function(suite) {
          return new JS.Test.Unit.UI.TestRunnerMediator(suite);
        },
        
        _attachToMediator: function() {
          this._mediator.addListener(JS.Test.Unit.TestResult.FAULT, this.method('_addFault'));
          this._mediator.addListener(JS.Test.Unit.UI.TestRunnerMediator.STARTED, this.method('_started'));
          this._mediator.addListener(JS.Test.Unit.UI.TestRunnerMediator.FINISHED, this.method('_finished'));
          this._mediator.addListener(JS.Test.Unit.TestCase.STARTED, this.method('_testStarted'));
          this._mediator.addListener(JS.Test.Unit.TestCase.FINISHED, this.method('_testFinished'));
        },
        
        _startMediator: function() {
          return this._mediator.runSuite();
        },
        
        _addFault: function(fault) {
          this._faults.push(fault);
          this._outputSingle(fault.singleCharacterDisplay(), JS.Test.Unit.UI.PROGRESS_ONLY);
          this._alreadyOutputted = true;
        },
        
        _started: function(result) {
          this._result = result;
          this._output('Started');
        },
        
        _finished: function(elapsedTime) {
          this._nl();
          this._output('Finished in ' + elapsedTime + ' seconds.');
          for (var i = 0, n = this._faults.length; i < n; i++) {
            this._nl();
            this._output((i + 1) + ') ' + this._faults[i].longDisplay());
          }
          this._nl();
          this._output(this._result, JS.Test.Unit.UI.PROGRESS_ONLY);
        },
        
        _testStarted: function(testCase) {
          this._outputSingle(testCase.name() + ': ', JS.Test.Unit.UI.VERBOSE);
        },
        
        _testFinished: function(testCase) {
          if (!this._alreadyOutputted) this._outputSingle('.', JS.Test.Unit.UI.PROGRESS_ONLY);
          this._nl(JS.Test.Unit.UI.VERBOSE);
          this._alreadyOutputted = false;
        },
        
        _nl: function(level) {
          this._output('', level || JS.Test.Unit.UI.NORMAL);
        },
        
        _output: function(string, level) {
          if (!this._shouldOutput(level || JS.Test.Unit.UI.NORMAL)) return;
          this._lineBuffer = [];
          this._print(string);
        },
        
        _outputSingle: function(string, level) {
          if (!this._shouldOutput(level || JS.Test.Unit.UI.NORMAL)) return;
          
          if (typeof process === 'object') return require('sys').print(string);
          
          if (this._lineBuffer.length >= this.klass.MAX_BUFFER_LENGTH)
            this._lineBuffer = [];
          
          var esc = (this._lineBuffer.length === 0) ? '' : this._escape('F') + this._escape('K');
          this._lineBuffer.push(string);
          this._print(esc + this._lineBuffer.join(''));
        },
        
        _shouldOutput: function(level) {
          return level <= this._outputLevel;
        },
        
        _print: function(string) {
          if (typeof process === 'object') return require('sys').puts(string);
          if (typeof WScript !== 'undefined') return WScript.Echo(string);
          if (typeof print === 'function') return print(string);
        },
        
        _escape: function(string) {
          return this.klass.ANSI_CSI + string;
        }
      })
    }
  })
});


JS.Test.Unit.UI.extend({
  Browser: new JS.Module({
    extend: {
      /** section: test
       * class JS.Test.Unit.UI.Browser.TestRunner
       * 
       * Runs a `JS.Test.Unit.TestSuite` in the browser.
       **/
      TestRunner: new JS.Class({
        extend: JS.Test.Unit.UI.TestRunnerUtilities,
        
        /**
         * new JS.Test.Unit.UI.Browser.TestRunner(suite, outputLevel)
         * 
         * Creates a new `JS.Test.Unit.UI.Browser.TestRunner`
         * for running the passed `suite`.
         **/
        initialize: function(suite, outputLevel) {
          this._suite = JS.isFn(suite.suite) ? suite.suite() : suite;
          this._getDisplay();
        },
        
        _getDisplay: function() {
          return this._display = this._display || this.klass.Display.getInstance();
        },
        
        /**
         * JS.Test.Unit.UI.Browser.TestRunner#start() -> undefined
         * 
         * Begins the test run.
         **/
        start: function() {
          this._setupMediator();
          this._attachToMediator();
          return this._startMediator();
        },
        
        _setupMediator: function() {
          this._mediator = this._createMediator(this._suite);
        },
        
        _createMediator: function(suite) {
          return new JS.Test.Unit.UI.TestRunnerMediator(suite);
        },
        
        _attachToMediator: function() {
          this._mediator.addListener(JS.Test.Unit.TestResult.CHANGED, this.method('_onChange'));
          this._mediator.addListener(JS.Test.Unit.TestResult.FAULT, this.method('_addFault'));
          this._mediator.addListener(JS.Test.Unit.UI.TestRunnerMediator.STARTED, this.method('_started'));
          this._mediator.addListener(JS.Test.Unit.UI.TestRunnerMediator.FINISHED, this.method('_finished'));
          this._mediator.addListener(JS.Test.Unit.TestCase.STARTED, this.method('_testStarted'));
          this._mediator.addListener(JS.Test.Unit.TestCase.FINISHED, this.method('_testFinished'));
        },
        
        _startMediator: function() {
          return this._mediator.runSuite();
        },
        
        _onChange: function() {
          this._getDisplay().setTestCount(this._result.runCount());
          this._getDisplay().setAssertionCount(this._result.assertionCount());
          this._getDisplay().setFailureCount(this._result.failureCount());
          this._getDisplay().setErrorCount(this._result.errorCount());
        },
        
        _addFault: function(fault) {
          this._getDisplay().addFault(this._currentTest, fault);
        },
        
        _started: function(result) {
          this._result = result;
        },
        
        _finished: function(elapsedTime) {
          this._getDisplay().printSummary(elapsedTime);
        },
        
        _testStarted: function(testCase) {
          this._currentTest = testCase;
          this._getDisplay().addTestCase(testCase);
        },
        
        _testFinished: function(testCase) {
          this._getDisplay().finishTestCase(testCase);
        }
      })
    }
  })
});


JS.Test.Unit.UI.Browser.TestRunner.extend({
  Display: new JS.Class({
    extend: {
      getInstance: function() {
        return this._instance = this._instance || new this();
      },
      
      Context: new JS.Class({
        initialize: function(type, parent, name) {
          this._parent   = parent;
          this._type     = type;
          this._children = [];
          
          if (name === undefined) {
            this._ul = parent;
            return;
          }
          
          this._constructDOM(name);
        },
        
        _constructDOM: function(name) {
          var self = this, container = this._parent._ul || this._parent,
              fields = {_tests: 'T', _failures: 'F'};
          
          this._li = new JS.DOM.Builder(container).li({className: this._type + ' passed closed'},
          function(li) {
            li.ul({className: 'stats'}, function(ul) {
              for (var key in fields)
                ul.li(function(li) {
                  li.span({className: 'letter'}, fields[key] + ': ');
                  self[key] = li.span({className: 'number'}, '0');
                });
            });
            if (name) self._toggle = li.p({className: self._type + '-name'}, name);
            self._ul = li.ul({className: 'children'});
          });
          
          JS.DOM.Event.on(this._toggle, 'click', function() {
            JS.DOM.toggleClass(this._li, 'closed');
          }, this);
        },
        
        child: function(name) {
          return this._children[name] = this._children[name] ||
                                        new this.klass('spec', this, name);
        },
        
        addTest: function(name) {
          var test = this._children[name] = new this.klass('test', this, name);
          test.ping('_tests');
        },
        
        addFault: function(message) {
          var item = JS.DOM.li({className: 'fault'}, function(li) {
            li.p(function(p) {
              var parts = message.split(/[\r\n]+/);
              parts.splice(1,1);
              
              for (var i = 0, n = parts.length; i < n; i++) {
                if (i > 0) p.br();
                p.concat(parts[i]);
              }
            });
          });
          this._ul.appendChild(item);
          this.ping('_failures');
          this.fail();
        },
        
        ping: function(field) {
          if (!this[field]) return;
          this[field].innerHTML = parseInt(this[field].innerHTML) + 1;
          if (this._parent.ping) this._parent.ping(field);
        },
        
        fail: function() {
          if (!this._li) return;
          JS.DOM.removeClass(this._li, 'passed');
          JS.DOM.addClass(this._toggle, 'failed');
          if (this._parent.fail) this._parent.fail();
        }
      })
    },
    
    initialize: function() {
      this._constructDOM();
      document.body.insertBefore(this._container, document.body.firstChild);
    },
    
    _constructDOM: function() {
      var self = this;
      self._container = JS.DOM.div({className: 'test-result-container'}, function(div) {
        div.table({className: 'report'}, function(table) {
          table.thead(function(thead) {
            thead.tr(function(tr) {
              tr.th({scope: 'col'}, 'Tests');
              tr.th({scope: 'col'}, 'Assertions');
              tr.th({scope: 'col'}, 'Failures');
              tr.th({scope: 'col'}, 'Errors');
            });
          });
          table.tbody(function(tbody) {
            tbody.tr(function(tr) {
              self._tests      = tr.td();
              self._assertions = tr.td();
              self._failures   = tr.td();
              self._errors     = tr.td();
            });
          });
        });
        self._context = new self.klass.Context('spec', div.ul({className: 'specs'}));
        self._summary = div.p({className: 'summary'});
      });
    },
    
    setTestCount: function(n) {
      this._tests.innerHTML = String(n);
    },
    
    setAssertionCount: function(n) {
      this._assertions.innerHTML = String(n);
    },
    
    setFailureCount: function(n) {
      this._failures.innerHTML = String(n);
    },
    
    setErrorCount: function(n) {
      this._errors.innerHTML = String(n);
    },
    
    addTestCase: function(testCase) {
      var data    = this._testData(testCase),
          name    = data.name,
          context = data.context;
      
      context.addTest(name);
    },
    
    finishTestCase: function(testCase) {
    
    },
    
    addFault: function(testCase, fault) {
      var data    = this._testData(testCase),
          name    = data.name,
          context = data.context;
      
      context.child(name).addFault(fault.longDisplay());
    },
    
    printSummary: function(elapsedTime) {
      this._summary.innerHTML = 'Finished in ' + elapsedTime + ' seconds.';
    },
    
    _testData: function(testCase) {
      var name    = testCase.name(),
          klass   = testCase.klass,
          context = klass.getContextName ? klass.getContextName() : klass.displayName,
          parents = new JS.Enumerable.Collection();
      
      name = name.replace(context, '')
                 .replace(context, '')
                 .replace(/\(.*?\)$/g, '')
                 .replace(/^test\W+/g, '');
      
      while (klass !== JS.Test.Unit.TestCase) {
        parents.push(klass);
        klass = klass.superclass;
      }
      
      context = parents.reverseForEach().inject(this._context, function(context, klass) {
        return context.child(klass._contextName || klass.displayName);
      });
      return {name: name, context: context};
    }
  })
});


JS.Test.Unit.extend({
  /** section: test
   * class JS.Test.Unit.AutoRunner
   **/
  AutoRunner: new JS.Class({
    extend: {
      /**
       * JS.Test.Unit.AutoRunner.run() -> JS.Test.Unit.TestResult
       **/
      run: function(outputLevel) {
        var runner = this.getRunner(),
            names  = [],
            suites = [];
        
        JS.Test.Unit.TestCase.forEach(function(testcase) {
          names.push(testcase.displayName);
          suites.push(testcase.suite());
        });
        
        var suite = new JS.Test.Unit.TestSuite(names.join(', '));
        for (var i = 0, n = suites.length; i < n; i++)
          suite.push(suites[i]);
        
        JS.Test.Unit.TestCase.clear();
        return runner.run(suite, this.OUTPUT_LEVELS[outputLevel || 'normal']);
      },
      
      getRunner: function() {
        return (typeof window !== 'undefined')
              ? this.RUNNERS.browser
              : this.RUNNERS.console;
      },
      
      RUNNERS: {
        console:  JS.Test.Unit.UI.Console.TestRunner,
        browser:  JS.Test.Unit.UI.Browser.TestRunner
      },
      
      OUTPUT_LEVELS: {
        silent:   JS.Test.Unit.UI.SILENT,
        progress: JS.Test.Unit.UI.PROGRESS_ONLY,
        normal:   JS.Test.Unit.UI.NORMAL,
        verbose:  JS.Test.Unit.UI.VERBOSE
      }
    }
  })
});

JS.Test.extend({ autorun: JS.Test.Unit.AutoRunner.method('run') });


JS.Test.extend({
  /** section: test
   * mixin JS.Test.Context
   * 
   * `JS.Test.Context` is a JavaScript version of Context, an extension for
   * `Test::Unit` written by Jeremy McAnally. It provides a DSL for more
   * readable test suites using nestable context blocks with before/after
   * hooks and natural-language test names.
   * 
   * Copyright (c) 2008 Jeremy McAnally
   * 
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   * 
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   * 
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
   * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
   * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
   * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
   * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
   * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
   * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
   **/
  Context: new JS.Module({
    extend: {
      included: function(base) {
        base.extend(JS.Test.Context.Context);
        base.include(JS.Test.Context.LifeCycle);
        base.extend(JS.Test.Context.Test);
      },
      
      /** section: test
       * mixin JS.Text.Context.Context
       **/
      Context: new JS.Module({
        getContextName: function() {
          this._contextName = this._contextName || '';
          return JS.isFn(this.superclass.getContextName)
            ? (this.superclass.getContextName() + ' ' + this._contextName).replace(/^\s+/, '')
            : this.displayName;
        },
        
        setContextName: function(name) {
          this._contextName = name;
        },
        
        /**
         * JS.Text.Context.Context#context(name, block) -> JS.Class
         * 
         * Add a context to a set of tests.
         * 
         *   context("a new account", function() { with(this) {
         *     it("should not have users", function() {
         *       this.assert( new Account().users.empty() );
         *     })
         *   }})
         * 
         * The context name is prepended to the test name, so failures look like this:
         * 
         *   1) Failure:
         *   test a new account should not have users():
         *   <false> is not true.
         * 
         * Contexts can also be nested like so:
         * 
         *   context("a new account", function() { with(this) {
         *     context("created by the web application", function() { with(this) {
         *       it("should have web as its vendor", function() {
         *         this.assertEqual( "web", users('web_user').vendor );
         *       })
         *     }})
         *   }})
         **/
        context: function(name, block) {
          var klass = new JS.Class(this);
          klass.setContextName(name.toString());
          klass.setName(klass.getContextName());
          JS.Ruby(klass, block);
          return klass;
        }
      })
    }
  }),
  
  describe: function(name, block) {
    var klass = new JS.Class(name.toString(), JS.Test.Unit.TestCase);
    klass.include(JS.Test.Context);
    JS.Ruby(klass, block);
    return klass;
  }
});

JS.Test.Context.Context.include({
  describe: JS.Test.Context.Context.instanceMethod('context')
});

JS.Test.extend({
  context:  JS.Test.describe
});


/** section: test
 * mixin JS.Test.Context.LifeCycle
 **/
JS.Test.Context.LifeCycle = new JS.Module({
  extend: {
    included: function(base) {
      base.extend(this.ClassMethods);
      
      base.before_all_callbacks     = [];
      base.before_each_callbacks    = [];
      base.after_all_callbacks      = [];
      base.after_each_callbacks     = [];
      base.before_should_callbacks  = {};
      
      base.extend({
        inherited: function(child) {
          this.callSuper();
          child.before_all_callbacks    = [];
          child.before_each_callbacks   = [];
          child.after_all_callbacks     = [];
          child.after_each_callbacks    = [];
          child.before_should_callbacks = {};
        }
      });
    },
    
    ClassMethods: new JS.Module({
      before: function(period, block) {
        if (JS.isFn(period) || !block) {
          block  = period;
          period = 'each';
        }
        
        this['before_' + (period + '_') + 'callbacks'].push(JS.Ruby.selfless(block));
      },
      
      after: function(period, block) {
        if (JS.isFn(period) || !block) {
          block  = period;
          period = 'each';
        }
        
        this['after_' + (period + '_') + 'callbacks'].push(JS.Ruby.selfless(block));
      },
      
      gatherCallbacks: function(callbackType, period) {
        var callbacks = JS.isFn(this.superclass.gatherCallbacks)
          ? this.superclass.gatherCallbacks(callbackType, period)
          : [];
        
        var mine = this[callbackType + '_' + (period + '_') + 'callbacks'];
        for (var i = 0, n = mine.length; i < n; i++)
          callbacks.push(mine[i]);
        
        return callbacks;
      }
    })
  },
  
  setup: function(resume) {
    var self = this;
    this.callSuper(function() {
      if (self.klass.before_should_callbacks[self._methodName])
        self.klass.before_should_callbacks[self._methodName].call(self);
      
      self.runCallbacks('before', 'each', resume);
    });
  },
  
  teardown: function(resume) {
    var self = this;
    this.callSuper(function() {
      self.runCallbacks('after', 'each', resume);
    });
  },
  
  runCallbacks: function(callbackType, period, continuation) {
    var callbacks = this.klass.gatherCallbacks(callbackType, period);
    
    JS.Test.Unit.TestSuite.forEach(callbacks, function(callback, resume) {
      this.exec(callback, resume, this.processError(resume));
      
    }, continuation, this);
  },
  
  runAllCallbacks: function(callbackType, continuation, context) {
    var previousIvars = this.instanceVariables();
    this.runCallbacks(callbackType, 'all', function() {
      
      var ivars = this.instanceVariables().inject({}, function(hash, ivar) {
        if (previousIvars.member(ivar)) return hash;
        hash[ivar] = this[ivar];
        return hash;
      }, this);
      
      if (continuation) continuation.call(context || null, ivars);
    });
  },
  
  setValuesFromCallbacks: function(values) {
    for (var key in values)
      this[key] = values[key];
  },
  
  instanceVariables: function() {
    var ivars = [];
    for (var key in this) {
      if (this.hasOwnProperty(key)) ivars.push(key);
    }
    return new JS.Enumerable.Collection(ivars);
  }
});

(function() {
  var m = JS.Test.Context.LifeCycle.ClassMethods.method('instanceMethod');
  
  JS.Test.Context.LifeCycle.ClassMethods.include({
    setup:    m('before'),
    teardown: m('after')
  });
})();


JS.Test.Context.extend({
  /** section: test
   * class JS.Test.Context.SharedBehavior
   **/
  SharedBehavior: new JS.Class(JS.Module, {
    extend: {
      createFromBehavior: function(beh) {
        var mod = new this();
        mod._behavior = beh;
        return mod;
      },
      
      moduleName: function(name) {
        return name.toLowerCase()
                   .replace(/[\s:',\.~;!#=\(\)&]+/g, '_')
                   .replace(/\/(.?)/g, function(m,a) { return "." + a.toUpperCase() })
                   .replace(/(?:^|_)(.)/g, function(m,a) { return a.toUpperCase() });
      }
    },
    
    included: function(arg) {
      JS.Ruby(arg, this._behavior);
    }
  }),
  
  ENV: (function() { return this })()
});

JS.Test.Unit.TestCase.extend({
  /**
   * JS.Test.Unit.TestCase.shared(name, block) -> undefined
   * 
   * Share behavior among different contexts.  This creates a module (actually, a Module subclass)
   * that is included using the `use` method (or one of its aliases) provided by context or `include` 
   * if you know the module's constant name.
   *
   * ==== Examples
   *   
   *   shared("other things", function() { with(this) {
   *     it("should do things but not some things", function() { with(this) {
   *       // behavior is fun
   *     }})
   *   }})
   *   
   *   use("other things")
   *   // or...
   *   itShouldBehaveLike("other things")
   *   uses("other things")
   *   behavesLike("other things")
   *
   */
  shared: function(name, block) {
    name = JS.Test.Context.SharedBehavior.moduleName(name);
    JS.Test.Context.ENV[name] = JS.Test.Context.SharedBehavior.createFromBehavior(block);
  },
  
  /**
   * JS.Test.Unit.TestCase.use(name) -> undefined
   * 
   * Pull in behavior shared by `shared` or a module.  
   *
   * ==== Examples
   *   
   *   shared("other things", function() { with(this) {
   *     it("should do things but not some things", function() { with(this) {
   *       // behavior is fun
   *     }})
   *   }})
   *   
   *   use("other things")
   *   // or...
   *   itShouldBehaveLike("other things")
   *   
   *   Things = new JS.Module()
   *   
   *   uses(Things)
   *
   */
  use: function(sharedName) {
    if (JS.isType(sharedName, JS.Test.Context.SharedBehavior) ||
        JS.isType(sharedName, JS.Module))
      this.include(sharedName);
    
    else if (JS.isType(sharedName, 'string')) {
      var name = JS.Test.Context.SharedBehavior.moduleName(sharedName),
          beh  = JS.Test.Context.ENV[name];
      
      if (!beh) throw new Error('Could not find example group named "' + sharedName + '"');
      this.include(beh);
    }
  }
});

(function() {
  var alias = function(method, aliases) {
    var extension = {};
    for (var i = 0, n = aliases.length; i < n; i++)
      extension[aliases[i]] = JS.Test.Unit.TestCase[method];
    JS.Test.Unit.TestCase.extend(extension);
  };
  
  alias('shared', ['sharedBehavior', 'shareAs', 'shareBehaviorAs', 'sharedExamplesFor']);
  alias('use', ['uses', 'itShouldBehaveLike', 'behavesLike', 'usesExamplesFrom']);
})();


/** section: test
 * mixin JS.Test.Context.Test
 **/
JS.Test.Context.Test = new JS.Module({
  /**
   * JS.Test.Context.Test#test(name, opts, block) -> undefined
   * 
   * Create a test method. `name` is a native-language string to describe the test
   * (e.g., no more `testThisCrazyThingWithCamelCase`).
   *
   *     test("A user should not be able to delete another user", function() { with(this) {
   *       assert( user.can('delete', otherUser) );
   *     }})
   **/
  test: function(name, opts, block) {
    var testName = 'test:', contextName = this.getContextName();
    if (contextName) testName += ' ' + contextName;
    testName += ' ' + name;
    
    if (this.instanceMethod(testName)) throw new Error(testName + ' is already defined in ' + this.displayName);
    
    opts = opts || {};
    
    if (JS.isFn(opts)) {
      block = opts;
    } else {     
      if (opts.before !== undefined)
        this.before_should_callbacks[testName] = opts.before;
    }
    
    this.define(testName, JS.Ruby.selfless(block));
  },
  
  beforeTest: function(name, block) {
    this.test(name, {before: block}, function() {});
  }
});

(function() {
  var m = JS.Test.Context.Test.method('instanceMethod');
  
  JS.Test.Context.Test.include({
    it:     m('test'),
    should: m('test'),
    tests:  m('test'),
    
    beforeIt:     m('beforeTest'),
    beforeShould: m('beforeTest'),
    beforeTests:  m('beforeTest')
  });
})();


JS.Test.Unit.TestCase.extend({
  // Tweaks to standard method so we don't get superclass methods and we don't
  // get weird default tests
  suite: function() {
    var methodNames = new JS.Enumerable.Collection(this.instanceMethods(false)),
        tests = methodNames.select(function(name) { return /^test./.test(name) }).sort(),
        suite = new JS.Test.Unit.TestSuite(this.displayName);
    
    for (var i = 0, n = tests.length; i < n; i++) {
      try { suite.push(new this(tests[i])) } catch (e) {}
    }
    
    return suite;
  }
});

JS.Test.Unit.TestSuite.include({
  run: function(result, continuation, callback, context) {
    callback.call(context || null, this.klass.STARTED, this._name);
    
    var withIvars = function(ivarsFromCallback) {
      this.forEach(function(test, resume) {
        if (ivarsFromCallback) test.setValuesFromCallbacks(ivarsFromCallback);
        test.run(result, resume, callback, context);
        
      }, function() {
        var afterCallbacks = function() {
          callback.call(context || null, this.klass.FINISHED, this._name);
          continuation();
        };
        if (ivarsFromCallback) first.runAllCallbacks('after', afterCallbacks, this);
        else afterCallbacks.call(this);
        
      }, this);
    };
    
    var first = this._tests[0], ivarsFromCallback = null;
    
    if (first && first.runAllCallbacks)
      first.runAllCallbacks('before', withIvars, this);
    else
      withIvars.call(this, null);
  }
});


JS.Test.extend({
  Helpers: new JS.Module({
    $R: function(start, end) {
      return new JS.Range(start, end);
    },
    
    $w: function(string) {
      return string.split(/\s+/);
    },
    
    forEach: function(list, block, context) {
      for (var i = 0, n = list.length; i < n; i++) {
        block.call(context || null, list[i], i);
      }
    },
    
    its: function() {
      return new JS.MethodChain();
    },
    
    map: function(list, block, context) {
      return new JS.Enumerable.Collection(list).map(block, context)
    },
    
    repeat: function(n, block, context) {
      while (n--) block.call(context);
    }
  })
});