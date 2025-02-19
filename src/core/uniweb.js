import Website from './website.js';
import Profile from './profile.js';
import { get } from 'citation-js';

export default class Uniweb {
    constructor(configData) {
        this.activeWebsite = new Website(configData);
        this.childBlockRenderer = null; // Function to render child blocks, used by remote components
        this.routingComponents = {}; // Components provided by Uniweb rte for remote components to use, e.g. Link, SafeHtml, useNavigate, useParams, useLocation
        this.remoteComponents = {}; // Federated components from remote module
        this.remoteConfig = {}; // Configuration data or functions provided by remote module
        this.language = 'en'; // Default language for the website
        this.Profile = Profile; // The Profile class to be used by the website
    }

    setRemoteComponents(components) {
        this.remoteComponents = components;
    }

    getRemoteComponent(name) {
        return this.remoteComponents[name];
    }

    setRemoteConfig(config) {
        this.remoteConfig = config;
    }
}
