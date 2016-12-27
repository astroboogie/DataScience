import utils
import json

def getInstructorDetails(object, url):
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
	for professor in object["instructors"]:
		for faculty in facultyMembers:
			lastName = professor["name"][3:]
			if lastName in faculty["name"] and professor["name"][0] == faculty["name"][0]:
				professor["name"] = faculty["name"]
				professor["email"] = faculty["email"]
				professor["phone"] = faculty["phone"]
			
	# Convert class hours to easy-to-read format
	for professor in object["instructors"]:
		professor["classHours"] = utils.convertTime(professor["classHours"])
	print "\rSuccessfully added details to ", facultyMembersNum, " faculty members.\n"

def deriveInstructorsFromClasses(object, classes):
	print "Parsing the instructors from classes..."
	instructorCount = 0
	object["instructors"] = []
	# DERIVED INFO, SEPARATE THIS OUT LATER
	# Create list of all professors
	for item in classes["classes"]:
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
					object["instructors"][-1]["id"] = str(instructorCount)
					instructorCount += 1
	
	# Populate information about professors
	for item in classes["classes"]:
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
								professor["classTimes"][day].sort(utils.sortTimes)
								professor["classHours"] += utils.calcTime(classTime["lecTime"])
							if classTime["labTime"] and classTime["labTime"] != "TBA" and classTime["labTime"] not in professor["classTimes"][day]:
								professor["classTimes"][day].append(classTime["labTime"])
								professor["classTimes"][day].sort(utils.sortTimes)
								professor["classHours"] += utils.calcTime(classTime["labTime"])
	print "Successfully added", instructorCount, " instructors.\n"
	
def deriveAndDetailInstructors():
	instructors = {}
	classes = json.load(open('classes.json'))
	
	deriveInstructorsFromClasses(instructors, classes)
	getInstructorDetails(instructors, "http://www.flc.losrios.edu/academics")
	
	r = json.dumps(instructors, sort_keys=True, indent=4, separators=(',', ': '))
	f = open('instructors.json', 'w')
	f.write(r)
	
	f.close()

if __name__ == "__main__":
	deriveAndDetailInstructors()