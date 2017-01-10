import utils
import json
import os
import re

def parseOpponentInfo(opponentInfo):
	info = ''
	for line in opponentInfo:
		info += line
	info = utils.extractInfoFromLine(info, '<div class="opponent">', '<span class="va">', '</div>')
	info = re.sub(' +', ' ', info) # Remove mutliple spaces
	return info

def populateSports(sports, url):
	response = utils.getHTML(url, "sports")
	print "Parsing sports data..."
	sportCount = 0
	while True:
		sportItem = utils.extractCourseInfo(response, '<div class="event-info clearfix">', '<div class="event-box clearfix">')
		if not sportItem:
			break
		month = utils.extractInfo(sportItem, '<span class="month">', '<span class="month">', '</span>')
		day = utils.extractInfo(sportItem, '<span class="dd">', '<span class="dd">', '</span>')
		date = month + ' ' + day
		sport = utils.extractInfo(sportItem, '<div class="sport">', '<div class="sport">', '</div>')
		time = utils.extractInfo(sportItem, '<span class="status">', '<span class="status">', '</span>')
		neutralSite = utils.extractInfo(sportItem, '<div class="neutral-site">', '<div class="neutral-site">', '</div>')

		opponentInfo = utils.extractCourseInfo(sportItem, '<div class="opponent">', '</div>')
		opponent = parseOpponentInfo(opponentInfo)

		sports.append({"date" : date})
		sports[-1]["id"] = str(sportCount)
		sports[-1]["sport"] = sport
		sports[-1]["time"] = time
		sports[-1]["opponent"] = opponent
		sports[-1]["neutralSite"] = neutralSite
		sportCount += 1
	print "Successfully parsed", sportCount, "sports.\n"

def getSports():
	events = []
	populateSports(events, "http://flcfalcons.com/landing/index")

	filePath = utils.getAndCreateFilePath('', 'sports')
	utils.writeJSON(events, filePath)

if __name__ == "__main__":
	getSports()
