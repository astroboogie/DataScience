from getLatestSemesters import getLatestSemesters
import utils
import json
import re
import os

def extractClasses(courseInfo):
	classes = ""
	scheduleMarker = False
	for line in courseInfo:
		if scheduleMarker or "Schedule:" in line:
			scheduleMarker = True
			classes += line + "\n"
	return classes.splitlines()

def getDays(line):
	return line[line.index("size=-1>") + len("size=-1>") : line.index("    ")].replace("M", "M ").replace("Th", "Th ").replace("F", "F ").replace("W", "W ").replace("TS", "T S").replace("TF", "T F").replace("TT", "T T").replace("TW", "T W").rstrip(" ")

def getLecTime(line):
	return line[line.index("    ") + len("    ") : line.index("LEC")].lstrip(" ").rstrip(" ")

def getLabTime(line):
	return line[line.index("    ") + len("    ") : line.rindex("LAB")].lstrip(" ").rstrip(" ")

def getRoom(start, line):
	room = line[line.rindex(start) + len(start) : line.rindex("  ")].lstrip(" ").rstrip(" ")
	if not room:
		room = line[line.rfind(start) + len(start) : line.rfind("<a href") - 7].lstrip(" ").rstrip(" ") or "TBA"
	return room

def populateClasses(classes, url):
	response = utils.getHTML(url, "class schedule")
	classCount = 0
	print "Parsing the classes..."

	schedule = None
	days = None
	lecTime = None
	labTime = None
	instructor = None
	lecRoom = None
	labRoom = None
	classNum = None
	classType = 'On Campus'
	while True:
		courseInfo = utils.extractCourseInfo(response, "<!--Course Title-->", "<center><hr width=60%></center>")
		if not courseInfo:
			break

		courseTitle = utils.extractInfo(courseInfo, "Course Title", "<b>", "    ")
		if not courseTitle:
			continue
		courseName = utils.extractInfo(courseInfo, "Course Title", "    ", "    ")

		for line in courseInfo:
			line = line.replace("&nbsp;", " ")
			schedule = utils.extractInfoFromLine(line, "Schedule:", "</em><b>", "</b>") or schedule
			if "font face=Courier" in line:
				days = getDays(line)
				if "LEC" in line:
					lecTime = getLecTime(line)
					instructor = line[line.index("LEC") + len("LEC") : line.index("  ", line.index("LEC"))].lstrip(" ").rstrip(" ")
					lecRoom = getRoom(instructor, line)
				elif "LAB" in line:
					labTime = getLabTime(line)
					instructor = line[line.index("LAB") + len("LAB") : line.index("    ", line.index("LAB"))].lstrip(" ").rstrip(" ")
					labRoom = getRoom(instructor, line)
				instructor = instructor.replace(".", ". ")
				classNum = utils.extractInfoFromLine(line, "Textbook", lecRoom or labRoom, "<a href") or classNum
			if '<!--Meetings Notes-->' in line and '<b>' in line:
				classTypeNote = utils.extractInfoFromLine(line, '<!--Meetings Notes-->', '<b>', '</b>') or ''
				if 'Interactive Television' in classTypeNote:
					classes[-1]["classType"] = 'Television'
				elif 'hybrid' in classTypeNote:
					classes[-1]["classType"] = 'Hybrid'
				elif 'online' in classTypeNote:
					classes[-1]["classType"] = 'Online'
				else:
					classes[-1]["classType"] = 'On Campus'
			if schedule and days and instructor and classNum and (lecTime or labTime) or (lecRoom or labRoom):
				if len(classes) > 1 and classNum == classes[-1]["classNum"]:
					classes[-1]["labTime"] = classes[-1]["labTime"] or labTime
					classes[-1]["lecRoom"] = classes[-1]["lecRoom"] or lecRoom
					classes[-1]["labRoom"] = classes[-1]["labRoom"] or labRoom
				else:
					classes.append({"schedule" : schedule})
					classes[-1]["days"] = days
					classes[-1]["lecTime"] = lecTime
					classes[-1]["labTime"] = labTime
					classes[-1]["instructor"] = instructor
					classes[-1]["lecRoom"] = lecRoom
					classes[-1]["labRoom"] = labRoom
					classes[-1]["classNum"] = classNum
					classes[-1]["courseTitle"] = courseTitle
					classes[-1]["courseName"] = courseName
					classes[-1]["classType"] = classType or "On Campus"
					classes[-1]["id"] = str(classCount)
					classCount += 1
				days = None
				lecTime = None
				labTime = None
				instructor = None
				lecRoom = None
				labRoom = None
				classType = None
	print "Successfully added", classCount, "classes.\n"

def getClasses(semesters):
	for item in semesters:
		classes = []
		populateClasses(classes, "http://www.losrios.edu/schedules_reader_all.php?loc=flc/" + item["endpoint"] + "/index.html")

		filePath = utils.getAndCreateFilePath('classes', item["endpoint"])
		utils.writeJSON(classes, filePath)

if __name__ == "__main__":
	getClasses(getLatestSemesters())
