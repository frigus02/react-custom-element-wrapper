# React Custom Element Wrapper

[![npm](https://img.shields.io/npm/v/react-custom-element-wrapper.svg)](https://www.npmjs.com/package/react-custom-element-wrapper)

Use Custom Elements with properties or events in React.

[Custom Elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) can define their API with attributes, properties, events and children (slots). React supports attributes and children out of the box. But there are some challenges with the rest:

-   Properties don't work because React calls `setAttribute` on custom elements.
-   Events don't work because React has [synthetic events](https://reactjs.org/docs/events.html), which don't support custom DOM events.

People are working on a solution (see [React RFC about custom element support](https://github.com/reactjs/rfcs/pull/15)). But we can already use a workaround using [refs](https://reactjs.org/docs/refs-and-the-dom.html) now. This library is a tiny wrapper you can put around any custom element to make it work in React.

Note: If the custom element you want to use only uses attributes and children, you don't have to use this wrapper. Just use the custom element directly.

## Table of Contents

-   [Install](#install)
-   [Usage](#usage)
-   [PropTypes](#proptypes)
-   [TypeScript](#typescript)
-   [Contributing](#contributing)
-   [License](#license)

## Install

```sh
# npm
npm install react-custom-element-wrapper

# yarn
yarn add react-custom-element-wrapper
```

## Usage

Create a wrapper around your custom element.

```js
import customElement from "react-custom-element-wrapper";

// Load Custom Element JavaScript
import "my-greeting";

// Define React props and how they match to the elements attributes, properties and events
const MyGreeting = customElement("my-greeting", {
    salutation: { type: "attribute", name: "salutation" },
    traits: { type: "property", name: "traits" },
    onWave: { type: "event", name: "wave" },
});

export default MyGreeting;
```

Then use the wrapper in the same way as any other React component.

```js
import MyGreeting from "./MyGreeting";

const App = () => (
    <div>
        <MyGreeting salutation="Hi" traits={["tall", "brown"]}>
            Bear
        </MyGreeting>
    </div>
);
```

## PropTypes

Components generated using this library automatically get these basic [prop-types](https://github.com/facebook/prop-types):

-   Attributes: `PropTypes.string`
-   Properties: `PropTypes.any`
-   Events: `PropTypes.function`

## TypeScript

You can type elements generated using this library by defining a type for the React props. When doing so, your types have to match a certain schema:

-   Attributes can only be mapped to a prop of type `string`.
-   Properties can be mapped to anything.
-   Events can only be mapped to a [`EventListenerOrEventListenerObject`](https://github.com/Microsoft/TypeScript/blob/8a19e4bcf95de764ca18bc0276697ab86bd783e4/lib/lib.dom.d.ts#L17493). You probably want to use something like `CustomElement => void`. And if the custom element provides a typed event object, you can use that instead.

```ts
import customElement from "react-custom-element-wrapper";
import "my-greeting";

// Define React props
type Props = {
    salutation: string,
    traits: string[],
    onWave: CustomEvent => void
};

const MyGreeting = customElement<Props>("my-greeting", {
    salutation: { type: "attribute", name: "salutation" },
    traits: { type: "property", name: "traits" },
    onWave: { type: "event", name: "wave" },
});

export default MyGreeting;
```

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
