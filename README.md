![alt text](https://raw.githubusercontent.com/nikolamar/em/master/.assets/em.png)

<p>The Event Manager is a bare-bone simple state manager. <strong>It is very easy to use.</strong> It allows you to quickly prototype the app and easily manage and track your state changes. <strong>You are in control of organising and keeping things simple.</strong> Wrap your actions-events and easily log them, measure performance and use middlewares. <strong>Set state from anywhere</strong> outside, inside whatever.</p>

<ul>
  <li>Zero configuration</li>
  <li>No boilerplate</li>
  <li>Easy state wrapper</li>
  <li>Extensive TypeScript support</li>
  <li>State persistence</li>
  <li>Make it local or global</li>
</ul>

<p>&nbsp;</p>

All of this comes via a single dependency install.

```
npm install emstore
```

<p>&nbsp;</p>

## Fly like an eagle

**Create multiple states**

```javascript
export const states = new Map([
  ["firstName", "Pamela"],
  ["lastName", "Anderson"],
  [
    "qualities",
    {
      hair: "blonde",
      eyes: "blue" 
    },
  ],
]);
```

**Create an event function to track it**

```javascript
import { event, state } from "emstore";

export const pamToMitch = event("pamToMitch", () => {
  const [firstName, setFirstName] = state("firstName");
  const [lastName, setLastName] = state("lastName");
  const [qualities, setQualities] = state("qualities");

  // change name to Mitch Buchannon
  setFirstName(() => "Mitch");
  setLastName(() => "Buchannon");

  // mutation-like immutability
  setQualities((draft) => {
    draft.hair = "dark brown";
  });
});
```

**Wrap your application in states provider**

```javascript
import { Provider } from "emstore";

function App() {
  return (
    <Provider
      statelog={true}
      eventlog={true}
      states={states}
      persistent={true}
    >
      <LifeGuard />
    </Provider>
  );
}
```

**Use the states and events in component**

```javascript
import { withState } from "emstore";

export const LifeGuard = withState(
  ({ states: [firstName, lastName] }) => {
    return (
      <ul>
        <li>{firstName}</li>
        <li>{lastName}</li>
        <button onClick={pamToMitch} />
      </ul>
    );
  },
  ["firstName", "lastName"]
);
```

**Pamela Anderson becomes a man a Mitch Buchannon**

<p>&nbsp;</p>

## Todo

- [ ] Dev Tools
- [ ] Middlewares
- [ ] Record bug
- [ ] Measuring performance

## Our Sponsors ❤️

We have only but great appreciation to those who support this project. If you
have the ability to help contribute towards the continued maintenance and
evolution of this library then please consider
[[becoming a sponsor](https://github.com/nikolamar/em)].

<p>&nbsp;</p>

## Documentation

See the [official website](https://github.com/nikolamar/em) for tutorials, docs, recipes,
and more.

<p>&nbsp;</p>

## OS Awards

None
