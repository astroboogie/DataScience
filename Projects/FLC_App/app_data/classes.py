import urllib2
import json
import re
import string
import itertools

# Returns a string containing all the lines relating to
# a single class
def extractCourseInfo(response):
	courseInfo = ""
	start = "<!--Course Title-->" # signifies start of course info
	startFlag = False
	end = "<center><hr width=60%></center>" # signifies end of course info
	for line in response:
		if startFlag and end in line:
			break
		elif startFlag:
			courseInfo += line
		elif "<!--Course Title-->" in line:
			startFlag = True
			courseInfo += line
	return courseInfo
	
def extractInfo(courseInfo, marker, lindex, rindex):
	info = None
	for line in courseInfo:
		if marker in line:
			line = line.replace("&nbsp;", " ")
			line = line.replace("'", "")		# remove quotes (messes up json parsing)
			line = line.replace('"', '')		# remove quotes (messes up json parsing)
			if lindex == rindex:
				info = line[line.index(lindex) + len(lindex) : line.rindex(rindex)]
			else:
				info = line[line.index(lindex) + len(lindex) : line.index(rindex)]
			info = info.rstrip(" ").lstrip(" ").decode('ascii','ignore').encode("ascii") # remove extra whitespace
			info = re.sub(r'<.+?>', '', info)											 # remove any html elements in the line
			info = filter(lambda x: x in string.printable, info) 						 # remove non-printing characters
			break
	return info

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
	return classTimes

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
	for line in courseInfo:
		line = line.replace("&nbsp;", " ")
		if "Schedule:" in line:
			schedule = line[line.index("</em><b>") + len("</em><b>") : line.index("</b>")]
		elif "font face=Courier" in line:
			days = line[line.index("size=-1>") + len("size=-1>") : line.index("    ")].replace("M", "M ").replace("Th", "Th ").replace("F", "F ").replace("W", "W ").replace("TS", "T S").replace("TF", "T F").replace("TT", "T T").replace("TW", "T W").rstrip(" ")
			if "LEC" in line:
				lecTime = line[line.index("    ") + len("    ") : line.index("LEC")].lstrip(" ").rstrip(" ")
				instructor = line[line.index("LEC") + len("LEC") : line.index("  ", line.index("LEC"))].lstrip(" ").rstrip(" ")
				lecRoom = line[line.rindex(instructor) + len(instructor) : line.rindex("   ")].lstrip(" ").rstrip(" ")
				if not lecRoom:
					lecRoom = line[line.rindex(instructor) + len(instructor) : line.rindex("BOARDROOM") + len("BOARDEOOM")].lstrip(" ").rstrip(" ")
				instructor = instructor.replace(".", ". ")
			elif "LAB" in line:
				labTime = line[line.index("    ") + len("    ") : line.rindex("LAB")].lstrip(" ").rstrip(" ")
				instructor = line[line.index("LAB") + len("LAB") : line.index("    ", line.index("LAB"))].lstrip(" ").rstrip(" ")
				labRoom = line[line.rindex(instructor) + len(instructor) : line.rindex("   ")].lstrip(" ").rstrip(" ")
				if not labRoom:
					labRoom = line[line.rfind(instructor) + len(instructor) : line.rfind("BOARDROOM") + len("BOARDEOOM")].lstrip(" ").rstrip(" ")
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
			days = None
			lecTime = None
			labTime = None
			instructor = None
			lecRoom = None
			labRoom = None
	return classTime

# @Param - url, the url to get the page source from
def getHTML(url):
	print "Fetching class schedules data..."
	attempts = 0
	while attempts < 3:
		try:
			response = urllib2.urlopen(url, timeout = 5)
			print "Succesfully fetched class schedules data.\n"
			return response
		except Exception as e:
			attempts += 1
			print type(e), ": ", e
	print "Failed to fetch class schedules data.\n"
	return None

