# This pprogram return a list of strings indicating the latest semesters and
# the endpoints correlating to the latest semesters at the FLC schedule page.

import utils
import json
import re
import os

# Fills the given list with a string representing each active (non-archived) semester
def populateCurrentSemesters(semesters, url):
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
            name = utils.extractInfoFromLine(line, '', '-class-schedules.php">', '</a>')
            endpoint = "fall"
            semesters.append({"name" : name, "endpoint" : endpoint})
        elif spring in line:
            name = utils.extractInfoFromLine(line, '', '-class-schedules.php">', '</a>')
            endpoint = "spring"
            semesters.append({"name" : name, "endpoint" : endpoint})
        elif summer in line:
            name = utils.extractInfoFromLine(line, '', '-class-schedules.php">', '</a>')
            endpoint = "summer"
            semesters.append({"name" : name, "endpoint" : endpoint})
    print "Successfully parsed current semesters."

# Adds to the given list with string representations of archived classes (up to 3 total)
def populateArchivedSemesters(semesters, url, semestersToAdd):
    if semestersToAdd <= 0:
        return
    response = utils.getHTML(url, "archived semesters")

    semestersRemainingToAdd = semestersToAdd
    classScheduleString = '<a href="http://www.losrios.edu/class_schedules_reader.php?loc=flc/'
    for line in response:
        if semestersRemainingToAdd <= 0:
            break
        if classScheduleString in line:
            endpoint = utils.extractInfoFromLine(line, classScheduleString, classScheduleString, "_schd/index.html")
            if "f" in endpoint:
                name = "Fall 20" + endpoint[-2:]
            elif "su" in endpoint:
                name = "Summer 20" + endpoint[-2:]
            elif "sp" in endpoint:
                name = "Spring 20" + endpoint[-2:]
            semesters.append({"name" : name, "endpoint" : endpoint})
            semestersRemainingToAdd -= 1

# Returns a numerical equivalent of the given semester.
# Given semester is of the form 'Fall 2015', 'Spring 2012'...
def hashSemester(semester):
    SEASONS = ['Spring', 'Summer', 'Fall', 'Winter']
    SEASON_ORDER = {season: order for order, season in enumerate(SEASONS)}
    season, year = semester.split(' ')
    return int(year) + (SEASON_ORDER[season] * 0.25)

def getLatestSemesters():
    numOfSemestersToGet = 3
    semesters = []
    populateCurrentSemesters(semesters, "http://www.losrios.edu/class-schedules.php")
    populateArchivedSemesters(semesters, "http://www.losrios.edu/flc/flc_archive.php", numOfSemestersToGet - len(semesters))
    semesters = sorted(semesters, key=lambda k: hashSemester(k['name']), reverse=True)

    filePath = utils.getAndCreateFilePath('', 'semesters')
    utils.writeJSON(semesters, filePath)

    return semesters

if __name__ == "__main__":
    getLatestSemesters()
