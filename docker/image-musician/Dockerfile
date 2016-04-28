FROM node:4.3.1
MAINTAINER Antoine Drabble & Guillaume Serneels

#
# When we build the image, we copy the executable jar in the image file system. 
#
COPY src /opt/app/

ENTRYPOINT ["node", "/opt/app/musician.js"]