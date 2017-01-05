import utils
import json
import os

def getInstructorDetails(instructors, url):
	# Assemble list of professors and their respective subjects from FLC Faculty page
	# These are stored as a temporary results to combine with the full instructor data
	print "Fetching faculty information..."
	facultyMembersNum = 0
	facultyMembers = []
	response = utils.getHTML(url, None)
	for line in response:
		subjectURLStr = utils.extractInfoFromLine(line, '<li><a href="academics/', '<li><a href="academics/', '">')
		if subjectURLStr and "catalog" not in subjectURLStr and "bustec-courses" not in subjectURLStr:
			subjectURL = url + '/' + subjectURLStr
			subjectHTML = utils.getHTML(subjectURL, None)
			subject = utils.extractInfo(subjectHTML, '<meta name="description" content="', '<meta name="description" content="', '">')
			if "(" in subject:
				subject = subject[0 : subject.index("(")]
			subject = subject.rstrip(' ')
			utils.clearLine()
			print "\rSearching", subject + "...",
			facultyURLStr = utils.extractInfo(subjectHTML, '-faculty">', '<li><a href="academics/' + subjectURLStr, '-faculty">')
			if facultyURLStr:
				facultyURL = subjectURL + '/' + facultyURLStr + '-faculty'
				facultyHTML = utils.getHTML(facultyURL, None)
				facultyNamesHTML = utils.extractCourseInfo(facultyHTML, '<div class="calendarcontent">', "</div>")
				for line2 in facultyNamesHTML:
					if '<a href="mailto:' not in line2:
						continue
					if '<br />' in line2:
						facultyName = utils.extractInfoFromLine(line2, '', '', '<br />')
					else:
						facultyName = utils.extractInfoFromLine(line2, '', '', '</span>')
					if "(" in facultyName:
						facultyName = facultyName[0 : facultyName.index("(")].rstrip(' ')
					if facultyName.find("Dean") != -1 and facultyName.find("Dean") != 0:
						facultyName = facultyName[0 : facultyName.index("Dean")]
					if '">Email' in line2:
						facultyEmail = utils.extractInfoFromLine(line2, '', '<a href="mailto:', '">Email')
					else:
						facultyEmail = utils.extractInfoFromLine(line2, '', '<a href="mailto:', '">')
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
						facultyMembersNum += 1
	utils.clearLine()

	# Populate professors email and phone numbers
	for professor in instructors:
		for faculty in facultyMembers:
			lastName = professor["name"][3:]
			if lastName in faculty["name"] and professor["name"][0] == faculty["name"][0]:
				professor["name"] = faculty["name"]
				professor["email"] = faculty["email"]
				professor["phone"] = faculty["phone"]

	# Convert class hours to easy-to-read format
	for professor in instructors:
		professor["classHours"] = utils.convertTime(professor["classHours"])
	print "\rSuccessfully added details to ", facultyMembersNum, " faculty members.\n"

def deriveInstructorsFromClasses(instructors, classes, endpoint):
	print "Parsing the instructors from courses..."
	classListKey = "classList_" + endpoint
	instructorCount = 0
	# Create list of all professors
	for item in classes:
		validInstructor = (item["instructor"] != "TBA")
		alreadyExists = filter(lambda person: person['name'] == item["instructor"], instructors)
		if validInstructor and not alreadyExists:
			instructors.append({"name" : item["instructor"]})
			instructors[-1][classListKey] = []
			instructors[-1]["classHours"] = 0
			instructors[-1]["classTimes"] = {}
			instructors[-1]["classTimes"]["M"] = []
			instructors[-1]["classTimes"]["T"] = []
			instructors[-1]["classTimes"]["W"] = []
			instructors[-1]["classTimes"]["Th"] = []
			instructors[-1]["classTimes"]["F"] = []
			instructors[-1]["classTimes"]["Sa"] = []
			instructors[-1]["subjects"] = []
			instructors[-1]["email"] = None
			instructors[-1]["office"] = None
			instructors[-1]["phone"] = None
			instructors[-1]["id"] = str(instructorCount)
			instructorCount += 1

	# Populate information about professors
	for item in classes:
		validInstructor = (item["instructor"] != "TBA")
		if validInstructor:
			for professor in instructors:
				if item["instructor"] == professor["name"]:
					if classListKey not in professor:
						professor[classListKey] = []
					professor[classListKey].append(item["id"])
					subject = item["courseTitle"][0 : item["courseTitle"].index(" ")]
					if subject not in professor["subjects"]:
						professor["subjects"].append(subject)
						professor["subjects"].sort()
					days = item["days"].split()
					for day in days:
						if day == "TBA":
							continue
						if item["lecTime"] and item["lecTime"] != "TBA" and item["lecTime"] not in professor["classTimes"][day]:
							professor["classTimes"][day].append(item["lecTime"])
							professor["classTimes"][day].sort(utils.sortTimes)
							professor["classHours"] += utils.calcTime(item["lecTime"])
						if item["labTime"] and item["labTime"] != "TBA" and item["labTime"] not in professor["classTimes"][day]:
							professor["classTimes"][day].append(item["labTime"])
							professor["classTimes"][day].sort(utils.sortTimes)
							professor["classHours"] += utils.calcTime(item["labTime"])
	print "Successfully added", instructorCount, " instructors.\n"

def deriveAndDetailInstructors(semesters):
	endpoints = semesters["endpoints"]
	instructors = []

	for endpoint in endpoints:
		if utils.isLambdaEnv():
			filePath = '/tmp/classes' + endpoint + '.json'
		else:
			filePath = 'classes/' + endpoint + '.json'
		deriveInstructorsFromClasses(instructors, json.load(open(filePath)), endpoint)

	getInstructorDetails(instructors, "http://www.flc.losrios.edu/academics")

	filePath = utils.getAndCreateFilePath('', 'instructors')
	utils.writeJSON(instructors, filePath)

if __name__ == "__main__":
	deriveAndDetailInstructors()
