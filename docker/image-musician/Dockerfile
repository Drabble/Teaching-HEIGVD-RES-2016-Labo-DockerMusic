FROM node:4.3.1
MAINTAINER Antoine Drabble & Guillaume Serneels



#
# When we build the image, we copy the executable jar in the image file system. 
#
COPY src /opt/app/
#
# Install dependencies
#
RUN npm --prefix ./opt/app install ./opt/app

#	
#	Our	application	will	accept	TCP	connections	on	port	2205.	Note	that	the	EXPOSE	statement	
#	does	not	make	the	container	accessible	via	the	host.	For	the	container	to	really	be	accessible,	
#	we	must	either	use	the	-p	or	the	-P	flag	when	using	the	docker	run	command.	With	-p,	we	can	
#	specify	an	explicit	port	mapping	(and	EXPOSE	is	not	even	required).	With	-P,	we	let	Docker		
#	assign	random	ports	for	each	EXPOSEd	port.	We	can	then	use	the	docker	port	command	to	know	the	port	
#	numbers	that	have	been	selected.	
#	
EXPOSE	2205	

ENTRYPOINT ["node", "/opt/app/server.js"]
