var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "react", "prop-types"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var react_1 = require("react");
    var PropTypes = require("prop-types");
    function getProp(props, mapping) {
        return props[mapping.reactProp];
    }
    function customElement(elementName, propsMapping) {
        var attributeMappings = [];
        var propertyMappings = [];
        var eventMappings = [];
        var propTypes = {};
        for (var reactProp in propsMapping) {
            var definition = propsMapping[reactProp];
            var mapping = __assign({}, definition, { reactProp: reactProp });
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
                    console.warn("Unknown type in propsMapping: " + JSON.stringify(mapping) + ".");
            }
        }
        var whenDefinedCallback = function () { };
        var nowOrWhenDefined = function (callback) {
            whenDefinedCallback = callback;
        };
        customElements.whenDefined(elementName).then(function () {
            whenDefinedCallback();
            nowOrWhenDefined = function (callback) {
                callback();
            };
        });
        var Component = function (props) {
            var elementRef = react_1.useRef();
            react_1.useLayoutEffect(function () {
                nowOrWhenDefined(function () {
                    var element = elementRef.current;
                    if (!element)
                        return;
                    for (var _i = 0, propertyMappings_1 = propertyMappings; _i < propertyMappings_1.length; _i++) {
                        var p = propertyMappings_1[_i];
                        element[p.name] = getProp(props, p);
                    }
                });
            }, propertyMappings.map(function (p) { return props[p.reactProp]; }));
            react_1.useLayoutEffect(function () {
                var element = elementRef.current;
                if (!element)
                    return;
                var specifiedEvents = eventMappings.filter(function (e) { return props[e.reactProp]; });
                for (var _i = 0, specifiedEvents_1 = specifiedEvents; _i < specifiedEvents_1.length; _i++) {
                    var e = specifiedEvents_1[_i];
                    element.addEventListener(e.name, getProp(props, e));
                }
                return function () {
                    for (var _i = 0, specifiedEvents_2 = specifiedEvents; _i < specifiedEvents_2.length; _i++) {
                        var e = specifiedEvents_2[_i];
                        element.removeEventListener(e.name, getProp(props, e));
                    }
                };
            }, eventMappings.map(function (e) { return props[e.reactProp]; }));
            var elementAttrs = attributeMappings.reduce(function (acc, a) {
                acc[a.name] = getProp(props, a);
                return acc;
            }, {});
            return react_1.createElement(elementName, __assign({}, elementAttrs, { ref: elementRef }), props.children);
        };
        Component.displayName = "CustomElement(" + elementName + ")";
        Component.propTypes = propTypes;
        return Component;
    }
    exports.default = customElement;
});
