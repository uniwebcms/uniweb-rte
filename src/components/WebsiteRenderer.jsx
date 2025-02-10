import React from 'react';
import PageRenderer from './PageRenderer.jsx';
import { buildThemeStyles } from '../utils/helper.js';
import { Style } from 'react-style-tag';
import Fonts from './Fonts.jsx';

export default function WebsiteRenderer(props) {
    const website = uniweb.activeWebsite;

    return (
        <>
            <Fonts fontsData={website.themeData.importedFonts}></Fonts>
            <Style hasSourceMap={false} name="color-themes">
                {buildThemeStyles(website.themeData)}
            </Style>
            <PageRenderer />
        </>
    );
}
