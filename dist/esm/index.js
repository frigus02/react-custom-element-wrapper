import { createElement, useLayoutEffect, useRef, } from "react";
import * as PropTypes from "prop-types";
function getProp(props, mapping) {
    return props[mapping.reactProp];
}
function customElement(elementName, propsMapping) {
    const attributeMappings = [];
    const propertyMappings = [];
    const eventMappings = [];
    const propTypes = {};
    for (const reactProp in propsMapping) {
        const definition = propsMapping[reactProp];
        const mapping = Object.assign({}, definition, { reactProp });
        switch (mapping.type) {
            case "attribute":
                attributeMappings.push(mapping);
                // @ts-ignore
                propTypes[reactProp] = PropTypes.string;
                break;
            case "property":
                propertyMappings.push(mapping);
                // @ts-ignore
                propTypes[reactProp] = PropTypes.any;
                break;
            case "event":
                eventMappings.push(mapping);
                // @ts-ignore
                propTypes[reactProp] = PropTypes.func;
                break;
            default:
                console.warn(`Unknown type in propsMapping: ${JSON.stringify(mapping)}.`);
        }
    }
    let whenDefinedCallback = () => { };
    let nowOrWhenDefined = (callback) => {
        whenDefinedCallback = callback;
    };
    customElements.whenDefined(elementName).then(() => {
        whenDefinedCallback();
        nowOrWhenDefined = callback => {
            callback();
        };
    });
    const Component = props => {
        const elementRef = useRef();
        useLayoutEffect(() => {
            nowOrWhenDefined(() => {
                const element = elementRef.current;
                if (!element)
                    return;
                for (const p of propertyMappings) {
                    element[p.name] = getProp(props, p);
                }
            });
        }, propertyMappings.map(p => props[p.reactProp]));
        useLayoutEffect(() => {
            const element = elementRef.current;
            if (!element)
                return;
            const specifiedEvents = eventMappings.filter(e => props[e.reactProp]);
            for (const e of specifiedEvents) {
                element.addEventListener(e.name, getProp(props, e));
            }
            return () => {
                for (const e of specifiedEvents) {
                    element.removeEventListener(e.name, getProp(props, e));
                }
            };
        }, eventMappings.map(e => props[e.reactProp]));
        const elementAttrs = attributeMappings.reduce((acc, a) => {
            acc[a.name] = getProp(props, a);
            return acc;
        }, {});
        return createElement(elementName, Object.assign({}, elementAttrs, { ref: elementRef }), props.children);
    };
    Component.displayName = `CustomElement(${elementName})`;
    Component.propTypes = propTypes;
    return Component;
}
export default customElement;
