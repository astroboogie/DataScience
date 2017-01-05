import utils
import json
import os

# Subjects stores each subject in a key:value pattern
# Where the key is the abbreviated subject, and the value is the full subject
# e.g. "ANTH": "Anthropology"
def populateSubjects(subjects, url):
	response = utils.getHTML(url, "subjects")
	print "Parsing the subjects..."
	subjectCount = 0
	lindex = "</b></b><center><h3>"
	rindex = "</h3>"

	for line in response:
		if lindex in line and rindex in line:
			subject = line[line.index(lindex) + len(lindex) : line.rindex(rindex)]
			subjectAbbrev = subject[subject.find("(") + 1 : subject.find(")")]
			subjectReadable = subject[0 : subject.find("(")].rstrip(" ")
			subjects[subjectAbbrev] = subjectReadable
			subjectCount += 1
	print "Successfully added ", subjectCount, " subjects.\n"

def getSubjects(semesters):
	endpoints = semesters["endpoints"]
	for endpoint in endpoints:
		subjects = {}
		url = "http://www.losrios.edu/schedules_reader_all.php?loc=flc/" + endpoint + "/index.html"
		populateSubjects(subjects, url)

		filePath = utils.getAndCreateFilePath('subjects', endpoint)
		utils.writeJSON(subjects, filePath)

if __name__ == "__main__":
	getSubjects()
