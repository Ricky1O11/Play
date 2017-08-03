from __future__ import division
import xml.etree.cElementTree as ElementTree
import urllib2
import json
import os
import threading
import time

def getDataFromBgg(start,end):
    print "started"
    xmldict = {}
    ids = ""
    for id in range(int(start),int(end)):
        ids +=str(id) + ","
    ids += str(end)
    url_str = 'https://www.boardgamegeek.com/xmlapi/boardgame/'+ids+'&stats=1'
    file = urllib2.urlopen(url_str)
    data = file.read()
    boardgames = ElementTree.XML(data)
    #loop over items in xml
    for boardgame in boardgames:
        id = int(boardgame.attrib["objectid"])
        xmldict[id] = {}
        for item in boardgame:
            attributes = item.items()
            #retrieval of field's value
            if(attributes):
            #   #particular case: there are multiple names associated with each boardgame. We select only the original one
                filteredList = [attribute[1] for attribute in attributes if attribute[0] == "primary"]
                if(len(filteredList) == 1):
                    if(item.tag == "name"):
                        xmldict[id][item.tag] = item.text
                else:
                    if(item.tag not in xmldict[id] and item.tag not in exclusion_array):
                        xmldict[id][item.tag] = {}
                        if("objectid" in item.attrib):
                            if(item.tag == "boardgameexpansion"):
                                if("inbound" not in item.attrib):
                                    xmldict[id]["is_expanded_by"] = {}
                                    xmldict[id]["is_expanded_by"][item.attrib["objectid"]] = {"name":item.text}
                                else:
                                    xmldict[id]["expands"] = {}
                                    xmldict[id]["expands"][item.attrib["objectid"]] = {"name":item.text}
                            elif(item.tag == "boardgamecategory" or item.tag == "boardgamedesigner" or item.tag == "boardgamepublisher"):
                                    xmldict[id][item.tag][item.attrib["objectid"]] = {"name":item.text}
                            else:
                                xmldict[id][item.tag][item.attrib["objectid"]] = item.text
            elif(item.text):
                xmldict[id][item.tag] = item.text.replace('"', "'")

            for subcategory in item:
                if( subcategory.tag == "ratings"):
                    for leaf in subcategory:
                        if(leaf.tag == "average" or leaf.tag == "usersrated"):
                            xmldict[id][leaf.tag] = leaf.text
    file = open("jsons/bgg_"+str(start)+"_"+str(end)+".json", "w")
    file.write(json.dumps(xmldict))
    
    print "finished"


################MAIN FUNCTION####################
if __name__ == "__main__":
    threads = 5
    beg = 1
    end = 5000
    div = 4
    breakpoint = 0
    thread_rate = end/threads
    rate = thread_rate/div

    exclusion_array = [
        "rpgartist", 
        "rpgdesigner", 
        "rpgpublisher", 
        "videogamedeveloper", 
        "videogamepublisher", 
        "videogamebg", 
        "boardgamepodcastepisode"
    ]

    print str(div) + " threads launched"

    thread_array = []
    cont = []
    start = 1
    end = 250
    for i in range(0,threads):
        content = []
        for j in range(0,div):
            content.append(threading.Thread(target=getDataFromBgg,  args=(start,end) ))
            start +=rate
            end +=rate
        thread_array.append(content)

    for thread_set in thread_array:
        print thread_set
        for thread in thread_set:
            thread.start()
        for thread in thread_set:
            thread.join()

