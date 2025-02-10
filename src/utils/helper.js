export const buildThemeStyles = (themeData) => {
    const fonts = themeData?.fonts || themeData?.fonts?.[0] || {};

    const headerFont = fonts?.heading || fonts?.header_font || '';
    const bodyFont = fonts?.body || fonts?.body_font || '';
    let fontStr = '';

    if (bodyFont) fontStr += `\n * {font-family:${bodyFont}}`;
    if (headerFont) fontStr += `\n h1,h2,h3,h4,h5,h6 {font-family:${headerFont}}`;

    const isDarkSite = false;

    let vars = themeData?.vars;

    const elements = themeData?.['elements'] || {};

    const parsedElements = elements
        ? typeof elements === 'string'
            ? JSON.parse(elements)
            : elements
        : {};

    let colorNames = ['primary', 'secondary', 'accent', 'neutral'];
    let shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

    let contexts = ['light', 'medium', 'dark'];
    let elementVars = [
        'bg-color',
        'text-color',
        'heading-color',
        'link-color',
        'link-active-color',
        'link-hover-color',
        'icon-color',
        'btn-color',
        'btn-text-color',
        'btn-hover-color',
        'btn-hover-text-color',
        'btn-alt-color',
        'btn-alt-text-color',
        'btn-alt-hover-color',
        'btn-alt-hover-text-color',
        'callout',
        'muted',
        'highlight',
    ];

    let varDeclarations = contexts
        .map((context) => {
            let tgtKey = isDarkSite
                ? context === 'light'
                    ? 'dark'
                    : context === 'dark'
                    ? 'light'
                    : 'medium'
                : context;

            let colorVarsData = vars?.[tgtKey] || {};
            let defaultColorVarsData = vars?.['light'] || {};

            let colorVarList = [];

            colorNames.forEach((colorName) => {
                shades.forEach((shade) => {
                    let colorKey = `--${colorName}-${shade}`;
                    let color = colorVarsData[colorKey] || defaultColorVarsData[colorKey] || '';
                    colorVarList.push(`${colorKey}: ${color};`);
                });
            });

            let contextData = parsedElements[tgtKey] || {};

            let defaultContextData = parsedElements['light'] || {};

            let elementVarsList = [];

            elementVars.forEach((elementVar) => {
                let value = contextData[elementVar] || defaultContextData[elementVar] || '';

                if (value) {
                    elementVarsList.push(`--${elementVar}: ${value};`);
                }
            });

            return `
            .context__${context} {
                ${colorVarList.join('\n')}\n\n
                ${elementVarsList.join('\n')}
            }
        `;
        })
        .join('\n');

    const buildNestedCssSelector = (tag, psudo) => {
        const prefix = '[class*="context__"]';

        let selector = tag ? `${prefix} ${tag}` : prefix;

        if (psudo) {
            selector = `${selector}:${psudo}`;
        }

        let element = '';

        // this code is for solving the issue of incorrect priority of the tailwindcss style, uniweb website style and inline class.
        // we add element selector to the tag, so the uniweb website style will have higher priority than the tailwindcss style.
        // and because we clean the condition in the tag, the inline class will have higher priority than the uniweb website style.
        if (tag) {
            element = tag.split('.')[0];
            element = element.split(':')[0];
        }

        return `${element}:where(${selector})`;
    };

    const buildColorRules = (vars) => {
        const result = [];

        vars.forEach((key) => {
            let val = `var(--${key})`;
            switch (key) {
                case 'bg-color':
                    result.push(`${buildNestedCssSelector()} {background: ${val};}`);
                    break;
                case 'heading-color':
                    val = `var(--${key}, --text-color)`; // default to text color
                    result.push(
                        `${buildNestedCssSelector(
                            ':where(h1, h2, h3, h4, h5, h6)'
                        )} {color: ${val};}`
                    );
                    break;
                case 'text-color':
                    result.push(`${buildNestedCssSelector()} {color: ${val};}`);
                    break;
                case 'link-color':
                    val = `var(--${key}, --text-color)`; // default to text color
                    result.push(`${buildNestedCssSelector('a', '')} {color: ${val};}`);
                    break;
                case 'link-active-color':
                    val = `var(--${key}, --text-color)`; // default to text color
                    result.push(`${buildNestedCssSelector('a.active')} {color: ${val};}`);
                    break;
                case 'link-hover-color':
                    val = `var(--${key}, --text-color)`; // default to text color
                    result.push(`${buildNestedCssSelector('a', 'hover')} {color: ${val};}`);
                    break;
                case 'icon-color':
                    val = `var(--${key}, --text-color)`; // default to text color
                    result.push(`${buildNestedCssSelector('svg')} {color: ${val};}`);
                    break;
                case 'btn-color':
                    result.push(
                        `${buildNestedCssSelector(
                            'button:not(.btn-secondary)'
                        )} {background: ${val};}`
                    );
                    break;
                case 'btn-text-color':
                    val = `var(--${key}, --text-color)`; // default to text color
                    result.push(
                        `${buildNestedCssSelector('button:not(.btn-secondary)')} {color: ${val};}`
                    );
                    break;
                case 'btn-hover-color':
                    result.push(
                        `${buildNestedCssSelector(
                            'button:not(.btn-secondary)',
                            'hover'
                        )} {background: ${val};}`
                    );
                    break;
                case 'btn-hover-text-color':
                    val = `var(--${key}, --text-color)`; // default to text color
                    result.push(
                        `${buildNestedCssSelector(
                            'button:not(.btn-secondary)',
                            'hover'
                        )} {color: ${val};}`
                    );
                    break;
                case 'btn-alt-color':
                    result.push(
                        `${buildNestedCssSelector('button.btn-secondary')} {background: ${val};}`
                    );
                    break;
                case 'btn-alt-text-color':
                    val = `var(--${key}, --text-color)`; // default to text color
                    result.push(
                        `${buildNestedCssSelector('button.btn-secondary')} {color: ${val};}`
                    );
                    break;
                case 'btn-alt-hover-color':
                    result.push(
                        `${buildNestedCssSelector(
                            'button.btn-secondary',
                            'hover'
                        )} {background: ${val};}`
                    );
                    break;
                case 'btn-alt-hover-text-color':
                    val = `var(--${key}, --text-color)`; // default to text color
                    result.push(
                        `${buildNestedCssSelector(
                            'button.btn-secondary',
                            'hover'
                        )} {color: ${val};}`
                    );
                    break;
            }
        });

        return result;
    };

    let elementsRules = buildColorRules(elementVars);

    let elementStyles = elementsRules.join('\n');

    const lightMixes =
        '.context__light {--light-mix: white;} .context__medium {--light-mix: rgb(117,116,116);} .context__dark {--light-mix: black;}';

    return `${varDeclarations}\n\n ${lightMixes}\n\n ${elementStyles}\n\n ${fontStr}\n\n`;
};

export function useSWR() {
    console.log('hook useSWR is not support');
    return () => {};
}
