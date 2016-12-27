from getClasses import getClasses
from getEvents import getEvents
from deriveAndDetailInstructors import deriveAndDetailInstructors
from getSubjects import getSubjects
import boto3
import os

def getAll():
	getSubjects()
	getEvents()
	getClasses()

def deriveAll():
	deriveAndDetailInstructors()

def uploadAll():
	s3 = boto3.resource('s3')
	bucket = s3.Bucket('flc-app-data')
	
	if os.path.isdir('/tmp'):
		fileDirectory = '/tmp'
		filePath = '/tmp/'
	else:
		fileDirectory = '.'
		filePath = ''
	
	filesUploaded = 0
	print 'Loading files to AWS...'
	for file in os.listdir(fileDirectory):
		if file.endswith('.json'):
			fileData = open(filePath + file, 'rb')
			# Uplad file and set permissions and metadata
			bucket.put_object(Key=file, ACL='public-read', Body=fileData, ContentType='application/json')
			filesUploaded += 1
	print 'Successfully loaded', filesUploaded, 'files.\n'

def updateAll():
	getAll()
	deriveAll()
	uploadAll()

if __name__ == "__main__":
	updateAll()

# This is the function that AWS Lambda looks for to execute
def lambda_handler(event, context):
	updateAll()
	return 'Hello from Lambda'