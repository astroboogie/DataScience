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
			subjects.append({subjectAbbrev : subjectReadable})
			subjectCount += 1
	print "Successfully added ", subjectCount, " subjects.\n"

def getSubjects():
	subjects = []
	url = "http://www.losrios.edu/schedules_reader_all.php?loc=flc/fall/index.html"
	populateSubjects(subjects, url)
	
	if os.path.isdir('/tmp'):
		# For writing on AWS Lambda
		filePath = '/tmp/subjects.json'
	else:
		# For writing locally
		filePath = 'subjects.json'
		
	with open(filePath, 'w') as f:
		f.write(json.dumps(subjects, indent=4, separators=(',', ': ')))

if __name__ == "__main__":
	getSubjects()