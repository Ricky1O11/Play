import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

import json
from os import listdir
from os.path import isfile, join

# Retrieve data from json representation of boardgamegeek database
def populateDB():
    in_files = [f for f in listdir("jsons/trial") if isfile(join("jsons/trial", f))]
    expansionsDict = {}
    for in_file in in_files:
        #in_file = "bgg_1_500.json"
        file = open(join("jsons/trial", in_file), "r")
        text = file.read()

        data = json.loads(text)
        file.close()
        #try:
        boundaries = [int(s) for s in in_file.replace(".","_").split("_") if s.isdigit()]

        last_inserted = boardgames_ref.order_by_key().limit_to_last(1).get() #granted: all the previous games are already in the DB
        if(last_inserted):
            key, value = last_inserted.items()[0]
            start = value["bggId"]+1
        else:
            start = 1
        for i in range(start,int(boundaries[1])):
            if(str(i) in data):
                game = data[str(i)]
                if("rpgartist" in game or 
                    "rpgdesigner" in game or 
                    "rpgpublisher" in game or 
                    "videogamedeveloper" in game or
                    "videogamepublisher" in game):
                    print "Not a boardgame: skipped"
                else:
                    boardgame = addBoardgame(i, game)
                    #addCategories(game, boardgame)
                    #addDesigners(game, boardgame)
                    #addPublishers(game, boardgame)
        return True

def addBoardgame(i, game):
    basics_field_array = ["bggId", "average", "description", "image", "name", "usersrated", 
    "maxplayers", "minplayers", "maxplaytime", "minplaytime", "age", "playingtime", "yearpublished", "thumbnail", "expands", "is_expanded_by"]

    print "Boardgame id: " + str(i) + " START"
    gameCompleteObject = {}
    gameSimpleObject = {}
    gameCompleteObject["bggId"] = i
    gameSimpleObject["bggId"] = i
    
    for field in basics_field_array:
        if(field in game):
            gameCompleteObject[field] = game[field]
        if field == "name" or field == "thumbnail" or field == "average":
            gameSimpleObject[field] = game[field]
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
    print "Boardgame id: " + str(i) + " END"

def addFields(field, val, boardgame):
    for key in val:
        references_dictionary[field].child(key).update(val[key])
        references_dictionary[field].child(key).child("boardgames").child(str(boardgame["bggId"])).set(boardgame)

################MAIN FUNCTION####################
if __name__ == "__main__":
    cred = credentials.Certificate('Server/Play/config/play-5d098-firebase-adminsdk-lxldu-abcee1bab7.json')
    default_app = firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://play-5d098.firebaseio.com/'
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
    dbPopulated = populateDB()