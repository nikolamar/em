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

export function increase() {
  const [, setValue] = state("value");

  setValue((value: number) => value++);
};
```

Add a button to fire the `increase` event.

```jsx
<button onClick={increase}>+</button>
```

Create event called `decrease`.

```typescript
const state = eventState("decrease");

export function decrease() {
  const [, setValue] = state("value");

  setValue((value: number) => value--);
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

That's it. 🎉 Have a nice day and keep smiling! 😊