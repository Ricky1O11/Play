from os import listdir
from os.path import isfile, join
from os import walk

def file_len(fname):
	i = 0
	with open(fname) as f:
		for i, l in enumerate(f):
			pass
	return i + 1


#client count
clientCount = 0
longestClientFile = ""
longestClientFileLength = 0
files = []
for (dirpath, dirnames, filenames) in walk("Client/play"):
	for filename in filenames:
		files.append(dirpath+"/"+filename)

for file in files:
	if('.html' in file or '.js' in file or '.css' in file):
		fileLength = file_len(file)
		clientCount += fileLength
		if(fileLength > longestClientFileLength):
			longestClientFile = file
			longestClientFileLength = fileLength
print "Lines in client: " + str(clientCount)
print "Longest server file: " + longestClientFile + " Length: " + str(longestClientFileLength)
#server count
serverCount = 0
longestServerFile = ""
longestServerFileLength = 0
serverFiles = []
for (dirpath, dirnames, filenames) in walk("Server/play"):
	for filename in filenames:
		serverFiles.append(dirpath+"/"+filename)

for file in serverFiles:
	if('py' in file[-2:]):
		fileLength = file_len(file)
		serverCount += fileLength
		if(fileLength > longestServerFileLength):
			longestClientFile = file
			longestServerFileLength = fileLength
print "Lines in server: " + str(serverCount)
print "Longest server file: " + longestServerFile + " Length: " + str(longestServerFileLength)
print "Total lines: " + str(clientCount + serverCount)