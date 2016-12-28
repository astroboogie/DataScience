import utils
import json
import os

def populateEvents(events, url):
	response = utils.getHTML(url, "events")
	print "Parsing event data..."
	eventCount = 0
	while True:
		eventItem = utils.extractCourseInfo(response, '<div class="calendarentry">', '</div>')
		if not eventItem:
			break
		title = utils.extractInfo(eventItem, '<h4>', '<h4>', '</h4>')
		date = utils.extractInfo(eventItem, 'Date:', 'Date:</b>', '<br>')
		location = utils.extractInfo(eventItem, 'Location:', 'Location:</b>', '</p>')
		description = utils.extractInfo(eventItem, '<p><p>', '<p><p>', '</p></p>')
		
		if not filter(lambda event: event['description'] == description, events):
			events.append({"title" : title})
			events[-1]["id"] = str(eventCount)
			events[-1]["date"] = date
			events[-1]["location"] = location
			events[-1]["description"] = description
			eventCount += 1
	print "Successfully parsed", eventCount, "events.\n"

def getEvents():
	events = []
	populateEvents(events, "http://www.flc.losrios.edu/x65?view=month")
	
	if os.path.isdir('/tmp'):
		# For writing on AWS Lambda
		filePath = '/tmp/events.json'
	else:
		# For writing locally
		filePath = 'events.json'
	
	with open(filePath, 'w') as f:
		f.write(json.dumps(events, indent=4, separators=(',', ': ')))
			
if __name__ == "__main__":
	getEvents()