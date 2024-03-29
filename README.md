![alt emstore](.assets/em.png)

The `emstore` is a minimalistic and performant library for managing the state inside React app. It is easy to track which function changed the state inside your app.

<p>&nbsp;</p>

## Install

Install `emstore` library with `immer`.

```
npm i emstore immer
```

<p>&nbsp;</p>

## Intro

We will build an app [counter](./examples/basic/) that increases and decrease value and on every action, it logs the event into the console, and when you refresh it loads the state from local storage.

![alt emstore](.assets/events.gif)

First define just one state in the beginning, let's call this new state `value` and let initial value be 0. Each property in the object is state.

```typescript
const { Provider, useState, eventState } = createStore({ value: 0 });
```

Wrap your application in `Provider` to share states across components.

```jsx
<Provider>
  <App/>
</Provider>
```

Use hook `useState` to notify the component on state change.

```typescript
function App() {
  const [value] = useState("value");

  return (
    <span>{value}</span>
  );
}
```

Create event called `increase`.

```typescript
const state = eventState("increase");

function increase() {
  const [, setValue] = state("value");

  setValue((value) => value + 1);
};
```

Add a button to fire the `increase` event.

```jsx
<button onClick={increase}>+</button>
```

Create event called `decrease`.

```typescript
const state = eventState("decrease");

function decrease() {
  const [, setValue] = state("value");

  setValue((value) => value - 1);
};
```

Add a button to fire the `decrease` event.

```jsx
<button onClick={decrease}>-</button>
```

Turn log for events with `consoleLog`.

```jsx
const { Provider, useState, eventState } = createStore({ value: 0 }, {
  consoleLog: true,
});
```

When you fire an event you can see the `time`, the `event's name`, the `state name` that you used in a function, and the previous `value` with a `new value` logged in the console.

To make a persistent app on browser refresh use the `persist`.

```jsx
const { Provider, useState, eventState } = createStore({ value: 0 }, {
  consoleLog: true,
  persist: true,
});
```

You can check the console and you'll see that emstore is saving every state change in local storage.

![alt emstore](.assets/storage.gif)

If your state is a `Map` or `Set` you need to enable in `immer` with `enableMapAndSet`.

```jsx
const { Provider, useState, eventState } = createStore({ value: 0 }, {
  consoleLog: true,
  persist: true,
  enableMapAndSet: true,
});
```

You could hook up to on `onSetState`.

```jsx
const { Provider, useState, eventState } = createStore({ value: 0 }, {
  consoleLog: true,
  persist: true,
  enableMapAndSet: true,
  onSetState: onSetState, // your function
});
```

If for some reason your app can't persist on browser refresh for example if you use `Set` or `Map` you have to handle yourself with `handleLocalStorageDataSave` and handle `handleLocalStorageDataLoad`.

```typescript
const { Provider, useState, eventState } = createStore({ value: 0 }, {
  consoleLog: true,
  persist: true,
  enableMapAndSet: true,
  onSetState: onSetState, // your function
  handleLocalStorageDataSave: handleLocalStorageDataSave, // your function
  handleLocalStorageDataLoad: handleLocalStorageDataLoad, // your function
});
```

If for some reason you need to revert the state after some time to the previous state, something like time to live (TTL) this is how you are going to use it.

```typescript
const { Provider, useState, eventState } = createStore({ value: 0 }, {
  consoleLog: true,
  persist: true,
  enableMapAndSet: true,
  onSetState: onSetState, // your function
  handleLocalStorageDataSave: handleLocalStorageDataSave, // your function
  handleLocalStorageDataLoad: handleLocalStorageDataLoad, // your function
  ttl: {
    value: 3 * 1000 // 3 seconds
  },
});
```

That's it. 🎉 Have a nice day and keep smiling! 😊

## Examples

- [counter](./examples/basic/)
- [numbers](./examples/numbers/)