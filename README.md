![alt emstore](.assets/em.png)

**Develop your app scalable and quickly without no fuss**

<p>The EM store is a minimalistic simple library for managing the state inside React app. It is easy to track which function changed the state inside your app and there are no boilerplate or weird limits. It works surprisingly well for bigger apps and smaller apps.</p>

<p>&nbsp;</p>

## Install

This library is dependent on immer, install it like this.

```
npm i emstore immer
```

<p>&nbsp;</p>

## Show me minimalistic approach

<p>&nbsp;</p>

**Create states**

First define just one state in the beginning, let's call this new state `value` and let initial value be 0.

```typescript
export const states = new Map<string, any>(["value", 0]);
```

> **_NOTE:_** Keep in mind that the state can be a nested object, you can use maps sets plain objects, etc. Thanks to immer you'll don't have to worry about immutability. Change your state in a mutable way and immer will take care of it. A good practice is to group your new states in variable states for easy access. Don't worry about performance, access time to this states is O(1).

<p>&nbsp;</p>

**Wrap your application in provider to share state across components**

```jsx
import { Provider } from "emstore";
...

...
<Provider states={states}><App/></Provider>
...

```

> **_NOTE:_** Provider has this props that are explained later in this document (enableMapSet, states, consolelog, onChange, serializeStates, deserializeStates).

<p>&nbsp;</p>

**Wrap your app with states, usually, you wrap some components (organisms)**

Select which states you want to share with the component.

```typescript
import { withState } from "emstore";

type AppProps = {
  states: [number];
}

const App = withState<AppProps>(({ states: [value]}) => {
  ...
  return (
    <span>{value}</span>
  );
  ...
});
```

> **_NOTE:_** Usually what I love to do first is to group components in atoms, molecules, organisms, and pages. And I like to wrap only organisms with states. It scales better.

<p>&nbsp;</p>

**Create a event function**

This is not a real event but this is for you just to imagine and break the app into smaller pieces. It will get easier to track and log changes after.

```typescript
import { state } from "emstore";

export function add() {
  const [state, setState] = state("value");

  // If you are familiar with immer
  // we are using it for changing states.
  // Change state with immer, basics: https://immerjs.github.io/immer/produce/
  setState((draft: number) => (draft + 1));
};
```

> **_NOTE:_** What I like to do is to remove all business logic from components in these smaller event functions. This way you are getting more organized and scalable. Once the app starts growing you'll be happier.

<p>&nbsp;</p>

**Fire your event function from the button**

Link your function to your button that will increase `value` number.

```jsx
...
<button onClick={addOne}> + 1 </button>
...
```

<p>&nbsp;</p>

**How to track which function changed your state? Before answering that question let's add an event function for decreasing same number**

Function to decrease `value` number.

```typescript
export function decrease() {
  const [state, setState] = state("value");

  // If you are familiar with immer
  // we are using it for changing states.
  // Change state with immer, basics: https://immerjs.github.io/immer/produce/
  setState((draft: number) => (draft - 1));
};
```

<p>&nbsp;</p>

**Fire your event function from the button to decrease value**

Link your function to your button that will decrease `value` number.

```jsx
...
<button onClick={decrease}> - 1 </button>
...
```

<p>&nbsp;</p>

**Lets organize and group this functions in file called "value-change.ts" and mark this state changes with event name `valueChange`**

```typescript
import { state as emState } from "emstore";

const state = (key: string) => emState(key, "valueChange");

export function add() {
  const [state, setState] = state("value");

  // If you are familiar with immer
  // we are using it for changing states.
  // Change state with immer, basics: https://immerjs.github.io/immer/produce/
  setState((draft: number) => (draft + 1));
};

export function decrease() {
  const [state, setState] = state("value");

  // If you are familiar with immer
  // we are using it for changing states.
  // Change state with immer, basics: https://immerjs.github.io/immer/produce/
  setState((draft: number) => (draft - 1));
};
```

> **_NOTE:_** Now all value state changes are grouped under key "valueChange"

<p>&nbsp;</p>

**Now let's log who changed our "value" state and add "consolelog" prop to emstore provider**

Add prop `consolelog` to `Provider`.

```jsx
...
<Provider
  consolelog
  states={states}
>
  <App/>
</Provider>
...

```

<p>&nbsp;</p>

**When you fire an event you can see the name of the event, the state name that you used in a function, and the previous value with a new value logged in the console. If you want your app to be persistent and recover its state on browser refresh we got you covered here too**

Add prop `persistent` to Provider.

```jsx
...
<Provider
  persistent
  consolelog
  states={states}
>
    <App/>
</Provider>
...

```

<p>&nbsp;</p>

**Now, if you use a persistent prop and if you have maps and sets this will not work, to fix this first we have to enable maps and sets in the provider and tell immer that we will use it**

Add prop `enableMapSet`.

```jsx
...
<Provider
  enableMapSet
  persistent
  consolelog
  states={states}
>
    <App/>
</Provider>
...
```

<p>&nbsp;</p>

**But still, it will not work because we are using a persistent prop with hash maps and sets. Javascript doesn't know how to stringify (while this could be automized it is better for a user to handle serialize and deserialize themselves)**

Add provider callback props `serializeStates` and `deserializeStates`.

```jsx
...
<Provider
  enableMapSet
  persistent
  consolelog
  states={states}
  serializeStates={serializeStates}
  deserializeStates={deserializeStates}
>
    <App/>
</Provider>
...
```

> **_NOTE:_** If you don't use persistent with maps and states you don't have to do state parsing yourself.

Add deserialize and serialize functions.

```typescript
const setObjects = [
  "state1",
  "state2",
  "state3",
  "state4",
];

const mapObjects = [
  "state5",
  "state6",
  "state7",
  "state8",
];

export function deserializeStates(emstateString: string) {
  const statesArr = JSON.parse(emstateString);
  const newArr = statesArr.map(([key, val]: any) => {
    if (setObjects.some((setKey) => setKey === key)) {
      return [key, new Set(val)];
    }

    if (mapObjects.some((mapKey) => mapKey === key)) {
      const nestedMaps = val.map((state2: any) => {
        const [key, val] = state2;
        return [key, val];
      });
      return [key, new Map(nestedMaps)];
    }

    return [key, val];
  });
  return newArr;
}

export function serializeStates(states: Map<string, any>) {
  const statesArr = Array.from(states.entries());
  const newArr = statesArr.map((state: any) => {
    const [key, val] = state;

    if (setObjects.some((setKey) => setKey === key)) {
      return [key, Array.from(val)];
    }

    if (mapObjects.some((mapKey) => mapKey === key)) {
      const nestedMaps = Array.from(val)?.map((state2: any) => {
        const [key2, val2] = state2;
        return [key2, val2];
      });
      return [key, Array.from(nestedMaps)];
    }

    return [key, val];
  });

  return newArr;
}
```


Congratulations, you survived all the way until the end,
you are really something special! 😊

Have a nice day and keep smiling!