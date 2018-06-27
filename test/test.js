require('dotenv').config();
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var should = chai.should();
var expect = chai.expect;

const simplesky = require('../simplesky.js');
var weather = new simplesky(process.env.MAPSKEY, process.env.DARKSKYKEY);

describe('getFull Tests', () => {
    it('return the correct latitude coordinate', () => {
        return weather.getFull("Austin's Pizza Campus").should.eventually.have.property('latitude', 30.2870213);
    });
    it('return the correct longitude coordinate', () => {
        return weather.getFull("Austin's Pizza Campus").should.eventually.have.property('longitude', -97.7418409);
    });
    it('get weather from coordinate input', () => {
        return weather.getFull(null, 30.2870213, -97.7418409).should.eventually.include({'latitude': 30.2870213,'longitude': -97.7418409})
        .and.have.keys('currently', 'daily', 'minutely','hourly','flags','latitude', 'longitude', 'offset', 'timezone');
    });
    it('correctly throw an error for incorrect input', () => {
        return expect(weather.getFull(null, 23, null)).to.eventually.be.rejected
        .and.be.an.instanceof(Error);
    });
}); 

describe('getCurrently Tests', () => {
    it('return only the current weather', ()=> {
        return weather.getCurrently("Austin's Pizza Campus").should.eventually.have.property('temperature')
        .and.not.have.keys('daily','minutely','hourly','flags');
    });

    it('return only the current weather from coordinate data', () => {
        return weather.getCurrently(null, 30.2870213, -97.7418409).should.eventually.have.property('temperature')
        .and.not.have.keys('daily','minutely','hourly','flags');
    });

    it('throw an error from incorrect input', () => {
        return expect(weather.getCurrently(null, 1233, null)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error);
    });
});


describe('getHourly Tests', () =>{
    it('return only the hourly weather', () => {
        return weather.getHourly("Lego Store").should.eventually.have.property('data').of.length(49)
        .and.not.have.keys('daily','minutely','flags','currently');
    });

    it('return only the hourly weather from coordinate data', () => {
        return weather.getHourly(null, 35, 35).should.eventually.have.property('data').of.length(49)
        .and.not.have.keys('daily','minutely','flags','currently');
    });

    it('correctly extends output', () =>{ 
        return weather.getHourly("Taco Bell Las Vegas", null, null, true).should.eventually.have.property('data').of.length(169)
        .and.not.have.keys('daily','minutely','flags','currently');
    });

    it('throw an error from incorrect input',() => {
        return expect(weather.getHourly(null, 21, null)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error);
    });
});

describe('getMinutely Tests', () =>{
    it('return only the minutely weather', () => {
        return weather.getMinutely("UT Austin").should.eventually.have.property('data').of.length(61)
        .and.not.have.keys('daily','hourly','currently','flags');
    });
    it('return only the minutely weather from coordinate data', () => {
        //MINUTELY DATA IS NOT SUPPORTED FOR ALL LOCATIONS
        return weather.getMinutely(null, 30.2870213, -97.7418409).should.eventually.have.property('data').of.length(61)
        .and.not.have.keys('daily','hourly','currently','flags');
    });

    it('throw an error for unsupported locations', () => {
        return expect(weather.getMinutely(null, 30, 30)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error);
    })
    
    it('throw an error from incorrect input', () => {
        return expect(weather.getMinutely(null, null, null)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error);
    });
});

describe('getDaily Tests', () =>{
    it('return only the daily data',  () => {
        return weather.getDaily('San Francisco').should.eventually.have.property('data').of.length(8)
        .and.not.have.keys('minutely', 'currently','hourly','flags');
    });

    it('return only the daily data from coordinate data', () => {
        return weather.getDaily(null, 23, -23).should.eventually.have.property('data').of.length(8)
        .and.not.have.keys('minutely','currently','hourly', 'flags');
    });

    it('throw an error from incorrect input', () => {
        return expect(weather.getDaily(null, null, null)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error);
    });
});