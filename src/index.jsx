var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');
var uuid = require('uuid4');

var insuranceRules = require('./insurance-rules');

var InsuranceForm = React.createClass({
    buildState: function () {
        return {
            people: _.object(_.map(this.session.getFacts(insuranceRules.Person), function (p) {return [p.id, p]; })),
            insurances: _.object(_.map(this.session.getFacts(insuranceRules.Insurance), function (i) { return [i.person, i]; })),
            premiumInsurances: _.object(_.map(this.session.getFacts(insuranceRules.Premium), function (p) { return [p.person, p]; })),
            diseases: _.object(_.map(this.session.getFacts(insuranceRules.HeartDisease), function (d) { return [d.person, d]; })),
        };
    },
    getInitialState: function () {
        this.session = insuranceRules.flow.getSession();
        var personId = uuid().toString();
        this.session.assert(new insuranceRules.Person(personId, "Karol", 25));
        this.session.assert(new insuranceRules.Insurance(personId, 10000));
        return this.buildState(this.session);
    },
    render: function () {
        var people = _.values(this.state.people);
        var insurances = this.state.insurances;
        var premiums = this.state.premiumInsurances;
        var diseases = this.state.diseases;
        var onPersonChange = this.onPersonChange;
        var onInsuranceChange = this.onInsuranceChange;
        var onDiseaseChange = this.onDiseaseChange;
        var onPremiumChange = this.onPremiumChange;
        return (
            <div>
                <div class="starter-template">
                    <h1>Insurance form</h1>
                    <hr />
                    {people.map(function (p) {
                        return <PersonInsuranceForm key={p.id}
                                                    person={p}
                                                    insurance={insurances[p.id]}
                                                    premium={premiums[p.id]}
                                                    disease={diseases[p.id]}
                                                    onPersonChange={onPersonChange}
                                                    onInsuranceChange={onInsuranceChange}
                                                    onDiseaseChange={onDiseaseChange}
                                                    onPremiumChange={onPremiumChange} />;
                    })}
                </div>
            </div>
        );
    },
    onPersonChange: function (p) {
        this.session.retract(this.state.people[p.id]);
        this.session.assert(p);
        this.setState(this.buildState());
        this.fireRules();
    },
    onInsuranceChange: function (i) {
        this.session.retract(this.state.insurances[i.person]);
        this.session.assert(i);
        this.setState(this.buildState());
        this.fireRules();
    },
    onDiseaseChange: function (person, value) {
        this.session.getFacts(insuranceRules.HeartDisease)
            .filter((function (h) { return h.person == person; }).bind(this))
            .forEach((function (h) { this.session.retract(h); }).bind(this));
        if (value) {
            this.session.assert(new insuranceRules.HeartDisease(person));
        }
        this.setState(this.buildState());
        this.fireRules();
    },
    onPremiumChange: function (person, value) {
        this.session.getFacts(insuranceRules.Premium)
            .filter((function (p) { return p.person == person; }).bind(this))
            .forEach((function (p) { this.session.retract(p); }).bind(this));
        if (value) {
            this.session.assert(new insuranceRules.Premium(person));
        }
        this.setState(this.buildState());
        this.fireRules();
    },
    fireRules: function () {
        this.session.match((function (err) {
            if (err) {
                console.warn(err);
            } else {
                this.setState(this.buildState());
            }
        }).bind(this));
    }
});

var PersonInsuranceForm = React.createClass({
    render: function () {
        var p = this.props.person;
        var i = this.props.insurance;
        return (
            <div>
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" class="form-control" placeholder="name" value={p.name}
                           onChange={(function (e) {
                                        this.props.onPersonChange(new insuranceRules.Person(p.id, e.target.value, p.age));
                                    }).bind(this)} />
                </div>
                <div class="form-group">
                    <label>age</label> <span>({p.age})</span>
                    <input type="range" class="form-control" min="0" max="100" step="1" value={p.age}
                           onChange={(function (e) {
                                        this.props.onPersonChange(new insuranceRules.Person(p.id, p.name, e.target.value));
                                    }).bind(this)}/>
                </div>
                <div class="form-group">
                    <label>Value</label> <span>({i.value})</span>
                    <input type="range" class="form-control" min="1000" max="100000" step="1000" value={i.value}
                           onChange={(function (e) {
                                        this.props.onInsuranceChange(new insuranceRules.Insurance(i.person, e.target.value));
                                    }).bind(this)} />
                </div>
                <div class="form-group">
                    <label>premium?</label>
                    <input type="checkbox" class="form-control" checked={this.props.premium}
                           onChange={(function (e) {
                                        this.props.onPremiumChange(i.person, e.target.checked)
                                    }).bind(this)}/>
                </div>
                <div class="form-group">
                    <label>heart disease?</label>
                    <input type="checkbox" class="form-control" checked={this.props.disease}
                           onChange={(function (e) {
                                        this.props.onDiseaseChange(i.person, e.target.checked);
                                    }).bind(this)} />
                </div>
            </div>
        )
    }
});

ReactDOM.render(<InsuranceForm />, document.getElementById('application'));