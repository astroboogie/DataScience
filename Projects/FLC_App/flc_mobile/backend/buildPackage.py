import os
import zipfile
import boto3

def uploadPackage():
	print "Uploading package to AWS..."
	client = boto3.client('lambda')
	zipFile = open('update-flc-app-data-package.zip', 'rb').read()
	client.update_function_code(FunctionName='FLC-App-Update-Data', ZipFile=zipFile)
	print "Successfully uploaded package.\n"

def buildPackage():
	zipFile = zipfile.ZipFile('update-flc-app-data-package.zip', 'w')
	curFile = os.path.basename(__file__)
	print 'Zipping files for Lambda package...'
	zipCount = 0
	for file in os.listdir('.'):
		if file.endswith('.py') and file != curFile:
			zipFile.write(file)
			zipCount += 1
	print 'Successfully zipped', zipCount, 'files.\n'

if __name__ == "__main__":
	buildPackage()
	uploadPackage()
