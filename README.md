# addama-sailing

A module for ranviermud that enables the creation of ports and allows timegated travel between disjointed rooms

## What comes in the box

* `ocean` area
* `port` room behavior
* `port_sign` item
* `sail` command
* `travel` effect
* `boat` room

## How to use

The only thing you have to do to enable ports and sea travel is to add the behavior and some metadata to a room that you want to serve as a port. The room's `port` behavior, coupled with the `sail` command take care of the rest.

Setting up a port room:

```
- id: portandrews
  title: "Port Andrews"
  coordinates: [10, 1, 0]
  description: "A bustling sea port"
  behaviors: 
    port: true
  metadata: 
    isPort: true
    destinations: 
      - id: "world:portjacobs"
        title: "Port Jacobs"
- id: portjacobs
  title: "Port Jacobs"
  coordinates: [0, 1, 0]
  description: "A historical sea port that has mostly transitioned to tourist activities, but still serves travelers"
  behaviors: 
    port: true
  metadata:
    isPort: true
    destinations: 
      - id: "world:portandrews"
        title: "Port Andrews"
```

## How it works

The `port` room behavior has no config, which is instead inside of metadata. The `metadata.destinations` array holds entity IDs and titles for each room you want to be able to sail to. This was done because of how the `port_sign` spawning works: we can't guarantee any of the rooms exist when the port room spawns, so we can't just ask the RoomManager to give us the title of a room that may or may not exist. This also means that you can name destinations differently in the `port_sign` than the room is named.

When a `port` room is spawned, it creates a `port_sign` item. It then goes through its `metadata.destinations` array, writing a 0-based index and the destination name as a list on the sign. This index is what the `sail` command uses to know which destination the player wants to travel to.

When the player executes a valid `sail` command, they are moved to the `boat` room in the `ocean` area and given the `travel` effect. This room has no exits, and just serves as a transitional location where players could potentially still RP on longer voyages. The `travel` effect handles the timegating as well as moving the player to their destination once their voyage is complete.

A graphical bar is displayed to show how many seconds of travel remains. The player is not blocked from making commands (mostly becuase I don't know how to do that), but it would probably mess up the graphics unless you're using a client. The time is configurable in both the `sail` command and the `travel` effect to fine tune how long travel should take. The `travel` effect applies a random amount of seconds to the travel time to represent the variability of the sea. Once the effect ends, the player is moved to their destination.

Example travel dialog:

```
Port Jacobs [PORT]
------------------------------------------------------------
A port

[Item] Sign: Port Destinations
[Exits: south]

> look sign

A sign with listings for all of the destinations from this port.
Use `sail <#>` to sail to a destination

Destinations:
[0] Port Andrews

> sail 0

You board a passenger ship to Port Andrews

>
Passenger Ship
------------------------------------------------------------
A ship charting a course through the open seas

[Exits: none]

The ship begins its voyage toward Port Andrews
Traveling (24s) [....:....:....:....:....]
The ship arrives at Port Andrews and you disembark

Port Andrews [PORT]
------------------------------------------------------------
A port

[Item] Sign: Port Destinations
[Exits: none]

> 
```