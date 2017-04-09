#[Master]Must be controlled before use!


from __future__ import division
import xml.etree.cElementTree as ElementTree
import urllib2
import json
import os

beg = 1
end = 200000
div = 400
breakpoint = 192501
rate = end/div
os.system('cls')
print '{0}\r'.format("Completion: 0%"),
for i in range(0,div):
	if(beg*rate*i+1 >= breakpoint):
		xmldict = {}
		ids = ""
		for id in range(int(beg*rate*i+1), int(beg*rate*i+rate)):
			ids +=str(id) + ","
		ids += str(int(beg*rate*i+rate))
		url_str = 'https://www.boardgamegeek.com/xmlapi/boardgame/'+ids+'&stats=1'
		file = urllib2.urlopen(url_str)
		data = file.read()
		boardgames = ElementTree.XML(data)
		completion = str((100/div)*(i+1))
		#loop over items in xml
		for boardgame in boardgames:
			id = int(boardgame.attrib["objectid"])
			print '{0}\r'.format("Completion: " + completion[:completion.index(".")] + "%. Extracting games within " + str(int(beg*rate*i+1)) +  " and " + str(int(beg*rate*i+rate))),
			xmldict[id] = {}
			for item in boardgame:
				attributes = item.items()
				#retrieval of field's value
				if(attributes):
				#	#particular case: there are multiple names associated with each boardgame. We select only the original one
					filteredList = [attribute[1] for attribute in attributes if attribute[0] == "primary"]
					if(len(filteredList) == 1):
						if(item.tag == "name"):
							xmldict[id][item.tag] = item.text
					else:
						if(item.tag not in xmldict[id]):
							xmldict[id][item.tag] = []
						if("objectid" in item.attrib):
							xmldict[id][item.tag].append(item.text)
				elif(item.text):
					xmldict[id][item.tag] = item.text.replace('"', "'")

				for subcategory in item:
					if( subcategory.tag == "ratings"):
						for leaf in subcategory:
							if(leaf.tag == "average" or leaf.tag == "usersrated"):
								xmldict[id][leaf.tag] = leaf.text
		file = open("jsons/bgg_"+str(int(beg*rate*i+1))+"_"+str(int(beg*rate*i+rate))+".json", "w")
		file.write(json.dumps(xmldict))
#print data
