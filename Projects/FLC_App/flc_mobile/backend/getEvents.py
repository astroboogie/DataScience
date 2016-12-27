import utils
import json

def populateEvents(object, url):
	response = utils.getHTML(url, "events")
	print "Parsing event data..."
	eventCount = 0
	object["events"] = []
	while True:
		eventItem = utils.extractCourseInfo(response, '<div class="calendarentry">', '</div>')
		if not eventItem:
			break
		title = utils.extractInfo(eventItem, '<h4>', '<h4>', '</h4>')
		date = utils.extractInfo(eventItem, 'Date:', 'Date:</b>', '<br>')
		location = utils.extractInfo(eventItem, 'Location:', 'Location:</b>', '</p>')
		description = utils.extractInfo(eventItem, '<p><p>', '<p><p>', '</p></p>')
		
		if not filter(lambda event: event['description'] == description, object["events"]):
			object["events"].append({"title" : title})
			object["events"][-1]["id"] = str(eventCount)
			object["events"][-1]["date"] = date
			object["events"][-1]["location"] = location
			object["events"][-1]["description"] = description
			eventCount += 1
	print "Successfully parsed", eventCount, "events."

def getEvents():
	events = {}
	populateEvents(events, "http://www.flc.losrios.edu/x65?view=month")
	
	r = json.dumps(events, sort_keys=True, indent=4, separators=(',', ': '))
	f = open('events.json', 'w')

	f.write(r)
	f.close()
getEvents()