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

def populateClasses(classes, url):
	response = utils.getHTML(url, "class schedule")
	print "Parsing the courses..."
	classCount = 0
	schedule = None
	days = None
	lecTime = None
	labTime = None
	instructor = None
	lecRoom = None
	labRoom = None
	classNum = None
	classType = None
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
			if "Schedule:" in line:
				schedule = line[line.index("</em><b>") + len("</em><b>") : line.index("</b>")]
			elif "font face=Courier" in line:
				days = line[line.index("size=-1>") + len("size=-1>") : line.index("    ")].replace("M", "M ").replace("Th", "Th ").replace("F", "F ").replace("W", "W ").replace("TS", "T S").replace("TF", "T F").replace("TT", "T T").replace("TW", "T W").rstrip(" ")
				if "LEC" in line:
					lecTime = line[line.index("    ") + len("    ") : line.index("LEC")].lstrip(" ").rstrip(" ")
					instructor = line[line.index("LEC") + len("LEC") : line.index("  ", line.index("LEC"))].lstrip(" ").rstrip(" ")
					lecRoom = line[line.rindex(instructor) + len(instructor) : line.rindex("  ")].lstrip(" ").rstrip(" ")
					if not lecRoom:
						lecRoom = line[line.rindex(instructor) + len(instructor) : line.rindex("<a href") - 7].lstrip(" ").rstrip(" ")
					instructor = instructor.replace(".", ". ")
				elif "LAB" in line:
					labTime = line[line.index("    ") + len("    ") : line.rindex("LAB")].lstrip(" ").rstrip(" ")
					instructor = line[line.index("LAB") + len("LAB") : line.index("    ", line.index("LAB"))].lstrip(" ").rstrip(" ")
					labRoom = line[line.rindex(instructor) + len(instructor) : line.rindex("  ")].lstrip(" ").rstrip(" ")
					if not labRoom:
						labRoom = line[line.rfind(instructor) + len(instructor) : line.rfind("<a href") - 7].lstrip(" ").rstrip(" ")
						if not labRoom:
							labRoom = "TBA"
					instructor = instructor.replace(".", ". ")
				if "Textbook" in line:
					room = lecRoom or labRoom
					classNum = line[line.index(room) + len(room) : line.index("<a href")].lstrip(" ").rstrip(" ")
			meetingNotes = utils.extractCourseInfo(courseInfo, '<font face=Courier size=-1>', '<font face=Courier size=-1>')
			for line2 in meetingNotes:
				if '<!--Meetings Notes-->' in line2 and '<b>' in line2:
					classTypeNote = utils.extractInfoFromLine(line2, '<!--Meetings Notes-->', '<b>', '</b>')
					if classTypeNote:
						if 'hybrid' in classTypeNote:
							classType = 'Hybrid'
						elif 'online' in classTypeNote:
							classType = 'Online'
						else:
							classType = 'On Campus'
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

def getClasses():
	classes = []
	populateClasses(classes, "http://www.losrios.edu/schedules_reader_all.php?loc=flc/fall/index.html")
	
	if os.path.isdir('/tmp'):
		# For writing on AWS Lambda
		filePath = '/tmp/classes.json'
	else:
		# For writing locally
		filePath = 'classes.json'
		
	with open(filePath, 'w') as f:
		f.write(json.dumps(classes, indent=4, separators=(',', ': ')))
	
if __name__ == "__main__":
	getClasses()