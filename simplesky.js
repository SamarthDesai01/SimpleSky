const request  = require('request');

var getQueryString = (lang, units, exclude, extend) => {
    return new Promise((resolve) => {
        let queryString = "?";
        if(lang){
            queryString+=`lang=${lang}&`;
        }
        if(units){
            queryString+=`units=${units}`;
        }
        resolve(queryString);
    })
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
     * Interface with the DarkSky API to get full weather data for your location
     * @param {string} location Natural language entry of location 
     * @param {number} lat Exact lattitude coordinate, optional
     * @param {number} lng Exact longitude coordinate, optional
     */
    async getFull(location, lat, lng, options){
        var defaultQuery = await getQueryString(this.lang, this.units);
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
            }else if(!location){
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
     * Retrieve only the current weather information
     * @param {string} location Natural language entry of location 
     * @param {number} lat Exact lattitude coordinate
     * @param {number} lng Exact longituted coordinate
     */
    async getCurrently(location, lat, lng){
        let queryString = await getQueryString(this.lang, this.units) + '&exclude=minutely,hourly,daily,alerts,flags';
        return new Promise((resolve, reject) =>{
            if(location){
                this.getCoordinates(location).then((locationData)=>{
                    let lat = locationData.lat;
                    let lng = locationData.lng;
                    request({
                        url:`https://api.darksky.net/forecast/${this.darkAPIKey}/${lat},${lng}${queryString}`,
                        json:true,
                        gzip:true
                    },(error, response, body) =>{
                        if(error){
                            reject(new Error("Unable to contact Dark Sky API"));
                        }else{
                            resolve(body);
                        }
                    });
                });
            }else if(lat && lng){
                request({
                    url:`https://api.darksky.net/forecast/${this.darkAPIKey}/${lat},${lng}${queryString}`,
                    json:true,
                    gzip:true
                },(error, response, body) =>{
                    if(error){
                        reject(new Error("Unable to contact Dark Sky API"));
                    }else{
                        resolve(body);
                    }
                });
            }else{
                reject(new Error("Incomplete Input parameters"));
            }
        });
    }

    /**
     * Return an object with the exact coordinates of your specified location
     * @param {*string} location  
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
}

module.exports = simplesky;