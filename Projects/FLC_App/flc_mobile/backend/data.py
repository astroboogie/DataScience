import urllib2
import json
import re
import string
import itertools

# Returns a string containing all the lines relating to
# a single class
def extractCourseInfo(HTML, start, end):
	courseInfo = ""
	startFlag = False
	for line in HTML:
		if startFlag and end in line:
			courseInfo += line
			break
		elif startFlag:
			courseInfo += line
		elif start in line:
			courseInfo += line
			startFlag = True
	return courseInfo.splitlines()

def extractInfo(courseInfo, marker, lindex, rindex):
	info = None
	for line in courseInfo:
		info = extractInfoFromLine(line, marker, lindex, rindex)
		if info:
			break
	return info

def extractInfoFromLine(line, marker, lindex, rindex):
	info = None
	if marker in line:
		line = line.replace("&nbsp;", " ")
		if lindex == rindex:
			info = line[line.index(lindex) + len(lindex) : line.rindex(rindex)]
		else:
			info = line[line.index(lindex) + len(lindex) : line.index(rindex)]
		info = info.rstrip(" ").lstrip(" ").decode('ascii','ignore').encode("ascii") # remove extra whitespace
		info = info.replace("'", "")												 # remove quotes (messes up json parsing)
		info = info.replace('"', '')												 # remove quotes (messes up json parsing)
		info = re.sub(r'<.+?>', '', info)											 # remove any html elements in the line
		info = filter(lambda x: x in string.printable, info) 						 # remove non-printing characters
		info = info.replace("&amp;", "&")
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
			days = None
			lecTime = None
			labTime = None
			instructor = None
			lecRoom = None
			labRoom = None
	return classTime

# @Param - url, the url to get the page source from
def getHTML(url, reason = "html"):
	if reason:
		print "Fetching", reason, "data..."
	attempts = 0
	while attempts < 3:
		try:
			response = urllib2.urlopen(url, timeout = 5)
			if reason:
				print "Succesfully fetched", reason, "data.\n"
			return response
		except Exception as e:
			attempts += 1
			print type(e), ": ", e
	if reason:
		print "Failed to fetch", reason, "data.\n"
	return None

# @Param - Object, holds the json data
# @Param - htmlData, the iterable page source
def populateClasses(object, htmlData):
	if htmlData:
		print "Parsing the classes..."
		classCount = 0
		classTimesCount = 0
		object["classes"] = []
		while True:
			courseInfo = extractCourseInfo(htmlData, "<!--Course Title-->", "<center><hr width=60%></center>")
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
			
			classTimes = extractClassTimesInfo(extractClassTimes(courseInfo))
			classTimesCount += len(classTimes)
			object["classes"][-1]["classTimes"] = classTimes
		print "Successfully added ", classCount, " classes and ", classTimesCount, " class times.\n"
		return True
	else:
		return False
		
# @Param - Object, holds the json data
# @Param - htmlData, the iterable page source
def populateSubjects(object, htmlData):
	print "Parsing the subjects..."
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

def clearLine():
	print "\r                                                                                ",

