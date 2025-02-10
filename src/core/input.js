import Profile from './profile.js';

export default class Input {
    constructor(inputData) {
        // this.query = query;
        // this.rawData = null;

        this.profiles = inputData.profiles.map((profile) => new Profile(profile));
    }

    makeHref(profile) {
        return '';
    }
}
