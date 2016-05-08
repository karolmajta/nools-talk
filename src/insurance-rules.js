var nools = require('nools');

// IF insured person is younger than 18 THEN he/she should have no heart disease
// IF insured person has heart disease THEN he/she should buy premium insurance
// IF insured person is over 70 THEN he/she should have a heart disease
// IF insurance value is over 50000 THEN it should be premium

var Person = function (id, name, age) {
    this.id = id;
    this.name = name;
    this.age = age;
};

var Insurance = function (person, value) {
    this.person = person;
    this.value = value;
};

var HeartDisease = function (person) {
    this.person = person;
};

var Premium = function (person) {
    this.person = person;
};

module.exports = {
    flow: nools.flow("Insurance", function (flow) {

        // IF insured person is younger than 18 THEN he/she has no heart disease
        flow.rule("No heart diseases for older younger than 18",
            [[Person, "p", "p.age < 18"],
             [HeartDisease, "h", "h.person == p.id"]], function (facts) {

            this.retract(facts.h);
            });

        // IF insured person is over 70 THEN he/she has a heart disease
        flow.rule("Haert diseases for older than 70",
            [[Person, "p", "p.age > 70"],
             ["not", HeartDisease, "h", "h.person == p.id"]], function (facts) {

            this.assert(new HeartDisease(facts.p.id))
        });

        // IF insured person has heart disease THEN he/she must buy premium insurance
        flow.rule("Premium for ones with heart disease",
            [[HeartDisease, "h", "true"],
             [Person, "p", "p.id == h.person"],
             ["not", Premium, "premium", "premium.person == p.id"]], function (facts) {

            this.assert(new Premium(facts.p.id))
        });

        // IF insurance value is over 50000 THEN it must be premium
        flow.rule("Premium for insurances over 5000",
            [[Insurance, "i", "i.value > 50000"],
             ["not", Premium, "p", "p.person == i.person"]], function (facts) {

            this.assert(new Premium(facts.i.person));

        })

    }),

    Person: Person,
    Insurance: Insurance,
    Premium: Premium,
    HeartDisease: HeartDisease
};