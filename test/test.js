require('dotenv').config();
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var should = chai.should();


const simplesky = require('../simplesky.js');
var weather = new simplesky(process.env.MAPSKEY, process.env.DARKSKYKEY);

describe('getFull Tests', () => {
    it('return the correct latitude coordinate', () => {
        return weather.getFull("Austin's Pizza Campus").should.eventually.have.property('latitude', 30.2870213);
    });
    it('return the correct longitude coordinate', () => {
        return weather.getFull("Austin's Pizza Campus").should.eventually.have.property('longitude', -97.7418409);
    });
});