from getClasses import getClasses
from getEvents import getEvents
from getInstructors import getInstructors
from getSubjects import getSubjects

def updateAll():
	getSubjects()
	getEvents()
	getClasses() # currently this MUST be called before instructors (TODO: fix that)
	getInstructors()

updateAll()

