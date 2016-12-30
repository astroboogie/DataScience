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

# @Param - Object, holds the json data
# @Param - url
def populateCourses(courses, url):
	response = utils.getHTML(url, "courses")
	print "Parsing the courses..."
	coursesCount = 0
	while True:
		courseInfo = utils.extractCourseInfo(response, "<!--Course Title-->", "<center><hr width=60%></center>")
		if not courseInfo:
			break

		courseTitle = utils.extractInfo(courseInfo, "Course Title", "<b>", "    ")
		if not courseTitle:
			continue
		coursesCount += 1
		
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
	print "Successfully added ", coursesCount, " courses.\n"

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
	getCourses()