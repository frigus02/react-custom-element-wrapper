import { FunctionComponent } from "react";
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
declare type PropsMappings<T> = {
    [K in keyof T]: T[K] extends string ? AttributeDefinition | PropertyDefinition : T[K] extends EventListenerOrEventListenerObject ? EventDefinition | PropertyDefinition : PropertyDefinition;
};
declare function customElement<T>(elementName: string, propsMapping: PropsMappings<T>): FunctionComponent<T>;
export default customElement;
