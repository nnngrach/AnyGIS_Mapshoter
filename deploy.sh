#!/bin/bash

echo "============================="
echo "Mapshoter auto deploying tool"
echo "deploy to all accounts? y/n"
echo "============================="

# Reading run mode
read runMode

accountsListFile="deployingBase.sh"


# Iterate for all accounts list
IFS=$'\n'
for line in $(cat $accountsListFile)
	do
	echo "=========="	
	i=0


	# Load data for current account
	IFS=:
	for rowValue in $line
		do

		case $i in
	     	0)      
	          	login=$rowValue
	          	;;
	     	*)
	          	serverName=$rowValue
	          	;;
		esac

		((i++))
	done


	


	afplay /System/Library/Sounds/Sosumi.aiff
	echo "$serverName $login"

	/usr/bin/open -a "/Applications/Google Chrome.app" 'https://dashboard.heroku.com/apps'
	read justEnter

	yes y | heroku login
	#read justEnter

	heroku container:login
	heroku git:remote -a "$serverName"-mapshoter
	heroku container:push web
	heroku container:release web


	# For OneAccountDeploying finish here
	if [ "$runMode" = 'n' ] 
		then
        	break
		fi 

done

echo "=============================="
echo "Mapshoter auto deploying DONE!"
echo "=============================="
