# This pprogram return a list of strings indicating the latest semesters and
# the endpoints correlating to the latest semesters at the FLC schedule page.

import utils
import json
import re
import os

# Fills the given list with a string representing each active (non-archived) semester
def populateCurrentSemesters(semesters, endpoints, url):
    response = utils.getHTML(url, "current semesters")
    htmlComments = ["<!--", "-->"]
    print "Parsing for current semesters..."
    fall = "fall-class-schedules"
    spring = "spring-class-schedules"
    summer = "summer-class-schedules"

    for line in response:
        if "<!--" in line or "-->" in line:
            continue
        elif fall in line:
            semesters.append(utils.extractInfoFromLine(line, '', '-class-schedules.php">', '</a>'))
            endpoints.append("fall")
        elif spring in line:
            semesters.append(utils.extractInfoFromLine(line, '', '-class-schedules.php">', '</a>'))
            endpoints.append("spring")
        elif summer in line:
            semesters.append(utils.extractInfoFromLine(line, '', '-class-schedules.php">', '</a>'))
            endpoints.append("summer")

# Adds to the given list with string representations of archived classes (up to 3 total)
def populateArchivedSemesters(semesters, endpoints, url, semestersToAdd):
    if semestersToAdd <= 0:
        return
    response = utils.getHTML(url, "archived semesters")

    countLeftToAdd = semestersToAdd
    classScheduleString = '<a href="http://www.losrios.edu/class_schedules_reader.php?loc=flc/'
    for line in response:
        if countLeftToAdd <= 0:
            break
        if classScheduleString in line:
            endpoint = utils.extractInfoFromLine(line, classScheduleString, classScheduleString, "_schd/index.html")
            endpoints.append(endpoint)
            if "f" in endpoint:
                semesters.append("Fall 20" + endpoint[-2:])
            elif "su" in endpoint:
                semesters.append("Summer 20" + endpoint[-2:])
            elif "sp" in endpoint:
                semesters.append("Spring 20" + endpoint[-2:])
            countLeftToAdd -= 1


def getLatestSemesters():
    numOfSemestersToGet = 3
    semesters = []
    endpoints = []
    populateCurrentSemesters(semesters, endpoints, "http://www.losrios.edu/class-schedules.php")
    populateArchivedSemesters(semesters, endpoints, "http://www.losrios.edu/flc/flc_archive.php", numOfSemestersToGet - len(semesters))

    semestersObject = {}
    semestersObject["semesters"] = semesters
    semestersObject["endpoints"] = endpoints

    filePath = utils.getAndCreateFilePath('', 'semesters')
    utils.writeJSON(semestersObject, filePath)

    return semestersObject

if __name__ == "__main__":
	getLatestSemesters()
