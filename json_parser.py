import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import threading
import json
from os import listdir
from os.path import isfile, join


done_files = 0
# Retrieve data from json representation of boardgamegeek database
def populateDB(min, max):
    global done_files
    for in_file in in_files[min:max]:
        done_files+=1
        print done_files
        file = open(join("jsons", in_file), "r")
        text = file.read()

        data = json.loads(text)
        file.close()
        boundaries = [int(s) for s in in_file.replace(".","_").split("_") if s.isdigit()]
        for i in range(int(boundaries[0]),int(boundaries[1])):

                if(str(i) in data and (current_boardgames == None or str(i) not in current_boardgames)):
                #if(str(i) in data):
                    game = data[str(i)]
                    if("rpgartist" in game or 
                        "rpg" in game or 
                        "rpgdesigner" in game or 
                        "rpgpublisher" in game or 
                        "videogame" in game or 
                        "videogametheme" in game or 
                        "videogamemode" in game or 
                        "videogamedeveloper" in game or
                        "videogamepublisher" in game):
                        a = ""
                    else:
                        boardgame = addBoardgame(i, game)
                        template = addTemplate(i, basicTemplate)

def addBoardgame(i, game):
    basics_field_array = ["bggId", "average", "description", "image", "name", "usersrated", 
    "maxplayers", "minplayers", "maxplaytime", "minplaytime", "age", "playingtime", "yearpublished", "thumbnail", "expands", "is_expanded_by"]

    gameCompleteObject = {}
    gameSimpleObject = {}
    gameCompleteObject["bggId"] = i
    gameSimpleObject["bggId"] = i
    
    for field in basics_field_array:
        if(field in game):
            if field == "name":
                gameCompleteObject["name"] = game[field]
                gameSimpleObject["name"] = game[field]
                gameCompleteObject["search_name"] = game[field].lower()
                gameSimpleObject["search_name"] = game[field].lower()
            elif field == "thumbnail" or field == "average" or field == "image":
                gameCompleteObject[field] = game[field]
                gameSimpleObject[field] = game[field]
            else:
                gameCompleteObject[field] = game[field]

                if (field == "is_expanded_by"):
                    for bggId in gameCompleteObject[field]:
                        bg = boardgames_ref.child(str(bggId))
                        bg_get = bg.get()
                        if bg_get != None:
                            row = {}
                            if "name" in bg_get:
                                row["name"] = bg_get["name"]
                            if "image" in bg_get:
                                row["image"] = bg_get["image"]
                            if "thumbnail" in bg_get:
                                row["thumbnail"] = bg_get["thumbnail"]
                            gameCompleteObject[field][bggId] = row
                            row = {}
                            if "name" in game:
                                row["name"] = game["name"]
                            if "image" in game:
                                row["image"] = game["image"]
                            if "thumbnail" in game:
                                row["thumbnail"] = game["thumbnail"]
                            bg.child("expands").child(str(i)).update(row)
            
                if (field == "expands"):
                    for bggId in gameCompleteObject[field]:
                        bg = boardgames_ref.child(str(bggId))
                        bg_get = bg.get()
                        if bg.get() != None:
                            row = {}
                            if "name" in bg_get:
                                row["name"] = bg_get["name"]
                            if "image" in bg_get:
                                row["image"] = bg_get["image"]
                            if "thumbnail" in bg_get:
                                row["thumbnail"] = bg_get["thumbnail"]
                            gameCompleteObject[field][bggId] = row
                            row = {}
                            if "name" in game:
                                row["name"] = game["name"]
                            if "image" in game:
                                row["image"] = game["image"]
                            if "thumbnail" in game:
                                row["thumbnail"] = game["thumbnail"]
                            bg.child("is_expanded_by").child(str(i)).update(row)
        


    if("boardgamecategory" in game):
        gameCompleteObject["categories"] = game["boardgamecategory"]
        addFields("categories", game["boardgamecategory"], gameSimpleObject)
    if("boardgamedesigner" in game):
        gameCompleteObject["designers"] = game["boardgamedesigner"]
        addFields("designers", game["boardgamedesigner"], gameSimpleObject)
    #if("boardgamepublisher" in game):
    #    gameCompleteObject["publishers"] = game["boardgamepublisher"]
    #    addFields("publishers", game["boardgamepublisher"], gameSimpleObject)

    new_boardgame = boardgames_ref.child(str(i)).set(gameCompleteObject)


def addFields(field, val, boardgame):
    for key in val:
        vals = {}
        vals["name"] = val[key]["name"]
        vals["search_name"] = val[key]["name"].lower()
        references_dictionary[field].child(key).update(val[key])
        references_dictionary[field].child(key).child("boardgames").child(str(boardgame["bggId"])).set(boardgame)

def addTemplate(bggId, template):
        ref.child('boardgame_has_templates').child(str(bggId)).child("0").set(template)

################MAIN FUNCTION####################
if __name__ == "__main__":
    cred = credentials.Certificate('Server/Play/config/play-4fd54-firebase-adminsdk-qjpvd-aa91cb3eb8.json')
    default_app = firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://play-4fd54.firebaseio.com/'
    })

    # As an admin, the app has access to read and write all data, regradless of Security Rules
    ref = db.reference()
    boardgames_ref = ref.child('boardgames')
    categories_ref = ref.child('categories')
    designers_ref = ref.child('designers')
    publishers_ref = ref.child('publishers')

    references_dictionary = {
        "categories" : categories_ref,
        "designers" : designers_ref,
        "publishers" : publishers_ref,
    }
    #dbPopulated = populateDB()

    basicTemplate = {
        "has_expansions" : False,
        "name" : "Basic Template",
        "scoring_fields" : {
            0 : {
                "bonus" : 1,
                "name" : {
                    "it" : "Punti",
                    "en" : "Points"
                }
            }
        }
    }
    current_boardgames =boardgames_ref.get()
    #current_boardgames = ref.set("")
    thread_num = 20

    in_files = [f for f in listdir("jsons") if isfile(join("jsons", f))]

    file_per_list = len(in_files)/thread_num
    
    for i in range (0,thread_num):
        t = threading.Thread(target=populateDB,  args=(min(i,1)+i*file_per_list,(i+1)*file_per_list) )
        t.start()