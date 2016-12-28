import utils
import json
import re
import os

# Special function for Units because the page formatting does
# not have unique delimeters for the Units
def extractUnits(courseInfo):
	units = None
	for line in courseInfo:
		if "Course Title" in line:
			line = line.replace("&nbsp;", " ")
			units = line[line.rindex("    ") + 4 : line.rindex("</b>")]
			units = re.sub("[^.0-9\-]", "", units)
	return units

def extractClassTimes(courseInfo):
	classTimes = ""
	scheduleMarker = False
	for line in courseInfo:
		if scheduleMarker or "Schedule:" in line:
			scheduleMarker = True
			classTimes += line + "\n"
	return classTimes.splitlines()

# Returns an array of dictionaries that containing
# all information pertaining to class times
def extractClassTimesInfo(courseInfo):
	classTime = []
	schedule = None
	days = None
	lecTime = None
	labTime = None
	instructor = None
	lecRoom = None
	labRoom = None
	classNum = None
	classTimesCount = 0
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
		if schedule and days and instructor and classNum and (lecTime or labTime) or (lecRoom or labRoom):
			classTime.append({"schedule" : schedule})
			classTime[-1]["days"] = days
			classTime[-1]["lecTime"] = lecTime
			classTime[-1]["labTime"] = labTime
			classTime[-1]["instructor"] = instructor
			classTime[-1]["lecRoom"] = lecRoom
			classTime[-1]["labRoom"] = labRoom
			classTime[-1]["classNum"] = classNum
			classTime[-1]["id"] = str(classTimesCount)
			days = None
			lecTime = None
			labTime = None
			instructor = None
			lecRoom = None
			labRoom = None
			classTimesCount += 1
	return classTime

# @Param - Object, holds the json data
# @Param - url
def populateClasses(classes, url):
	response = utils.getHTML(url, "class schedule")
	print "Parsing the classes..."
	classCount = 0
	classTimesCount = 0
	while True:
		courseInfo = utils.extractCourseInfo(response, "<!--Course Title-->", "<center><hr width=60%></center>")
		if not courseInfo:
			break

		courseTitle = utils.extractInfo(courseInfo, "Course Title", "<b>", "    ")
		if not courseTitle:
			continue
		classCount += 1
		
		courseName = utils.extractInfo(courseInfo, "Course Title", "    ", "    ")
		units = extractUnits(courseInfo)
		description = utils.extractInfo(courseInfo, "Description:", "</em>", "<br />")
		prerequisite = utils.extractInfo(courseInfo, "Prerequisite:", "</em>", "<br />")
		corequisite = utils.extractInfo(courseInfo, "Corequisite:", "</em>", "<br />")
		hours = utils.extractInfo(courseInfo, "Hours:", "</em>", "<br />")
		transferableTo = utils.extractInfo(courseInfo, "Transferable to", "Course Transferable to ", "</em>")
		advisory = utils.extractInfo(courseInfo, "Advisory:", "</em>", "<br />")
		generalEducation = utils.extractInfo(courseInfo, "General Education: ", "</em>", "<br />")
		enrollmentLimitation = utils.extractInfo(courseInfo, "Enrollment Limitation:", "</em>", "<br />")
		sameAs = utils.extractInfo(courseInfo, "Same As:", "</em>", "<br />")
		courseFamily = utils.extractInfo(courseInfo, "Course Family:", "</em>", "<br />")

		classes.append({"courseTitle" : courseTitle})
		classes[-1]["courseName"] = courseName
		classes[-1]["units"] = units
		classes[-1]["description"] = description
		classes[-1]["prerequisite"] = prerequisite
		classes[-1]["corequisite"] = corequisite
		classes[-1]["hours"] = hours
		classes[-1]["transferableTo"] = transferableTo
		classes[-1]["advisory"] = advisory
		classes[-1]["generalEducation"] = generalEducation
		classes[-1]["enrollmentLimitation"] = enrollmentLimitation
		classes[-1]["sameAs"] = sameAs
		classes[-1]["courseFamily"] = courseFamily
		
		classTimes = extractClassTimesInfo(extractClassTimes(courseInfo))
		classTimesCount += len(classTimes)
		classes[-1]["classTimes"] = classTimes
	print "Successfully added ", classCount, " classes and ", classTimesCount, " class times.\n"

def getClasses():
	classes = []
	
	url = "http://www.losrios.edu/schedules_reader_all.php?loc=flc/fall/index.html"
	populateClasses(classes, url)
	
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