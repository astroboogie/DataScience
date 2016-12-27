from utils import *
import json

def populateEvents(object, url):
	response = getHTML(url, "events")
	print "Parsing event data..."
	eventCount = 0
	object["events"] = []
	while True:
		eventItem = extractCourseInfo(response, '<div class="calendarentry">', '</div>')
		if not eventItem:
			break
		title = extractInfo(eventItem, '<h4>', '<h4>', '</h4>')
		date = extractInfo(eventItem, 'Date:', 'Date:</b>', '<br>')
		location = extractInfo(eventItem, 'Location:', 'Location:</b>', '</p>')
		description = extractInfo(eventItem, '<p><p>', '<p><p>', '</p></p>')
		
		if not filter(lambda event: event['description'] == description, object["events"]):
			object["events"].append({"title" : title})
			object["events"][-1]["id"] = str(eventCount)
			object["events"][-1]["date"] = date
			object["events"][-1]["location"] = location
			object["events"][-1]["description"] = description
			eventCount += 1
	print "Successfully parsed", eventCount, "events."

def Main():
	events = {}
	populateEvents(events, "http://www.flc.losrios.edu/x65?view=month")
	
	r = json.dumps(events, sort_keys=True, indent=4, separators=(',', ': '))
	f = open('events.json', 'w')

	f.write(r)
	f.close()
Main()