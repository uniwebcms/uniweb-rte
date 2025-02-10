import React, { lazy, Suspense, useEffect, isValidElement } from 'react';

const hexToRgba = (hex, opacity) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${opacity})`;
};

const getWrapperProps = (block) => {
    const theme = block.themeName;

    const blockClassName = block.state?.className || '';

    let className = theme ? theme : '';

    if (blockClassName) className = `${className ? `${className} ` : ''}${blockClassName}`;

    const { background = {}, colors = {} } = block.standardOptions;

    let style = {};

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
        'highlight'
    ];

    let { vars = {}, elements = {} } = colors;

    contexts.forEach((context) => {
        let colorVarsData = vars?.[context] || {};
        let defaultColorVarsData = vars?.['light'] || {};

        colorNames.forEach((colorName) => {
            shades.forEach((shade) => {
                let colorKey = `--${colorName}-${shade}`;
                let color = colorVarsData[colorKey] || defaultColorVarsData[colorKey] || '';

                if (color) {
                    style[colorKey] = color;
                }
            });
        });

        let contextData = elements[context] || {};
        let defaultContextData = elements['light'] || {};

        elementVars.forEach((elementVar) => {
            let value = contextData[elementVar] || defaultContextData[elementVar] || '';

            if (value) {
                // elementVarsList.push(`--${elementVar}: ${value};`);
                style[`--${elementVar}`] = value;
            }
        });
    });

    if (background) {
        let { mode } = background;

        if (mode === 'gradient') {
            const gradientSettings = background?.gradient || {};

            let { enabled = false, start, end, angle = 0, startPosition = 0, endPosition = 100, startOpacity = 0.7, endOpacity = 0.3 } = gradientSettings;

            if (uniweb.toBoolean(enabled)) {
                start = start || 'transparent';
                end = end || 'transparent';

                style['--bg-color'] = `linear-gradient(${angle}deg, 
              ${hexToRgba(start, startOpacity)} ${startPosition}%, 
              ${hexToRgba(end, endOpacity)} ${endPosition}%)`;
            }
        } else if (mode === 'image' || mode === 'video') {
            const settings = background?.[mode] || {};
            const { url = '', file = '' } = settings;

            style = {
                ...style,
                position: 'relative',
                maxWidth: '100%'
            };

            if (url || file) style['--bg-color'] = 'transparent';
        }
    }

    let outputProps = { id: `Section${block.id}`, style, className };

    return outputProps;
};

export default function BlockRenderer(props) {
    const { block, pure = false, extra = {} } = props;

    const Component = block.getComponent();

    if (!Component) {
        console.warn('failed to load component', block.component);
        return null;
    }

    const componentProps = {
        block,
        page: uniweb.activeWebsite.activePage,
        website: uniweb.activeWebsite,
        input: block.input
    };

    if (pure) {
        return <Component {...componentProps} extra={extra} />;
    }

    const wrapperProps = getWrapperProps(block);

    return (
        <div {...wrapperProps}>
            <Component {...componentProps} />
        </div>
    );
}
