import os
import sys
import os.path
import subprocess
import shutil
import hashlib
import json
from distutils.dir_util import copy_tree

MANIFEST_VERSION = sys.argv[3]
MANIFEST_URL = sys.argv[1]
EXPORT_FOLDER = sys.argv[2]
DEBUG = ''
if len(sys.argv) > 4:
    DEBUG = sys.argv[4]

def removeThumb(name,fullName):
    if fullName.split('.')[2] == 'db':
        print('remove: ' + fullName) 
        os.remove(fullName)
    return

def walk_dir(dir,cb):
    if os.path.isfile(dir):
        cb(dir)
    else:
        for dirpath, filenames in os.walk(dir):
            for filename in [f for f in filenames]:
                fullName = os.path.join(dirpath, filename)
                cb(dir,fullName)
    return 

#! remove all thumbs files.
print('removing thumb file!!!')
#! walk_dir('./src',removeThumb('name','fu.ll.Na.me'))
#! walk_dir('./res',removeThumb('name','fu.ll.Na.me'))

#! copy 'res','src' into 'export folder'
print ('copy all file from "res" into temp foler!!!')
copy_tree('./res','./export/res/')

#! copy original file 'data.js'
shutil.copy2('./src/data.js','./data.js')

#! Copy and export 'data.js' to 'src'
#! print 'Encrypt battle json data'
#! item = subprocess.Popen(['python','json2js.py','./res/json/data/','effects,heroes,mining_rule,monsters,skills,equipments,consumable_items','./src/','data'],
#!                        shell=True, stdout=subprocess.PIPE)
#! for line in item.stdout:
#!    print line

print('create game.js!!!') 
item = subprocess.Popen(['python3','ggclosure.py'], shell=False, stdout=subprocess.PIPE)

print('run ggclousure.py') 
for line in item.stdout:
    print (line)

if DEBUG != 'debug':
    #! compile main.js to main.jsc
    print('-------------- complile')
    item = subprocess.Popen(['cocos','jscompile','-s','./export/src/','-d','./export/src/'], shell=False, stdout=subprocess.PIPE)
    for line in item.stdout:
        print (line)
    os.remove('./export/src/game.js')
    print('-------------- complile done')

#! rollback file 'data.js'
shutil.copy2('./data.js','./src/data.js')

#! run version_generator.js
print ('create "project.manifest","version.manifest"!!!')
tempFolder = './export/'
item = subprocess.Popen(['node','version_generator.js', '-v', MANIFEST_VERSION, '-u', MANIFEST_URL, '-s', tempFolder, '-d', tempFolder],
                        shell=False, stdout=subprocess.PIPE)
for line in item.stdout:
    print (line)

print ('injecting "project.json","project.manifest", "version.manifest"')
shutil.copy2('./project.json',tempFolder+'project.json')
#! inject 'game.js' into project.json

with open(tempFolder+'project.json') as json_file:
    proj = json.load(json_file)
    proj['jsList'] = ['src/game.js']

with open(tempFolder+'project.json', 'w') as json_file:
    json.dump(proj,json_file,indent=4, sort_keys=True)

#! inject 'project.json' into 'project.manifest'
filehash = hashlib.md5()
projectJson = open('./project.json').read()
filehash.update(projectJson.encode('utf-8'))
md5JSON = filehash.hexdigest()

projectManifest = open(tempFolder+'project.manifest').read()
filehash.update(projectManifest.encode('utf-8'))
md5Manifest = filehash.hexdigest()
projectJson = {}

with open(tempFolder+'project.manifest') as json_file:
    projectJson = json.load(json_file)
    projectJson['assets']['project.json'] = {
        'md5': md5JSON,
        'size':100
    }
    projectJson['assets']['res/project.manifest'] = {
        'md5': md5Manifest,
        'size':100
    }

with open(tempFolder+'project.manifest', 'w') as json_file:
    json.dump(projectJson,json_file,indent=4, sort_keys=True)

#! copy 'project.manifest' into export 'res'
shutil.copy2(tempFolder+'project.manifest',tempFolder+'/res/')

#! export
print ('export to: ' + EXPORT_FOLDER)
copy_tree(tempFolder,EXPORT_FOLDER)
shutil.rmtree(tempFolder)
os.remove('./data.js')

print ('EXPORT SUCCESSFULLY!')
