#[Master]Must be controlled before use

from __future__ import division
import xml.etree.cElementTree as ElementTree
import urllib2
import json

beg = 1
end = 20
ids = range(beg, end)
xmldict = {}
for id in ids:
	print str(round((id/end)*100))[:-2] + "% Processing game number " + str(id) + "/"+str(end)+"..."
	try:
		url_str = 'https://www.boardgamegeek.com/xmlapi2/thing?id='+str(id)+'&stats=1'
		file = urllib2.urlopen(url_str)
		data = file.read()
		xml = ElementTree.XML(data)
		#loop over items in xml
		for item in xml:
			xmldict[id] = {}
			#loop over every field of the item
			for son in item:
				attributes = son.items()
				#retrieval of field's value
				if(attributes):
					#particular case: there are multiple names associated with each boardgame. We select only the original one
					filteredList = [attribute[1] for attribute in attributes if attribute[0] == "value"]
					
					if(len(filteredList) == 1):
						if(son.tag == "name"):
							if(len([attribute for attribute in attributes if "primary" in attribute]) == 1):
								xmldict[id][son.tag] = filteredList[0]
						else:
							xmldict[id][son.tag] = filteredList[0]
				#retrieval of text information associated to text fields
				elif(son.text):
					xmldict[id][son.tag] = son.text.replace('"', "'")
				
				for subcategory in son:
					if( subcategory.tag == "ratings"):
						for leaf in subcategory:
							if(leaf.tag == "average" or leaf.tag == "usersrated"):
									xmldict[id][leaf.tag] = [attribute[1] for attribute in leaf.items() if attribute[0] == "value"][0]
	except: pass
#print str(xmldict) + "\n\n"
file = open("bgg_"+str(beg)+"_"+str(end)+".json", "w")
file.write(json.dumps(xmldict))
#print data
