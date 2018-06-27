const request  = require('request');
const timestamp = require('unix-timestamp');
timestamp.round = true;

var getQueryString = (lang, units, exclude = [], extend = false) => {
    return new Promise((resolve) => {
        let queryString = "?";
        if(lang){
            queryString+=`lang=${lang}&`;
        }
        if(units){
            queryString+=`units=${units}&`;
        }
        if(exclude.length >= 1){
            queryString+=`exclude=${exclude.join(',')}&`;
        }
        if(extend){
            queryString+='extend=hourly';
        }
        resolve(queryString); 
    });
}

class simplesky{

    /**
     * Default constructor for simplesky object
     * @param {string} mapsKey Google Maps API Key
     * @param {string} darkskyKey DarkSky API Key
     * @param {string} language Desired language for weather output
     * @param {string} units Desired units for weather output
     */
    constructor(mapsKey, darkskyKey, language = 'en', units = 'auto') {
        this.mapAPIKey = mapsKey;
        this.darkAPIKey = darkskyKey;
        this.lang = language
        this.units = units;
    }

    /**
     * Interface with the DarkSky API to get weather data for your location, you can tweak what data is sent
     * back to you through the provided arguments to help save on time and data
     * @param {string} location Natural language entry of location 
     * @param {number} lat Exact latitude coordinate, optional
     * @param {number} lng Exact longitude coordinate, optional
     * @param {Array} exclude Array containing string of blocks to exclude, optional
     * @param {boolean} extend Specify if you want weather for the next 168 hours, optional
     */
    async getWeather(location, lat, lng, exclude = [], extend = false){
        var defaultQuery = await getQueryString(this.lang, this.units, exclude, extend);
        return new Promise((resolve, reject) => {
            if(location){
                this.getCoordinates(location).then((locationData) =>{
                    let lat = locationData.lat;
                    let lng = locationData.lng;
                    request({
                        url:`https://api.darksky.net/forecast/${this.darkAPIKey}/${lat},${lng}${defaultQuery}`,
                        json:true,
                        gzip:true
                    }, (error, response, body) => {
                        if(error){
                            reject(new Error('Unable to connect to Dark Sky API'));
                        }else{
                            resolve(body);
                        }
                    });
                }).catch((error) => {
                    reject(error);
                })
            }else if(!location && (lat && lng)){
                request({
                    url:`https://api.darksky.net/forecast/${this.darkAPIKey}/${lat},${lng}${defaultQuery}`,
                    json:true,
                    gzip: true
                },(error, response,body) => {
                    if(error){
                        reject(new Error('Unable to connect to Dark Sky API'))
                    }else{
                        resolve(body);
                    }
                });
            }else{
                reject(new Error("Incomplete input paramaters"));
            }
        });
    }

    /**
     * Interface with Dark Sky's Time Machine capabilities to get weather data for
     * the past or future
     * @param {string} location Natural language entry of location 
     * @param {string} time Offset from current time of desired weather data, see documentation for input details
     * @param {number} lat Exact latitude coordinate, optional
     * @param {number} lng Exact longitude coordinate, optional
     * @param {Array} exclude Array containing string of blocks to exclude, optional
     */
    async getTimeMachine(location, time, lat, lng, exclude = []){
        let defaultQuery = await getQueryString(this.lang, this.units, exclude, false);
        let unixTime = await this.getTimestamp(time);
        return new Promise((resolve, reject) => {
            if(location && time){
                this.getCoordinates(location).then((locationData) => {
                    let lat = locationData.lat;
                    let lng = locationData.lng;
                    request({
                        url:`https://api.darksky.net/forecast/${this.darkAPIKey}/${lat},${lng},${unixTime}${defaultQuery}`,
                        json:true,
                        gzip:true
                    },(error, response, body) => {
                        if(error){
                            reject(new Error("Unable to connect to Dark Sky API"));
                        }else{
                            resolve(body);
                        }
                    });
                });
            }
            else if(!location && (lat && lng && time)){
                request({
                    url:`https://api.darksky.net/forecast/${this.darkAPIKey}/${lat},${lng},${unixTime}${defaultQuery}`,
                    json:true,
                    gzip:true
                },(error, response, body) => {
                    if(error){
                        reject(new Error("Unable to connect to Dark Sky API"));
                    }else{
                        resolve(body);
                    }
                });
            }
            else{
                reject(new Error("Incomplete input parameters"));
            }
        });
    }
    
