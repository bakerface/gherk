var should = require('should');
var gherk = require('..');

describe('gherk.test()', function() {
  var test, feature = [
    'Feature: Can drink beer when thirsty',
    '  As a drinker',
    '  I want to take beer off the wall',
    '  In order to satisfy my thirst',
    '',
    '  Scenario: Can take a single beer',
    '    Given 100 bottles of beer on the wall',
    '    When a bottle is taken down',
    '    Then there are 99 bottles of beer on the wall',
    '',
    '  Scenario: Can take multiple beers',
    '    Given 100 bottles of beer on the wall',
    '    When 5 bottles are taken down',
    '    Then there are 95 bottles of beer on the wall',
    '',
    '  Scenario: Ghosts can drink',
    '    Given 100 bottles of beer on the wall',
    '    And there is nobody in the room',
    '    When 5 bottles are taken down',
    '    And they are floating in the air',
    '    Then there are 95 bottles of beer on the wall',
    '    And there are ghosts in the room'
  ].join('\r\n');

  beforeEach(function() {
    test = gherk.test();
  })

  describe('when the callback is undefined', function() {
    it('should throw any error that is returned', function(done) {
      try {
        test(feature);
      }
      catch (e) {
        should(e).eql({
          kind: 'error#undefined-given',
          feature: 'Can drink beer when thirsty',
          scenario: 'Can take a single beer',
          given: '100 bottles of beer on the wall',
          name: 'UndefinedGiven',
          message: [
            '"100 bottles of beer on the wall"',
            '  in Scenario: "Can take a single beer"',
            '  in Feature: "Can drink beer when thirsty"'
          ].join('\n')
        });

        done();
      }
    })
  })

  describe('when a "given" is undefined', function() {
    it('should return an error', function(done) {
      test(feature, function(e) {
        should(e).eql({
          kind: 'error#undefined-given',
          feature: 'Can drink beer when thirsty',
          scenario: 'Can take a single beer',
          given: '100 bottles of beer on the wall',
          name: 'UndefinedGiven',
          message: [
            '"100 bottles of beer on the wall"',
            '  in Scenario: "Can take a single beer"',
            '  in Feature: "Can drink beer when thirsty"'
          ].join('\n')
        });

        done();
      })
    })
  })

  describe('when the "given" are defined', function() {
    beforeEach(function() {
      test.given(/(\d+) bottles of beer on the wall/, function(bottles, done) {
        this.bottles = bottles;
        done();
      });

      test.given(/there is nobody in the room/, function(done) {
        done();
      });
    })

    describe('when a "when" is undefined', function() {
      it('should return an error', function(done) {
        test(feature, function(e) {
          should(e).eql({
            kind: 'error#undefined-when',
            feature: 'Can drink beer when thirsty',
            scenario: 'Can take a single beer',
            when: 'a bottle is taken down',
            name: 'UndefinedWhen',
            message: [
              '"a bottle is taken down"',
              '  in Scenario: "Can take a single beer"',
              '  in Feature: "Can drink beer when thirsty"'
            ].join('\n')
          });

          done();
        })
      })
    })

    describe('when the "when" are defined', function() {
      beforeEach(function() {
        test.when(/a bottle is taken down/, function(done) {
          this.bottles--;
          done();
        });

        test.when(/they are floating in the air/, function(done) {
          done();
        });

        test.when(/(\d+) bottles are taken down/, function(bottles, done) {
          this.bottles -= bottles;
          done();
        });
      })

      describe('when a "then" is undefined', function() {
        it('should return an error', function(done) {
          test(feature, function(e) {
            should(e).eql({
              kind: 'error#undefined-then',
              feature: 'Can drink beer when thirsty',
              scenario: 'Can take a single beer',
              then: 'there are 99 bottles of beer on the wall',
              name: 'UndefinedThen',
              message: [
                '"there are 99 bottles of beer on the wall"',
                '  in Scenario: "Can take a single beer"',
                '  in Feature: "Can drink beer when thirsty"'
              ].join('\n')
            });

            done();
          })
        })
      })

      describe('when the "then" are defined', function() {
        function assertion(bottles, done) {
          should(this.bottles).eql(parseInt(bottles));
          done();
        }

        beforeEach(function() {
          test.then(/there are (\d+) bottles of beer on the wall/, assertion);
          test.then(/there are ghosts in the room/, function(done) { done(); });
        })

        it('should run the functions in order', function(done) {
          test(feature, done);
        })

        it('should allow the callback to be undefined', function(done) {
          test(feature);
          done();
        })

        describe('when "before" and "after" are defined', function() {
          var order = [ ];

          beforeEach(function() {
            test.beforeFeature(function(feature, done) {
              order.push('feature:' + feature);
              done();
            });

            test.afterFeature(function(feature, done) {
              order.push('~feature:' + feature);
              done();
            });

            test.beforeScenario(function(feature, scenario, done) {
              order.push('scenario:' + feature + ':' + scenario);
              done();
            });

            test.afterScenario(function(feature, scenario, done) {
              order.push('~scenario:' + feature + ':' + scenario);
              done();
            });
          })

          it('should run before and after each scenario', function(done) {
            test(feature, function(e) {
              should(e).eql(undefined);

              should(order).eql([
                'feature:Can drink beer when thirsty',
                'scenario:Can drink beer when thirsty:Can take a single beer',
                '~scenario:Can drink beer when thirsty:Can take a single beer',
                'scenario:Can drink beer when thirsty:Can take multiple beers',
                '~scenario:Can drink beer when thirsty:Can take multiple beers',
                'scenario:Can drink beer when thirsty:Ghosts can drink',
                '~scenario:Can drink beer when thirsty:Ghosts can drink',
                '~feature:Can drink beer when thirsty'
              ]);

              done();
            });
          })
        })
      })
    })
  })
})