def populateInstructors(object, url):
	# Assemble list of professors and their respective subjects from FLC Faculty page
	print "Fetching faculty information..."
	facultyMembersNum = 0
	facultyMembers = []
	response = getHTML(url, None)
	for line in response:
		subjectURLStr = extractInfoFromLine(line, '<li><a href="academics/', '<li><a href="academics/', '">')
		if subjectURLStr and "catalog" not in subjectURLStr and "bustec-courses" not in subjectURLStr:
			subjectURL = url + '/' + subjectURLStr
			subjectHTML = getHTML(subjectURL, None)
			subject = extractInfo(subjectHTML, '<meta name="description" content="', '<meta name="description" content="', '">')
			if "(" in subject:
				subject = subject[0 : subject.index("(")]
			subject = subject.rstrip(' ')
			clearLine()
			print "\rSearching", subject + "...",
			facultyURLStr = extractInfo(subjectHTML, '-faculty">', '<li><a href="academics/' + subjectURLStr, '-faculty">')
			if facultyURLStr:
				facultyURL = subjectURL + '/' + facultyURLStr + '-faculty'
				facultyHTML = getHTML(facultyURL, None)
				facultyNamesHTML = extractCourseInfo(facultyHTML, '<div class="calendarcontent">', "</div>")
				for line2 in facultyNamesHTML:
					if '<a href="mailto:' not in line2:
						continue
					if '<br />' in line2:
						facultyName = extractInfoFromLine(line2, '', '', '<br />')
					else:
						facultyName = extractInfoFromLine(line2, '', '', '</span>')
					if "(" in facultyName:
						facultyName = facultyName[0 : facultyName.index("(")].rstrip(' ')
					if facultyName.find("Dean") != -1 and facultyName.find("Dean") != 0:
						facultyName = facultyName[0 : facultyName.index("Dean")]
					facultyEmail = extractInfoFromLine(line2, '', '<a href="mailto:', '">Email')
					if ' ' in facultyEmail:
						facultyEmail = facultyEmail[0 : facultyEmail.find(' ')]
					if '(' in line2:
						facultyPhone = line2[line2.rindex('(') : line2.rindex('(') + 14].rstrip('<')
					else:
						facultyPhone = None
					if not filter(lambda person: person['name'] == facultyName, facultyMembers):
						facultyMembers.append({"name" : facultyName})
						facultyMembers[-1]["email"] = facultyEmail
						facultyMembers[-1]["phone"] = facultyPhone
						facultyMembersNum = facultyMembersNum + 1
	clearLine()
	print "\rSuccessfully found ", facultyMembersNum, " faculty members.\n"
	
	print "Parsing the instructors..."
	instructorCount = 0
	object["instructors"] = []
	# Create list of all professors
	for item in object["classes"]:
		for classTime in item["classTimes"]:
			if classTime["instructor"] != "TBA":
				if not filter(lambda person: person['name'] == classTime["instructor"], object["instructors"]):
					object["instructors"].append({"name" : classTime["instructor"]})
					object["instructors"][-1]["classList"] = []
					object["instructors"][-1]["classHours"] = 0
					object["instructors"][-1]["rateMyProfessor"] = None
					object["instructors"][-1]["classTimes"] = {}
					object["instructors"][-1]["classTimes"]["M"] = []
					object["instructors"][-1]["classTimes"]["T"] = []
					object["instructors"][-1]["classTimes"]["W"] = []
					object["instructors"][-1]["classTimes"]["Th"] = []
					object["instructors"][-1]["classTimes"]["F"] = []
					object["instructors"][-1]["classTimes"]["Sa"] = []
					object["instructors"][-1]["subjects"] = []
					object["instructors"][-1]["email"] = None
					object["instructors"][-1]["office"] = None
					object["instructors"][-1]["phone"] = None
					instructorCount += 1
	# Populate information about professors
	for item in object["classes"]:
		for classTime in item["classTimes"]:
			if classTime["instructor"] != "TBA":
				for professor in object["instructors"]:
					if classTime["instructor"] == professor["name"]:
						professor["classList"].append({item["courseTitle"] : classTime["classNum"]})
						subject = item["courseTitle"][0 : item["courseTitle"].index(" ")]
						if subject not in professor["subjects"]:
							professor["subjects"].append(subject)
							professor["subjects"].sort()
						days = classTime["days"].split()
						for day in days:
							if classTime["lecTime"] and classTime["lecTime"] != "TBA" and classTime["lecTime"] not in professor["classTimes"][day]:
								professor["classTimes"][day].append(classTime["lecTime"])
								professor["classTimes"][day].sort(sortTimes)
								professor["classHours"] += calcTime(classTime["lecTime"])
							if classTime["labTime"] and classTime["labTime"] != "TBA" and classTime["labTime"] not in professor["classTimes"][day]:
								professor["classTimes"][day].append(classTime["labTime"])
								professor["classTimes"][day].sort(sortTimes)
								professor["classHours"] += calcTime(classTime["labTime"])

	# Populate professors email and phone numbers
	for professor in object["instructors"]:
		for faculty in facultyMembers:
			lastName = professor["name"][3:]
			if lastName in faculty["name"] and professor["name"][0] == faculty["name"][0]:
				professor["name"] = faculty["name"]
				professor["email"] = faculty["email"]
				professor["phone"] = faculty["phone"]
			
	
	# Convert class hours to easy-to-read format
	for professor in object["instructors"]:
		professor["classHours"] = convertTime(professor["classHours"])
	print "Successfully added", instructorCount, " instructors.\n"
	
def sortTimes(a, b):
	aNum = int(a[0]) * 10 + int(a[1]) + (int(a[3]) * 10 + int(a[4]))/60 
	if a[5] == "P" and not (a[0] == "1" and a[1] == "2"):
		aNum += 12
	bNum = int(b[0]) * 10 + int(b[1]) + (int(b[3]) * 10 + int(b[4]))/60 
	if b[5] == "P" and not (b[0] == "1" and b[1] == "2"):
		bNum += 12
		
	if aNum < bNum:
		return -1
	elif bNum < aNum:
		return 1
	else:
		return 0

def calcTime(time):
	startTime = float(time[0]) * 10 + float(time[1]) + (float(time[3]) * 10 + float(time[4]))/60
	if time[5] == "P" and not (time[0] == "1" and time[1] == "2"):
		startTime += 12
	endTime = float(time[8]) * 10 + float(time[9]) + (float(time[11]) * 10 + float(time[12]))/60 
	if time[13] == "P" and not (time[8] == "1" and time[9] == "2"):
			endTime += 12
	timeWorked = endTime - startTime
	return timeWorked

# Converts hours from 10.5 format to 10hr 30min format
def convertTime(time):
	hours = int(time)
	mins = round((time - hours) * 60, 2)
	if mins == 60:
		hours = hours + 1
		mins = 0
	if not mins:
		mins = 0.0
	return str(hours) + "hr " + str(mins).rstrip('0').rstrip('.') + "min"

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
		
		object["events"].append({"title" : title})
		object["events"][-1]["date"] = date
		object["events"][-1]["location"] = location
		object["events"][-1]["description"] = description
		eventCount += 1
	print "Successfully parsed", eventCount, "events."

def Main():
	classList = {}
	
	response = getHTML("http://www.losrios.edu/schedules_reader_all.php?loc=flc/fall/index.html", "class schedule")
	response1, response2 = itertools.tee(iter(response)) # create multiple iterable versions of the response
	
	populateClasses(classList, response1)
	populateSubjects(classList, response2)
	populateInstructors(classList, "http://www.flc.losrios.edu/academics")
	populateEvents(classList, "http://www.flc.losrios.edu/x65?view=month")
	
	r = json.dumps(classList, sort_keys=True, indent=4, separators=(',', ': '))
	f = open('../www/backend.json', 'w')
	f.write(r)
	
	f.close()
Main()