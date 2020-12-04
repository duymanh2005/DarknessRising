import os
import sys
import os.path
import subprocess
import shutil
import hashlib
import json

print ('run ggclosure_log')
jsList = []
with open('./project.json') as json_file:
    jsList = json.load(json_file)['jsList']

newPaths = []
tempPath='s'
if not os.path.exists(tempPath):
    os.makedirs(tempPath)

f = open("ggclosure_log.txt", "w+")
print ('check the ggclosure_log.txt for details if get any warnings')
for i in range(len(jsList)):
    newPaths.append(tempPath+('/%d' % i)+".js")
    f.write('%s -> %s \n' % (jsList[i],newPaths[i]))
    shutil.copy(jsList[i],newPaths[i])

cmdChain = ['java','-jar','closure-compiler.jar']
cmdChain.append('--compilation_level')
cmdChain.append('SIMPLE_OPTIMIZATIONS')
cmdChain.append('--js')

for i in range(len(newPaths)):
    cmdChain.append(newPaths[i])

cmdChain.append('--js_output_file')
cmdChain.append('./export/src/game.js')

items = subprocess.Popen(cmdChain,
                  shell=False, stdout=subprocess.PIPE)

for line in items.stdout:
    print (line)

shutil.rmtree(tempPath)