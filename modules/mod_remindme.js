require('datejs');
var uuid = require('node-uuid');

exports['load'] = (registerCommand, registerHandler, moduleStorage, moduleApi) => {
	var activeTimers = {};
	
	var fireReminder = (reminderUuid) => {
		var reminder = moduleStorage.getItem(reminderUuid);
		moduleApi.say(reminder["user"] + " Reminder from " + (new Date(reminder.startDate)).toString("MMM dS yyyy, HH:mm:ss") + " - " + reminder["msg"],
		              reminder["channel"]);
		moduleStorage.removeItem(reminderUuid);
	};

	var updateTimers = () => {
		for(var reminderUuid of moduleStorage.keys()) {
			if(activeTimers[reminderUuid]) {
				continue;
			}

			var reminder = moduleStorage.getItem(reminderUuid);

			if(!reminder)
				continue;

			if(reminder["endDate"] < Date.now()) {
				moduleStorage.removeItem(reminderUuid);
			} else if((reminder["endDate"] - Date.now()) >= 2100000000) {
				// might be too far ahead because Node mimics browser limits, better wait
			} else {
				activeTimers[reminderUuid] = setTimeout(fireReminder, reminder["endDate"] - Date.now(), reminderUuid);
			}
		}
	}

	updateTimers();
	
	registerCommand('remindme', ['r'], 'commas', (api, args) => {
		if(args.length < 1) {
			api.reply("I don't know when to remind you. :<");
			return;
		}
		
		var msg = args.slice(1).join(", ").replace(/^\s+|\s+$/g, '') || "<no message provided>";
		var startDate = Date.now();
		var endDate = Date.parse(args[0]);

		if(endDate) {
			var reminderUuid = uuid.v4();
			moduleStorage.setItem(reminderUuid, {msg, startDate: startDate - 0, endDate: endDate - 0, channel: api.channelId(), user: api.userMention()});
			api.reply("Okay, stored that reminder!");
			updateTimers();
		} else {
			api.reply("Sorry, didn't understand that time/date.");
		}
	}, "remindme <time/date>[, <msg>]: Set a reminder for Yuki to send you later. Reminders will be posted in the same channel they were requested in.\nThe time/date is fairly flexible and will accept most ways of expressing an exact time/date, or +/- amounts of time.");
};
