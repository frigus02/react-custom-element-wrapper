import React, {
    useLayoutEffect,
    useRef,
    WeakValidationMap,
    FunctionComponent,
} from "react";
import PropTypes from "prop-types";

interface AttributeDefinition {
    type: "attribute";
    name: string;
}

interface PropertyDefinition {
    type: "property";
    name: string;
}

interface EventDefinition {
    type: "event";
    name: string;
}

type Definition = AttributeDefinition | PropertyDefinition | EventDefinition;

type PropsMappings<T> = {
    [K in keyof T]: T[K] extends string
        ? AttributeDefinition | PropertyDefinition
        : T[K] extends EventListenerOrEventListenerObject
        ? EventDefinition | PropertyDefinition
        : PropertyDefinition
};

type AttributeMapping<T> = AttributeDefinition & {
    reactProp: keyof T;
};

type PropertyMapping<T> = PropertyDefinition & {
    reactProp: keyof T;
};

type EventMapping<T> = EventDefinition & {
    reactProp: keyof T;
};

type Mapping<T> = AttributeMapping<T> | PropertyMapping<T> | EventMapping<T>;

type CustomElementAttributes = {
    [key: string]: string;
};

type CustomElement = HTMLElement & {
    [key: string]: any;
};

function getProp<T, U extends Mapping<T>>(
    props: T,
    mapping: U
): U extends AttributeMapping<T>
    ? string
    : U extends EventMapping<T>
    ? EventListenerOrEventListenerObject
    : any {
    return props[mapping.reactProp] as any;
}

function customElement<T>(
    elementName: string,
    propsMapping: PropsMappings<T>
): FunctionComponent<T> {
    const attributeMappings: AttributeMapping<T>[] = [];
    const propertyMappings: PropertyMapping<T>[] = [];
    const eventMappings: EventMapping<T>[] = [];
    const propTypes: WeakValidationMap<T> = {};
    for (const reactProp in propsMapping) {
        const definition: Definition = propsMapping[reactProp];
        const mapping: Mapping<T> = { ...definition, reactProp };
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
                console.warn(
                    `Unknown type in propsMapping: ${JSON.stringify(mapping)}.`
                );
        }
    }

    let whenDefinedCallback = () => {};
    let nowOrWhenDefined = (callback: () => void) => {
        whenDefinedCallback = callback;
    };
    customElements.whenDefined(elementName).then(() => {
        whenDefinedCallback();
        nowOrWhenDefined = callback => {
            callback();
        };
    });

    const Component: FunctionComponent<T> = props => {
        const elementRef = useRef<CustomElement>();

        useLayoutEffect(() => {
            nowOrWhenDefined(() => {
                const element = elementRef.current;
                if (!element) return;

                for (const p of propertyMappings) {
                    element[p.name] = getProp(props, p);
                }
            });
        }, propertyMappings.map(p => props[p.reactProp]));

        useLayoutEffect(() => {
            const element = elementRef.current;
            if (!element) return;

            const specifiedEvents = eventMappings.filter(
                e => props[e.reactProp]
            );

            for (const e of specifiedEvents) {
                element.addEventListener(e.name, getProp(props, e));
            }

            return () => {
                for (const e of specifiedEvents) {
                    element.removeEventListener(e.name, getProp(props, e));
                }
            };
        }, eventMappings.map(e => props[e.reactProp]));

        const elementAttrs = attributeMappings.reduce(
            (acc, a) => {
                acc[a.name] = getProp(props, a);
                return acc;
            },
            <CustomElementAttributes>{}
        );

        return React.createElement(
            elementName,
            {
                ...elementAttrs,
                ref: elementRef,
            },
            props.children
        );
    };

    Component.displayName = `CustomElement(${elementName})`;
    Component.propTypes = propTypes;

    return Component;
}

export default customElement;
