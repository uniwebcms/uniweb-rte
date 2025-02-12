// LazyCiteRender.jsx
import React, { useEffect, useState } from 'react';
import parse from 'html-react-parser';

export default function LazyCiteRender({ data, style = 'apa', locale = 'en-US' }) {
    const [Cite, setCite] = useState(null);

    useEffect(() => {
        import(/* webpackChunkName: "citation-styles" */ 'citation-js')
            .then((mod) => setCite(mod.default || mod))
            .catch((error) =>
                console.error('Failed to load citation-js in LazyCiteRender:', error)
            );
    }, []);

    if (!Cite) return null; // Or you could return a minimal fallback

    // Now that citation-js is loaded, use it to format the bibliography.
    const cite = new Cite(data);
    const output = cite.format('bibliography', {
        format: 'html',
        template: style,
        lang: locale,
        nosort: true
    });

    return parse(output);
}
