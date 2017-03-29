FROM maven:3-jdk-8-onbuild

# Install built package
RUN tar -xvzf target/grib2json-*.gz
RUN cp grib2json-*/bin/* /usr/bin
RUN cp grib2json-*/lib/* /usr/lib

CMD grib2json $ARGS

