'use strict';

const { Broadcast, Logger } = require('whispermud-core');
const boatID = 'ocean:boat';
const portBehavior = 'port';

module.exports = {
	aliases: [ 'travel' ],
	usage: 'sail <location>',
	command: state => (args, player, arg0) => {
		// sail takes a single numerical argument, which corresponds to the room.behavior.destinations array
		let prevRoom = player.room;

		if (prevRoom && prevRoom.hasBehavior(portBehavior)) {
			// You can only travel from a room that has port behavior
			let port = prevRoom.getBehavior(portBehavior);
			let destination = port.destinations[args[0]]
			let nextRoom = state.RoomManager.getRoom(destination.id);
			let boat = state.RoomManager.getRoom(boatID);
			if (nextRoom) {
				// Move the player to the boat room, floating out in the ocean
				// Grant the traveling effect to the player, which handles the rest
				Logger.log('SAIL:', player.name, args[0], nextRoom.title);
				
				player.moveTo(boat, () => {
					Broadcast.sayAt(player, 'You board a passenger ship to ' + nextRoom.title);
					let effect = state.EffectFactory.create('travel', {
						duration: destination.time * 1000
					}, {
						nextRoom
					});
					player.addEffect(effect);
				});

				Broadcast.sayAt(prevRoom, player.name + ' boarded a ship bound for ' + nextRoom.title);
			} else {
				Broadcast.sayAt(player, 'Please select a valid port number from the sign!');
			}
		} else {
			Broadcast.sayAt(player, 'You can only sail at a port!');
		}
	}
};
