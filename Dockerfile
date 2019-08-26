FROM maven:3-jdk-8-onbuild as builder

# Install built package
RUN tar -xvzf target/grib2json-*.gz
RUN mkdir -p /output/bin/ /output/lib/
RUN cp grib2json-*/bin/* /output/bin/
RUN cp grib2json-*/lib/* /output/lib/

FROM openjdk:8-jre-alpine
COPY --from=builder /output/bin/ /usr/bin
COPY --from=builder /output/lib/ /usr/lib

CMD grib2json $ARGS