    /**
     * Get complete weather data for your location
     * @param {string} location Natural language entry of location  
     * @param {number} lat Exact latitude coordinate, optional
     * @param {number} lng Exact longitude coordinate, optional
     */
    getFull(location, lat, lng){
        return this.getWeather(location, lat, lng);
    }

    /**
     * Retrieve only the current weather information
     * @param {string} location Natural language entry of location 
     * @param {number} lat Exact latitude coordinate, optional
     * @param {number} lng Exact longituted coordinate, optional
     */
    getCurrently(location, lat, lng){
        let excludeList = ['minutely','hourly','daily', 'alerts', 'flags'];
        return new Promise((resolve, reject) => {
            this.getWeather(location,lat,lng,excludeList).then((response) => {
                resolve(response.currently);
            }).catch((error) => {
                reject(error);
            });
        });
    }
    
    /**
     * Retrieve only the hourly weather information
     * @param {string} location Natural language entry of location 
     * @param {number} lat Exact latitude coordinate, optional
     * @param {number} lng Exact longitude coordinate, optional
     * @param {boolean} extend Provide data for the next 168 hours, optional
     */
    getHourly(location, lat, lng, extend = false){
        let excludeList = ['currently','minutely','daily', 'alerts', 'flags'];
        return new Promise((resolve, reject) => {
            this.getWeather(location,lat,lng,excludeList,extend).then((response) => {
                resolve(response.hourly);
            }).catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * Retrieve only the minutely weather information
     * @param {string} location Natural language entry of location 
     * @param {number} lat Exact latitude coordinate, optional
     * @param {number} lng Exact longitude coordinate, optional
     */
    getMinutely(location,lat,lng){
        let excludeList = ['currently','hourly','daily','alerts','flags'];
        return new Promise((resolve, reject) => {
            this.getWeather(location,lat,lng,excludeList).then((response) => {
                if(response.minutely){
                    resolve(response.minutely);
                }else{
                    reject(new Error("Minutely data is not supported for this location"));
                }
            }).catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * Retrieve only the daily weather information
     * @param {string} location Natural language entry of location 
     * @param {number} lat Exact latitude coordinate, optional
     * @param {number} lng Exact longitude coordinate, optional
     */
    getDaily(location, lat,lng){
        let excludeList = ['minutely', 'hourly', 'currently', 'alerts', 'flags'];
        return new Promise((resolve, reject) => {
            this.getWeather(location,lat,lng,excludeList).then((response) => {
                resolve(response.daily);
            }).catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * Return an object with the exact coordinates of your specified location
     * @param {string} location  
     */
    getCoordinates(location){
        return new Promise((resolve,reject) => {
            let formattedLocation = encodeURIComponent(location);
            request({
                url:`https://maps.googleapis.com/maps/api/geocode/json?address=${formattedLocation}&key=${this.mapAPIKey}`,
                json:true
            }, (error, response, body) => {
                if(error){
                    reject(new Error("Unable to connect to Google Services"));
                }else if(body.status === 'ZERO_RESULTS'){
                    reject(new Error("Unable to find specified location, try reformating input"));
                }else if(body.status === 'OK'){
                    let results = {
                        lat: body.results[0].geometry.location.lat,
                        lng: body.results[0].geometry.location.lng
                    }
                    resolve(results);
                }
            });
        });
    }
    /**
     * Return a unicode timestamp with the current time
     * @param {string} offset string containing offset, optional, see documentation for input details
     */
    getTimestamp(offset){
        if(offset){
            let offsetVars = offset.split(" ");
            return timestamp.now.apply(null, offsetVars);
        }else{
            return timestamp.now();
        }

    }
}

module.exports = simplesky;