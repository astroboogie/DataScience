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

def extractClasses(courseInfo):
	classes = ""
	scheduleMarker = False
	for line in courseInfo:
		if scheduleMarker or "Schedule:" in line:
			scheduleMarker = True
			classes += line + "\n"
	return classes.splitlines()

# Returns an array of dictionaries that containing
# all information pertaining to class times
def extractClassesInfo(courseInfo, classId):
	classes = []
	schedule = None
	days = None
	lecTime = None
	labTime = None
	instructor = None
	lecRoom = None
	labRoom = None
	classNum = None
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
			classes.append({"schedule" : schedule})
			classes[-1]["days"] = days
			classes[-1]["lecTime"] = lecTime
			classes[-1]["labTime"] = labTime
			classes[-1]["instructor"] = instructor
			classes[-1]["lecRoom"] = lecRoom
			classes[-1]["labRoom"] = labRoom
			classes[-1]["classNum"] = classNum
			classes[-1]["id"] = str(classId)
			days = None
			lecTime = None
			labTime = None
			instructor = None
			lecRoom = None
			labRoom = None
			classId += 1
	return classes

# @Param - Object, holds the json data
# @Param - url
def populateCourses(courses, url):
	response = utils.getHTML(url, "class schedule")
	print "Parsing the courses..."
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

		courses.append({"courseTitle" : courseTitle})
		courses[-1]["courseName"] = courseName
		courses[-1]["units"] = units
		courses[-1]["description"] = description
		courses[-1]["prerequisite"] = prerequisite
		courses[-1]["corequisite"] = corequisite
		courses[-1]["hours"] = hours
		courses[-1]["transferableTo"] = transferableTo
		courses[-1]["advisory"] = advisory
		courses[-1]["generalEducation"] = generalEducation
		courses[-1]["enrollmentLimitation"] = enrollmentLimitation
		courses[-1]["sameAs"] = sameAs
		courses[-1]["courseFamily"] = courseFamily
		
		classes = extractClassesInfo(extractClasses(courseInfo), classTimesCount)
		classTimesCount += len(classes)
		courses[-1]["classes"] = classes
	print "Successfully added ", classCount, " courses and ", classTimesCount, " class times.\n"

def getCourses():
	courses = []
	
	url = "http://www.losrios.edu/schedules_reader_all.php?loc=flc/fall/index.html"
	populateCourses(courses, url)
	
	if os.path.isdir('/tmp'):
		# For writing on AWS Lambda
		filePath = '/tmp/courses.json'
	else:
		# For writing locally
		filePath = 'courses.json'
		
	with open(filePath, 'w') as f:
		f.write(json.dumps(courses, indent=4, separators=(',', ': ')))
	
if __name__ == "__main__":
	getClasses()