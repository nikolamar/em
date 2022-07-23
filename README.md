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

**Create a map of states**

```javascript
export const states = new Map([
  ["firstName", "Pamela"],
  ["lastName", "Anderson"],
  [
    "appearance",
    {
      hair: "blonde",
      eyes: "blue" 
    },
  ],
]);
```

**Wrap your application in provider**

```javascript
import { Provider } from "emstore";
import { LifeGuard } from "life-guard";

function App() {
  return (
    <Provider
      states={states}
      statelog={true}
      eventlog={true}
      persistent={true}
    >
      <LifeGuard />
    </Provider>
  );
}
```

**Create a event function**

```javascript
import { event, state } from "emstore";

export const pamToMitch = event("pamToMitch", () => {
  const [firstName, setFirstName] = state("firstName");
  const [lastName, setLastName] = state("lastName");
  const [appearance, setAppearance] = state("appearance");

  // change name to Mitch Buchannon
  setFirstName(() => "Mitch");
  setLastName(() => "Buchannon");

  // mutation-like immutability
  setAppearance((draft) => {
    draft.hair = "dark brown";
  });
});
```

**Inject states with withState function and use your event**

```javascript
import { withState } from "emstore";
import { pamToMitch } from "./pam-to-mitch";

export const LifeGuard = withState(
  ({ states: [firstName, lastName, appearance] }) => {
    return (
      <ul>
        <li>{firstName}</li>
        <li>{lastName}</li>
        <li>{appearance.hair}</li>
        <li>{appearance.eyes}</li>
        <button onClick={pamToMitch}>Pamela to Mitch</button>
      </ul>
    );
  },
  ["firstName", "lastName", "appearance"]
);
```

**Click on the button and Pamela becomes a Mitch**

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
