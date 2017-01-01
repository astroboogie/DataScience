import os
import zipfile

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
