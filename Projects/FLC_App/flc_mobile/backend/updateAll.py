from getClasses import getClasses
from getEvents import getEvents
from deriveAndDetailInstructors import deriveAndDetailInstructors
from getSubjects import getSubjects

def getAll():
	getSubjects()
	getEvents()
	getClasses()

def deriveAll():
	deriveAndDetailInstructors()

getAll()
deriveAll()
