# SimpleSky
SimpleSky is a promise based, intuitive, and data friendly API Wrapper for Dark Sky. With natural language recognition SimpleSky removes the need to painstakingly acquire manual coordinates to retrive weather information. 

## Usage 
Before getting started you'll need to acquire both a Google Maps API Key as well as a Dark SKy API Key.

Once acquired simple create a SimpleSky object and you'll be set up. 

```javascript
const simplesky = require('simplesky');
var weather = new simplesky('YOUR GOOGLE MAPS KEY', 'YOUR DARK SKY KEY');
```

Optionally if you would like to set your language and unit defaults (as specified in the Dark Sky API Documentation) for all responses you can do so here as well. By default SimpleSky will return all responses in english and weather units based on geographic location. 

```javascript
var weather = new simplesky('YOUR GOOGLE MAPS KEY', 'YOUR DARK SKY KEY', 'zh');

//Alternatively, you can force certain units for all responses

var weather = new simplesky('YOUR GOOGLE MAPS KEY', 'YOUR DARK SKY KEY', 'x-pig-latin','uk2');
```

## Examples

### Getting the local temperature

SimpleSky is a complete wrapper for the Dark Sky API, anything you can do with the API you can do here and more easily. SimpleSky is also completely promise based so your code stays clean and easy to read. 

All methods within SimpleSky allow for either natural language location input or precise latitude/longitude coordinate input to retrieve JSON formatted weather data. 

Here's a simple example in which we print out the current temperature for our local Pizza Hut in Mongolia

```javascript
weather.getCurrently('Pizza Hut Mongolia').then((response) => {
    console.log(response.temperature);
}).catch((error) => {
    console.log(error);
});
```

Alternatively, if you're already working with software in which you get a user's geolocation data, fear not, you can still take advantage of all of SimpleSky's features. 

```javascript 
weather.getCurrently(null, 37.0326, -95.6188).then((response) => {
    console.log(response.temperature);
}).catch((error) => {
    console.log(error);
});
```

### Customizing weather output

SimpleSky allows you to customize the weather output the Dark Sky API returns helping you to save additional cache space. To do so will require taking advantage of the `getWeather()` method.

SimpleSky uses the exact same naming scheme as used in the Dark Sky API documentation. So in order to remove certain blocks from the weather output, we simply pass them in with the same names. 

Once again, all methods within SimpleSky accept longitude and latitude output.

```javascript
//Remove the alerts and flags blocks from the weather output
weather.getWeather("Pirates Museum Madagascar", null, null, ['alerts', 'flags']).then((response) => {
    console.log(response);
}).catch((error) => {
    console.log(error);
});
```

If you would like to isolate only a single block, methods have already been written that exclude all irrelevant data.

For refererence these are 

```javascript
getCurrently();
getMinutely(); 
getHourly(); 
getDaily();

//NOTE: Not all locations output minutely and hourly data
```
### Time Machine Requests

To see weather data for a date far into the future or into the past simply use the `getTimeMachine()` method.

Specifying the time of your request couldn't be easier. Simply pass in your offset in the following format as a single string

```javascript
'[+/-] {years}Y {months}M {weeks}w {days}d {hours}h {minutes}m {seconds}s {milliseconds}ms'
```
To see the weather data for a certain location three years and two months from now simply do the following. 

```javascript

weather.getTimeMachine("Brooklyn Bridge", "+3y +2M").then((response) => {
    console.log(response);
}).catch((error) => {
    console.log(error);
});
```

### Extending hourly data

If you'd like to get the weather data for the next 168 hours as opposed to the next 48, simply do the following.

```javascript
weather.getHourly("UT Austin", null, null, true).then((response) => {
    console.log(response);
}).catch(error) =>{
    console.log(error);
});
```