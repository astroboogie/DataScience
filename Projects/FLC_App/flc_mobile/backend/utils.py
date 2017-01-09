import re
import string
import urllib2
import os
import json

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
		#info = info.replace("'", "")												 # remove quotes (messes up json parsing)
		info = info.replace('"', '')												 # remove quotes (messes up json parsing)
		info = re.sub(r'<.+?>', '', info)											 # remove any html elements in the line
		info = filter(lambda x: x in string.printable, info) 						 # remove non-printing characters
		info = info.replace("&amp;", "&")
	return info

def clearLine():
	print "\r                                                                                ",

# Returns -1 if A is a lesser time than B
# Very ugly, should be cleaned up
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

# Given a time in the DD:DDAM-DD:DDPM format, it calculates the time between the two in hours
# Note that A and P are interchangeable in the time format
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

def createDirectory(directory):
	try:
	    os.makedirs(directory)
	except OSError:
	    if not os.path.isdir(directory):
	        raise

def isLambdaEnv():
	if os.path.isdir('/tmp'):
		return True
	return False

def getAndCreateFilePath(directory, fileName):
	if isLambdaEnv():
		return '/tmp/' + directory + fileName + '.json'
	else:
		if directory:
			createDirectory(directory)
			return directory + '/' + fileName + '.json'
		return fileName + '.json'

def writeJSON(jsonData, filePath):
	with open(filePath, 'w') as f:
		f.write(json.dumps(jsonData, sort_keys=True, indent=4, separators=(',', ': ')))
