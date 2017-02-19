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
		for line in eventItem:
			if '<p><p>' in line and '</p></p>' in line:
				description = utils.extractInfo(eventItem, '<p><p>', '<p><p>', '</p></p>')
			elif '<p><p>' in line:
				description = line
			else:
				description = ''

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

	filePath = utils.getAndCreateFilePath('', 'events')
	utils.writeJSON(events, filePath)

if __name__ == "__main__":
	getEvents()