# @Param - Object, holds the json data
# @Param - htmlData, the iterable page source
def populateClasses(object, htmlData):
	if htmlData:
		print "Parsing the classes data..."
		classCount = 0
		classTimesCount = 0
		object["classes"] = []
		while True:
			courseInfo = extractCourseInfo(htmlData).splitlines()
			if not courseInfo:
				break

			courseTitle = extractInfo(courseInfo, "Course Title", "<b>", "    ")
			if not courseTitle:
				continue
			classCount += 1
			
			courseName = extractInfo(courseInfo, "Course Title", "    ", "    ")
			units = extractUnits(courseInfo)
			description = extractInfo(courseInfo, "Description:", "</em>", "<br />")
			prerequisite = extractInfo(courseInfo, "Prerequisite:", "</em>", "<br />")
			corequisite = extractInfo(courseInfo, "Corequisite:", "</em>", "<br />")
			hours = extractInfo(courseInfo, "Hours:", "</em>", "<br />")
			transferableTo = extractInfo(courseInfo, "Transferable to", "Course Transferable to ", "</em>")
			advisory = extractInfo(courseInfo, "Advisory:", "</em>", "<br />")
			generalEducation = extractInfo(courseInfo, "General Education: ", "</em>", "<br />")
			enrollmentLimitation = extractInfo(courseInfo, "Enrollment Limitation:", "</em>", "<br />")
			sameAs = extractInfo(courseInfo, "Same As:", "</em>", "<br />")
			courseFamily = extractInfo(courseInfo, "Course Family:", "</em>", "<br />")

			object["classes"].append({"courseTitle" : courseTitle})
			object["classes"][-1]["courseName"] = courseName
			object["classes"][-1]["units"] = units
			object["classes"][-1]["description"] = description
			object["classes"][-1]["prerequisite"] = prerequisite
			object["classes"][-1]["corequisite"] = corequisite
			object["classes"][-1]["hours"] = hours
			object["classes"][-1]["transferableTo"] = transferableTo
			object["classes"][-1]["advisory"] = advisory
			object["classes"][-1]["generalEducation"] = generalEducation
			object["classes"][-1]["enrollmentLimitation"] = enrollmentLimitation
			object["classes"][-1]["sameAs"] = sameAs
			object["classes"][-1]["courseFamily"] = courseFamily
			
			classTimes = extractClassTimes(courseInfo).splitlines()
			classTime = extractClassTimesInfo(classTimes)
			classTimesCount += len(classTime)
			
			object["classes"][-1]["classTimes"] = classTime
		print "Successfully added ", classCount, " classes and ", classTimesCount, " class times.\n"
		return True
	else:
		return False
		
# @Param - Object, holds the json data
# @Param - htmlData, the iterable page source
def populateSubjects(object, htmlData):
	if htmlData:
		print "Parsing the subjects data..."
		subjectCount = 0
		object["subjects"] = []
		lindex = "</b></b><center><h3>"
		rindex = "</h3>"
		
		for line in htmlData:
			if lindex in line and rindex in line:
				subject = line[line.index(lindex) + len(lindex) : line.rindex(rindex)]
				subjectAbbrev = subject[subject.find("(") + 1 : subject.find(")")]
				subjectReadable = subject[0 : subject.find("(")].rstrip(" ")
				object["subjects"].append({subjectAbbrev : subjectReadable})
				subjectCount += 1
		print "Successfully added ", subjectCount, " subjects.\n"
		
def populateInstructors(object, htmlData):
	print "Parsing the instructors..."
	instructorCount = 0
	object["instructors"] = []
	for item in object["classes"]:
		for classTime in item["classTimes"]:
			if classTime["instructor"] not in object["instructors"] and classTime["instructor"] != "TBA":
				object["instructors"].append(classTime["instructor"])
				instructorCount += 1
	print "Successfully added", instructorCount, " instructors.\n"
		
def Main():
	classList = {}
	
	response = getHTML("http://www.losrios.edu/schedules_reader_all.php?loc=flc/fall/index.html")
	response1, response2, response3 = itertools.tee(iter(response), 3) # create multiple iterable versions of the response
	
	populateClasses(classList, response1)
	populateSubjects(classList, response2)
	populateInstructors(classList, response3)
	
	r = json.dumps(classList, sort_keys=True, indent=4, separators=(',', ': '))
	f = open('classesOut.txt', 'w')
	f.write(r)
		
Main()
