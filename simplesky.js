const request  = require('request');
class simplesky{

    /**
     * Default constructor for simplesky object
     * @param {string} mapsKey Google Maps API Key
     * @param {string} darkskyKey DarkSky API Key
     */
    constructor(mapsKey, darkskyKey) {
        this.mapAPIKey = mapsKey;
        this.darkAPIKey = darkskyKey;
    }
    
    /**
     * Interface with the DarkSky API to get full weather data for your location
     * @param {string} location Natural language entry of location 
     * @param {number} lat Exact lattitude coordinate, optional
     * @param {number} lng Exact longitude coordinate, optional
     */
    getFull(location, lat, lng, options){
        return new Promise((resolve, reject) => {
            if(location){
                this.getCoordinates(location).then((locationData) =>{
                    let lat = locationData.lat;
                    let lng = locationData.lng;
                    request({
                        url:`https://api.darksky.net/forecast/${this.darkAPIKey}/${lat},${lng}`,
                        json:true
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
                    url:`https://api.darksky.net/forecast/${this.darkAPIKey}/${lat},${lng}`,
                    json:true
                },(error, response,body) => {
                    if(error){
                        reject(new Error('Unable to connect to Dark Sky API'))
                    }else{
                        resolve(body);
                    }
                })
            }else{
                reject(new Error("Incomplete input paramaters"));
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