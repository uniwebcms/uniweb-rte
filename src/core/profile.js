export default class Profile {
    constructor(profileData) {
        this.basicInfo = profileData.basicInfo;
        this.contentType = profileData.contentType;
        this.contentId = profileData.contentId;
    }

    getImageInfo(assetType = 'banner') {
        const banner = this.basicInfo.banner;

        return {
            url: banner?.url,
            alt: `Profile ${assetType} for ${this.contentType} ${this.contentId}`
        };
    }

    getProfileType() {
        return this.profileType;
    }

    getBasicInfo() {
        return this.basicInfo;
    }

    at() {
        return {};
    }

    static getFilterableFields() {
        return [];
    }
}
