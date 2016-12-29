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

def deriveInstructorsFromCourses(instructors, courses):
	print "Parsing the instructors from courses..."
	instructorCount = 0
	# DERIVED INFO, SEPARATE THIS OUT LATER
	# Create list of all professors
	for course in courses:
		for classTime in course["classes"]:
			if classTime["instructor"] != "TBA":
				if not filter(lambda person: person['name'] == classTime["instructor"], instructors):
					instructors.append({"name" : classTime["instructor"]})
					instructors[-1]["classList"] = []
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
	for course in courses:
		for classTime in course["classes"]:
			if classTime["instructor"] != "TBA":
				for professor in instructors:
					if classTime["instructor"] == professor["name"]:
						professor["classList"].append(classTime["id"])
						subject = course["courseTitle"][0 : course["courseTitle"].index(" ")]
						if subject not in professor["subjects"]:
							professor["subjects"].append(subject)
							professor["subjects"].sort()
						days = classTime["days"].split()
						for day in days:
							if classTime["lecTime"] and classTime["lecTime"] != "TBA" and classTime["lecTime"] not in professor["classTimes"][day]:
								professor["classTimes"][day].append(classTime["lecTime"])
								professor["classTimes"][day].sort(utils.sortTimes)
								professor["classHours"] += utils.calcTime(classTime["lecTime"])
							if classTime["labTime"] and classTime["labTime"] != "TBA" and classTime["labTime"] not in professor["classTimes"][day]:
								professor["classTimes"][day].append(classTime["labTime"])
								professor["classTimes"][day].sort(utils.sortTimes)
								professor["classHours"] += utils.calcTime(classTime["labTime"])
	print "Successfully added", instructorCount, " instructors.\n"
	
def deriveAndDetailInstructors():
	instructors = []
	if os.path.isdir('/tmp'):
		# For reading on AWS Lambda
		filePath = '/tmp/courses.json'
	else:
		# For reading locally
		filePath = 'courses.json'

	deriveInstructorsFromCourses(instructors, json.load(open(filePath)))
	getInstructorDetails(instructors, "http://www.flc.losrios.edu/academics")
	
	if os.path.isdir('/tmp'):
		# For writing on AWS Lambda
		filePath = '/tmp/instructors.json'
	else:
		# For writing locally
		filePath = 'instructors.json'

	with open(filePath, 'w') as f:
		f.write(json.dumps(instructors, indent=4, separators=(',', ': ')))

if __name__ == "__main__":
	deriveAndDetailInstructors()