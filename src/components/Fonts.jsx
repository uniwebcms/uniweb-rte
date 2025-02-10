import React, { useEffect } from 'react';
import { Style } from 'react-style-tag';

const GoogleFontLoader = ({ src }) => {
    useEffect(() => {
        const link = document.createElement('link');

        link.rel = 'stylesheet';
        link.href = src;
        link.setAttribute('name', 'google-fonts');

        document.head.appendChild(link);

        return () => document.head.removeChild(link);
    }, [src]);

    return null;
};

const buildFontStyles = (fontsData) => {
    let fontStyles = {
        google: '',
        custom: '',
    };

    const buildFontFace = (font, fontName) => {
        const { font_weight, font_style, font_file } = font;

        const [identifier, filename] = font_file.split('/');

        const ext = filename.split('.').pop().toLowerCase();

        // let url = `${uniweb.process.env.profileAssetsURL.trim()}webfont/profile/${fontId}/${identifier}_v${version}.${ext}`;
        let url = `https://assets.uniweb.app/dist/${identifier}/base.${ext}`;
        let src = 'src:';

        switch (ext) {
            case 'woff':
                src += `url('${url}') format('woff');`;
                break;
            case 'woff2':
                src += `url('${url}') format('woff2');`;
                break;
            case 'ttf':
                src += `url('${url}') format('truetype');`;
                break;
            case 'otf':
                src += `url('${url}') format('opentype');`;
                break;
            default:
        }

        return `@font-face {
            font-family: ${fontName};
            ${src}
            font-weight: ${parseInt(font_weight)};
            font-style: ${font_style};
            font-display: fallback;
        }
        `;
    };

    if (Array.isArray(fontsData) && fontsData.length) {
        const googleFonts = [];

        let result = '';

        fontsData.forEach((item) => {
            let { category, name } = item;
            name = name.split(',')[0];

            if (category === 'google') {
                let normal = [];
                let italic = [];
                let { variants = [] } = item;

                variants.forEach((variant) => {
                    if (variant.endsWith('i')) {
                        italic.push(variant.replace('i', ''));
                    } else {
                        normal.push(variant);
                    }
                });

                let family = `family=${encodeURIComponent(name)}`;

                if (normal.length > 0 && italic.length > 0) {
                    family += `:ital,wght@0,${normal.join(';0,')};1,${italic.join(';1,')}`;
                } else if (normal.length > 0) {
                    // Only normal variants
                    family += `:wght@${normal.join(';')}`;
                } else if (italic.length > 0) {
                    // Only italic variants
                    family += `:ital,wght@1,${italic.join(';1,')}`;
                }

                googleFonts.push(family);
            } else if (category === 'custom') {
                const { files } = item;

                if (files.length) {
                    result += files.map((font) => buildFontFace(font, name)).join('\n');
                }
            }
        });

        fontStyles.google = `https://fonts.googleapis.com/css2?${googleFonts.join(
            '&'
        )}&display=swap`;

        fontStyles.custom = result;
    }

    return fontStyles;
};

const Fonts = (props) => {
    const { fontsData } = props;

    if (!fontsData?.length) return null;

    const { google, custom } = buildFontStyles(fontsData);

    let body = [];

    if (google) {
        body = [<GoogleFontLoader key="google_fonts" src={google}></GoogleFontLoader>];
    }

    if (custom) {
        body = [
            ...body,
            <Style key="fonts" hasSourceMap={false} name="fonts">{`${custom}`}</Style>,
        ];
    }

    return body;
};

export default Fonts;
export { buildFontStyles };
