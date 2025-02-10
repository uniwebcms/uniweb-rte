import Website from './website.js';
import Profile from './profile.js';

export default class Uniweb {
    constructor(configData) {
        this.activeWebsite = new Website(configData.website);
        this.childBlockRenderer = null;
        this.routingComponents = {};
        this.remoteComponents = {};
        this.language = 'en';
        this.Profile = Profile;
    }

    init(modulePromise) {
        return modulePromise
            .then((module) => {
                // Handle double default wrapping issue when CommonJS is imported into ES6 module
                this.setRemoteComponents(module?.default?.default || module?.default);
                return true;
            })
            .catch((error) => console.error('Failed to load module:', error));
    }

    setRemoteComponents(components) {
        this.remoteComponents = components;
    }

    getRemoteComponent(name) {
        return this.remoteComponents[name];
    }
}
